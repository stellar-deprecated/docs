---
title: Identity Protocol
---

# Identity Protocol

Complying with AML laws requires financial institutions (FIs) to know not only who their customers are sending money to but who their customers are receiving money from. In some jurisdictions banks are able to trust the KYC procedures of other licensed banks. In other jurisdictions each bank must do its own sanction checking of both the sender and the receiver. 
The Identity Protocol handles all these scenarios.

The Identity Protocol is an additional step after [federation](https://www.stellar.org/developers/learn/concepts/federation.html). In this step the sending FI contacts the receiving FI to get permission to send the transaction. To do this the receiving FI creates an `AUTH_SERVER` and adds it's location to the [stellar.toml](https://www.stellar.org/developers/learn/concepts/stellar-toml.html) of the FI.

## AUTH_SERVER

The auth endpoint handles two different request types, `Auth request` and `Check request`.

### Auth request
HTTP POST to `https://AUTH_SERVER?data=<json>&sig=<sender sig of data>`

**data** is a block of JSON that contains the following fields:

Name | Description 
-----|------
sender | The stellar address of the customer that is initiating the send.
need_info | If the caller needs the recipient's KYC info in order to send the payment.
tx |  The transaction that the sender would like to send in XDR format. This transaction is unsigned.
memo | The full text of the memo the hash of this memo is included in the transaction. The **memo** field follows the [Stellar memo convention]() and should contain at least enough KYC info of the sender to allow the receiving financial institution to do their sanction check.

**sig** is the signature of the data block made by the sending financial institution. The receiving institution should check that this signature is valid against the public key that is posted in the sending financial institution's [stellar.toml](https://www.stellar.org/developers/learn/concepts/stellar-toml.html).


#### Reply
The auth request will return a JSON object with the following fields:

Name | Description
----|-----
info_status | If this FI is willing to share KYC info or not. {ok, denied, pending}
tx_status | If this FI is willing to accept this transaction. {ok, denied, pending}
dest_info | *(only present if info_status is ok)* JSON of the recipient's KYC info. in the Stellar memo convention
pending | *(only present if info_status or tx_status is pending)* Estimated number of seconds till the sender can check back for a change in status. See [check request](#Check request) below.

*Reply Example*
```
{
    info_status: "ok",
    tx_status: "pending",
    dest_info: {
        type: "encrypt",
        value: "TGV0IHlvdXIgaG9wZXMsIG5vdCB5b3VyIGh1cnRzLCBzaGFwZSB5b3VyIGZ1dHVyZS4="
    },
    pending: 3600
}
```

### Check request
Check request is used by the sender to follow up if the initial [Auth request](#Auth request) wasn't able to complete in real time, i.e. either `info_status` or `tx_status` returned pending.

HTTP GET to `https://AUTH_SERVER?checkreq=<tx_id>`

**checkreq** tells the AUTH_SERVER that the caller wants an update on the status of the given `tx_id`. The tx_id is simply the hash of transaction that was auth requested initially. 

#### Reply
Check request has the same reply format as [auth request](#Auth request). It should update the status or tell the caller to continue to wait.

----



## Example of Flow
In this example, Aldi `aldi*bankA.com` wants to send to Bogart `bogart*bankB.com`

**1) BankA gets the info needed to interact with BankB**

This is done by looking up BankB's `stellar.toml` file.

BankA  -> fetches `bankB.com/.well-known/stellar.toml`

from this .toml file it pulls out the following info for BankB:
 - FEDERATION_SERVER
 - AUTH_SERVER
 - ENCRYPTION_KEY
 - Needed KYC fields? 


**2) BankA gets the routing info for Bogart so it can build the transaction**

This is done by asking BankB's federation server to resolve `bogart*bankB.com`.

BankA -> `https://FEDERATION_SERVER?type=name&q=bogart*bankB.com[&simple_kyc=true]`

See [Federation](https://www.stellar.org/developers/learn/concepts/federation.html) for a complete description. The returned fields of interest here are:
 - Stellar AccountID of Bogart's FI
 - Bogart's routing info
 - Need Auth flag that says whether BankB needs to authorize the transaction or not.
 - kyc_yes *only returned if simple_kyc is true*


**3) BankA makes the Auth Request to BankB**

This request will ask BankB for Bogart's KYC info and for permission to send to Bogart.

BankA -> `https://AUTH_SERVER?data=<json>&sig=<bankA sig of data>`

Example data JSON
```
{
    sender: "aldi*bankA.com",
    need_info: "true",
    tx: <base64 encoded xdr of the tx>,
    memo: 
    {
        type: "encrypt"
        value: encrypted(
        {
            route: <Bogart's routing info>
            sender_info:
            {
                stellar: aldi*bankA.com
                name: Aldi Dobbs
                address: <blah>
            }
        })
    }
}
```

**4) BankB handles the Auth request**

 - BankB -> fetches `bankA.com/.well-known/stellar.toml` 
   From this it gets BankA's ENCRYPTION_KEY and SIGNING_KEY
 - BankB verifies the signature on the Auth Request was signed with BankA's SIGNING_KEY
 - BankB does its sanction check on Aldi. This determines the value of `tx_status`. 
 - BankB makes the decision to reveal the KYC info of Bogart or not based on the following:
   - Bogart has made their info public
   - Bogart has allowed BankA
   - Bogart has allowed Aldi
   - BankB has allowed BankA 
 - If none of the above criteria are met, BankB should ask Bogart if he wants to reveal this info to BankA and accept this payment. In this case BankB will return `info_status: "pending"` in the Auth request reply to give Bogart time to accept the payment or not.
 - If BankB determines it can share the kyc info with BankA, it uses BankA's ENCRYPTION_KEY to encrypt Bogart's info and sends this encrypted dest_info back with the reply.

See [Auth Request](#Auth Request) for potential return values. 

**5) BankA handles the reply from the Auth request**

If the call to the auth request returned `pending`, BankA must check again after the estimated number of seconds.

BankA -> `https://AUTH_SERVER?checkreq=tx_id`


**6) BankA does the sanction checks**

Once BankA has been given the `dest_info` from BankB, BankA does the sanction check using this KYC info of Bogart. If the sanction check passes, BankA signs and submits the transaction to the Stellar network.


**7) BankB handles the incoming payment.**

 - It checks the transaction hash against a cache it has or redoes the sanction check on the sender.
 - It credits Bogart's account with the amount sent or sends the transaction back.


