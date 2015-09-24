---
title: Stellar.txt
---

## Introduction

The stellar.txt file is used to provide the Internet with information about your domain's Stellar integration. Any website can publish Stellar network information. You can announce your validation key, your [federation](/concepts/federation.md) server, peers you are running, other validators in your quorum set, if you are a gateway, etc.

### Publishing stellar.txt

Given the domain "DOMAIN", the stellar.txt will be searched for in this order:

- https:/<span></span>/stellar.DOMAIN/stellar.txt
- https:/<span></span>/DOMAIN/stellar.txt
- https:/<span></span>/www.DOMAIN/stellar.txt

### Enabling cross-origin resource sharing (CORS)
You must enable CORS on the stellar.txt so people can access this file from other sites. The following HTTP header *must* be set for all requests to stellar.txt and its dependent files.

 Access-Control-Allow-Origin: *

**Important**: Only enable CORS for stellar.txt (or any files it references). For example, in Apache you would set something like:

```xml
<Location "/stellar.txt">
    Header set Access-Control-Allow-Origin "*"
</Location>
```

Or in nginx:

```json
location /stellar.txt {
 add_header 'Access-Control-Allow-Origin' '*';
}
```

For other webservers, see: http://enable-cors.org/server.html

### Testing CORS

1. Run a curl command in your terminal similar to the following (replace stellar.stellar.org with the hosting location of your stellar.txt file):

  ```bash
  curl --head https://stellar.stellar.org/stellar.txt
  ```

2. Verify the `Access-Control-Allow-Origin` header is present as shown below.

  ```bash
  curl --head https://stellar.stellar.org/stellar.txt
  HTTP/1.1 200 OK
  Accept-Ranges: bytes
  Access-Control-Allow-Origin: *
  Content-length: 482
  ...
  ```

3. Also run the command on a page that should not have it and verify the `Access-Control-Allow-Origin` header is missing.

## Stellar.txt example

```ini
Sample stellar.txt

This file is UTF-8 with Dos-, UNIX-, or Mac-style end of lines.
Blank lines and lines beginning with '#' are ignored.
Undefined sections are reserved.
No escapes are currently defined.


#   A list of accounts that are controlled by this domain.
[accounts]
GCZJM35NKGVK47BB4SPBDV25477PZYIYPVVG453LPYFNXLS3FGHDXOCM
GAENZLGHJGJRCMX5VCHOLHQXU3EMCU5XWDNU4BGGJFNLI2EL354IVBK7

#   A validation public key that is declared
#   to be used by this domain for validating ledgers and is the
#   authorized signature for the domain.
[validation_public_key]
GDQQVCQ32VRXPRIQ3RYCB7MGEVLWWDEWKAWGVTVBQ7SRPZEO75FVEOKI

#   List of IPs of known stellar-core's.
#   One ipv4 or ipv6 address per line.
#   A port may optionally be specified after adding a space to the address.
#   By convention, IPs are listed from most to least trusted, if that information is known.
[ips]
192.168.0.1
192.168.0.1 3939
2001:0db8:0100:f101:0210:a4ff:fee3:9566


#   List of Stellar validators in this node's quorum set.
#
[validators]
GDQQVCQ32VRXPRIQ3RYCB7MGEVLWWDEWKAWGVTVBQ7SRPZEO75FVEOKI
GA3XEKNSVXU6CT557FUFETEK3K7YUR5FN7CU2EE2452N2AKANC4N7B6T
GAP6O5XSXNZYMD2YTQOS3GEE6LUJZ3AWYAA62PVOMXMEVZESGL6UPECY
GCCVPYFOHY7ZB7557JKENAX62LUAPLMGIWNZJAFV2MITK6T32V37KEJU


#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
[federation_url]
https://api.stellar.org/federation

#   This section allows a gateway to declare currencies it currently issues.
#   [currency] [issuing address]
[currencies]
USD GCZJM35NKGVK47BB4SPBDV25477PZYIYPVVG453LPYFNXLS3FGHDXOCM
BTC GCZJM35NKGVK47BB4SPBDV25477PZYIYPVVG453LPYFNXLS3FGHDXOCM
LTC GAENZLGHJGJRCMX5VCHOLHQXU3EMCU5XWDNU4BGGJFNLI2EL354IVBK7
```

