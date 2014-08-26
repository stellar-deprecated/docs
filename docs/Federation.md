Stellar Federation
==================
The federation protocol allows payment systems to federate in the Stellar network via the creation of [gateways](Introduction-Gateways.md). Each gateway is responsible for creation and managing user accounts. Gateway users are provided a payment address similar to `user@wallet.com` while this address can be used to send and receive payments from any other user on the Stellar network. The main benefit for the user is the ability to remember and easily tell others her address.

## Implementation

1. The gateway generates for each user a Stellar address.
2. The gateway creates for each user a user name to identify their account in conjunction with the system's domain name. For example, `johnsmith` would be the user name and the full Stellar payment address would be `johnsmith@wallet.com`.
3. When somebody wants to pay to `johnsmith@wallet.com` he asks gateway `wallet.com` for the corresponding Stellar address
4. Gateway `wallet.com` answers with Stellar address. Answer is signed with `wallet.com` private key.
5. In the ledger all addresses are stored in a "normal" Stellar format.

## Security

Users of the service API will need to make sure they are in fact communicating with the intended gateway and that their connections to the service provider are not hijacked or spoofed.

The primary security mechanism is SSL. All connections will use the HTTPS protocol and must verify the certificate against the intended host name. The certificate path must be valid and the root CA must be trusted.

## API

## Service declaration

The gateway's [stellar.txt](Stellar.txt.md) indicates if and where the payment system makes the federation API is available:

```
# Inside stellar.txt
[federation_url]
https:<span></span>//wallet.com/stellar_federation
```
#### federation_url
> Specifies the url where the federation API is provided.

### Service request

A federation request parameters:

#### type
> Always set to `"federation"`.

#### user
> Requests the `tag` for the user be returned.

#### domain
> The domain of payment system.


Example request:
 GET /stellar_federation?type=federation&user=johndoe&domain=wallet.com

Successful response JSON:
 {
   "result" : "success",
   "federation_json" : {
     "type" : "federation_record",           // All signed objects should have a type.
     "domain" : <I>string</I>,               // Required.
     "user" : <I>string</I>,                 // Required.
     "destination_address" : <I>address</I>, // Required. Destination stellar address.
     "dt" : <I>string</I>,                   // Optional. Destination tag.
     "currencies" : [                        // Optional. Restrict to specific currencies.
        {
           "currency" : <I>currency</I>,     // Can be STR.
           "issuer" : <I>issuer</I>,         // Optional. (null is not valid)
        }
     ],
     "service_address" : <I>address</I>,     // Optional. stellar address of the federation service provider.
     "expires" : <I>date</I>,                // Optional. (defaults to forever)
     "signer" : <I>address</I>,
   },
   "public_key" : <I>string</I>,
   "signature" : <I>string</I>
 }

#### domain
> The domain for the payment system as per `[[stellar.txt]]`. No leading "`www.`". Echoed from the request.

#### user
> The UTF-8 string used to identify the recipient. Echoed from the request.

#### destination_address
> The account payment is to be sent to.

#### dt
> The 32 bit integer associated with the user. To be used when a payment is made.

#### currencies
> If not provided, all payments are accepted. Specify "STR" to enable STR. To accept no payments and merely provide the historical 
mapping specify `[]`.
#### service_address
> The account providing federation naming service.

#### expires
> When this entry is no longer valid. To allow compromised secrets to be replaced, expires should be set.

#### public_key
> The public key used in signing. It must correspond with the master or public key of the signing address.

#### signer
> The signer of the address.

#### signature
> The hex signature of `federation_json`. See [[RPC API#data_sign|RPC data_sign]].

Error response JSON:
```json
{
  "result" : "error",
  "error" : *string*,
  "error_message" : *string*,
  "request" : {
      *request keys and values*
  }
}
```

Error messages:

#### noSuchUser
> The supplied `user` was not found.

#### noSupported
> Look up by `tag` is not supported.

#### noSuchDomain
> The supplied `domain` is not served here.

#### invalidParams
> Missing or conflicting parameters.

#### unavailable
> Service is temporarily unavailable.
