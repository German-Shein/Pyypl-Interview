const axios = require('axios');
const express = require('express');
const ecdsa = require('ecdsa-secp256k1');
const {createECDH, createCipheriv, createDecipheriv, createHash} = require('crypto');

const app = express ();
app.use(express.json());

const ecdh = createECDH ('secp256k1');
ecdh.generateKeys ();
const privateKey = ecdh.getPrivateKey();
const publicKey = ecdh.getPublicKey();
ecdh.setPrivateKey (privateKey);
ecdh.setPublicKey (publicKey);

const getCredentials = async () => await axios.get('https://integrations.dev.pyypl.io/infra/public-key-and-iv');

const encrypt = (plainText, key, iv) => 
{
	const cipher = createCipheriv('aes-256-cbc', key, iv);
	return Buffer.concat([cipher.update(plainText), cipher.final()]);
};

const decrypt = (plainText, key, iv) => 
{
	const decipher = createDecipheriv('aes-256-cbc', key, iv);
	return Buffer.concat([decipher.update(plainText), decipher.final()]);
};

const sign = encryptedString =>
{
	const privateKeyNum = ecdsa.randPrivateKeyNum();
	const hash = createHash('sha256').update(encryptedString).digest('hex');
	const numericHash = BigInt(`0x${hash}`);
	return ecdsa.sign(privateKeyNum, numericHash).toString ('hex');
}

const verifyEncryption = async (personalPublicKey, cipherText, initializationVector, signature) => await axios (
{
	method: 'post', 
	url: 'https://integrations.dev.pyypl.io/infra/cipher-and-signature', 
	data: 
	{
		publicKey: personalPublicKey.toString ('hex'),
		signature: signature,
		cipherText: cipherText.toString ('hex'),
		initializationVector: initializationVector.toString ('hex'),
	}
});

app.post ('/verify-encryption', (req, res) =>
{
	getCredentials ().then (response =>
	{
		const outsidePublicKey = Buffer.from (response.data.publicKey, "hex");
		const initializationVector = Buffer.from (response.data.initializationVector, "hex");
		const secret = ecdh.computeSecret (outsidePublicKey);
		const encryptedString = encrypt (JSON.stringify (req.body), secret, initializationVector);
		const signature = sign (encryptedString);
		verifyEncryption (outsidePublicKey, encryptedString, initializationVector, signature).then (response2 =>
		{
			res.status (200).json (response2.data);
		}).catch (err =>
		{
			res.status (500).json ({error: err});
		});
	}).catch (err =>
	{
		res.status (500).json ({error: err});
	});
})

app.listen (3000);

module.exports = getCredentials;
module.exports = verifyEncryption;