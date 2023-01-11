### Pyypl Backend Challenge

Cryptography is an important part of our platform, and while not used on daily basis it does tend to surface in the most critical (and annoying :) moments. This little challenge is all about encrypting and signing a request using nodejs (feel free to use either a npm lib or the excellent, build-in, native node crypto library https://nodejs.org/api/crypto.html). I hope you'll find it both challenging as well as fun.

The primary goal of this challenge is to encrypt a random string (can be a json object or any plain-text string) post it to our api and proof that it was indeed sent by you, the client, and not intercepted by somenone else who impersonates you.

We provide an api to retrieve both our public key as well as the initilization vector needed for the encryption process. Those two values can be retrieved via the api call below:

```bash
curl "https://integrations.dev.pyypl.io/infra/public-key-and-iv"

```

This api will return a response similar to
```json
{
  "publicKey":"04907e53864452a98bf170a078ad95b68493044e2dd29c57dd584fb3f4d081892a5b07cdc45073b91f9d3b75d85a21ee2cc1867a6025ba83708979cc26f788990c",

  "initializationVector":"46e2b34cbee1f5c81862b622c7d3d5bf"
}
```
Both our public key as well as the initializationVector are HEX strings. 

Choose a random string of your choice (plain english or even just a stringified JSON object).

Both you, the client, as well we, the server, will use symmetric encryption to encrypt and decrypt that secret string. This should be implemented in the following way:

1. both parties will derive a shared key by Elliptic Curve Diffie-Hellman (ECDH) with issuer ephemeral keys over the secp256k1 elliptic curve. You can read more about Diffie-Hellman key exchange here: https://en.wikipedia.org/wiki/Diffie–Hellman_key_exchange

2. the client encrypts the secret string with aes-256-cbc symmetric encryption algorithm

3. BONUS (not strictly needed) the client signs the hash (shah256) of the cipher text (not the plain text) using its private key and ECDSA Elliptic Curve Signatures (you can read more about those here: https://cryptobook.nakov.com/digital-signatures/ecdsa-sign-verify-messages) - 

4. Finally, the client posts its public key, its derived cipher text and the signature alongside the initialization Vector (required for aes-256-cbc encryption) to the endpoint, as shown below. All values should be hex strings.


```bash
curl -X "POST" "https://integrations.dev.pyypl.io/infra/cipher-and-signature" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "publicKey": "0440f4e985f809a54d5bb9dedd5f8425a549c142df909432bc199acd297f470f3f7f941b3b275130d327da0defe043be92db7c6375288e14fc65911587796173e8",
  "signature": "3045022100ec57733555f29c88e83ad9873be55d399ab2a469d11faf959e7838aa0f5641fc02204edf7f729ce63f32cb60f070a1e4ec8a8be595d080e38e080f5402898f8754e4",
  "cipherText": "afaf682514327c063fcc12ed89d8daeb",
  "initializationVector": "46e2b34cbee1f5c81862b622c7d3d5bf"
}'

```

Please write a fully working nodejs program that fetches the data from our api, cryptographically manipulates a string, and finally posts it for verification to our second api.

Feel free to reach out in case you have any questions or encounter any issues while solving this challenge!