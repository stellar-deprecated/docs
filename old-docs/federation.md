# Federation Overview

Stellar "federation" is a protocol which maps email style addressess to a stellar address. It's a way for Stellar software to resolve bob@yourdomain.com into gDSSa75HPagWcvQmwH7D51dT5DPmvsKL4q. Federated addresses provide an easy way for your users to share their Stellar address, using a syntax which interoperates across different domains supporting Stellar.

Additionally, federation can support destination tags. Just return the user's destination tag appended to the address in this format:
`<address>?dt=tag`. Example: bob@yourdomain.com -> gDSSa75HPagWcvQmwH7D51dT5DPmvsKL4q?dt=123.

# Supporting Federation

#### Step 1: Create stellar.txt file

Create a file called stellar.txt and put it at the root of your domain. In the stellar-lib javascript, the stellar.txt file is searched for in this order:

- `https://stellar.DOMAIN/stellar.txt`
- `https://DOMAIN/stellar.txt`
- `https://www.DOMAIN/stellar.txt`

#### Step 2: Add federation_url

Add the following to the stellar.txt file:

`[federation_url] https://api.yourdomain.com/federation`


#### Step 3: Implement federation url HTTP endpoint

The federation URL specified in your stellar.txt file should accept an HTTP GET request, with a query parameter “destination” to specify the username. It should return a JSON response body of this form:

federation_json: {
  destination: username,
  domain: domain,
  type: "federation_record",
  destination_address: address
}
