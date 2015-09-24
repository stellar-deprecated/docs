---
title: Federation
---

Stellar **federation** is a protocol that maps email-style addresses to a Stellar address. It's a way for Stellar software
to resolve `name*yourdomain.com` into `GCCVPYFOHY7ZB7557JKENAX62LUAPLMGIWNZJAFV2MITK6T32V37KEJU`. Federated addresses provide
an easy way for your users to share their Stellar address, using a syntax that interoperates across different domains supporting Stellar.

Additionally, federation can support attached memos. Just return the user's memo appended to the address in this format:
`<address>?id=<memo>`. 

Example: `name*yourdomain.com` -> `GCCVPYFOHY7ZB7557JKENAX62LUAPLMGIWNZJAFV2MITK6T32V37KEJU?id=123`.

## Supporting Federation

#### Step 1: Create [stellar.txt](/concepts/stellar.txt.md) file

Create a file called stellar.txt and put it at the root of your domain. The stellar.txt file is typically searched for in this order:

- `https://stellar.DOMAIN/stellar.txt`
- `https://DOMAIN/stellar.txt`
- `https://www.DOMAIN/stellar.txt`

#### Step 2: Add federation_url

Add the following to the stellar.txt file:

`[federation_url] https://api.yourdomain.com/federation`

#### Step 3: Implement federation url HTTP endpoint

The federation URL specified in your stellar.txt file should accept an HTTP GET request, with a query parameter --destination--
to specify the username and "domain" set to the domain of the address. It should return a JSON response body of this form:

`
federation_json: {
  destination: username,
  domain: domain,
  type: "federation_record",
  destination_address: address
}
`

