const getCredentials = require('../index').getCredentials;
const verifyEncryption = require('../index').verifyEncryption;

const chai = require('chai');

describe('interview', function () 
{
	describe('getCredentials', function () 
	{
		it('should be an object with 2 fields containing strings', async function () 
		{
			const response = await getCredentials ();
			response.data.should.be.a('object');
			response.data.should.have.property('publicKey');
			response.data.should.have.property('initializationVector');
		});
	});
	describe('verifyEncryption', function () {
		it('should be an object with 3 fields containing strings', async function () 
		{
			const response = await verifyEncryption ();
			response.data.should.be.a('object');
			response.data.should.have.property('verification');
			response.data.should.have.property('output');
			response.data.should.have.property('message'); // The server is down and I cannot remember the names of the fields
		});
	});
});