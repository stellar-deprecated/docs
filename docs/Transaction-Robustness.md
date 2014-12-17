
### Overview
When a customer requests a Gateway’s credits in exchange for their corresponding assets, they are “depositing” funds into the Stellar Network. This requires the Gateway to submit a transaction to the stellar network which sends their credits to the user’s stellar address. This section will attempt to describe a methodology for robustly submitting transactions to the Stellar network.
Reference Library
For a concrete example of deposit processing, consult the reference library found here: https://github.com/stellar/stellar-payments. For Gateways on a nodeJS stack, this library can be used out of the box.


### Robust Transaction Processing

* Robustly submitting a transaction to the Stellar network requires:
* Signing transactions locally to avoid sending secret keys over the network
* Keeping track of the sending account’s sequence number locally
* Handling submission failures to due network problems or stellard downtime
* Handling submission failures due to transaction errors
* Persisting unconfirmed transactions meta information
* Maintaining transaction idempotence by persisting the signed transaction blob
* Shutting down processing due to any fatal errors

### Transaction State

We can model a transaction's lifecycle from creation to confirmation or error as a state machine.

<img src="https://cloud.githubusercontent.com/assets/993607/5477445/5374028a-85e0-11e4-823d-befe88efd0ed.png" alt="Drawing" style="width: 400px;"/>

##### Unsigned
An unsigned transaction is a simple address/amount pair. It is the state a transaction is in when it is first created.

##### Signed
A signed transaction is a transaction that has been signed but not submitted to the network. It has an associated txblob (signed form of the transaction), a transaction hash, and a sequence number. A signed transaction’s txblob can be submitted to the network.

##### Submitted
A submitted transaction has been successfully submitted to the network, though it is not necessarily applied to a ledger or a valid transaction. Submitted transactions should continually be re-submitted to the network until they are confirmed or errored.

##### Confirmed
A transaction reaches the confirmation state when it has been confirmed into a validated ledger. This is a terminal state, a confirmed transaction will always be confirmed.

##### Error
A transaction reaches an error state when signing or submitting returns an error which is not expected. There are two types of errors: fatal and non-fatal. Non-fatal errors should not cause processing to halt; processing should continue onto the next transaction (after potentially resigning transactions in the case of a resign error) and simple mark the transaction as "errored". A fatal error causes all processing to stop and requires manual intervention to proceed.
Signing Transactions

##### Aborted
An aborted transaction is a transaction that has errored and has been manually acknowledged as "ignore". A fatal error transaction can be sent to the abort state to resume transaction processing.

### Signing Transactions:
Algorithm:
```
var transactions = getUnsignedTransactions()
forEach(transaction in transactions)
  // sign transaction should also store the resulting txblob and hash
  signTransaction(transaction);
  transaction.state = “signed”;
```

Signing a transaction should be done locally to avoid sending your account’s secret key over the network. The resulting tx_blob and transaction hash should be persisted in the transaction datastore, and the transaction should be put into the “signed” state.


### Submitting Transactions

Algorithm:
```
var transactions = getUnconfirmedTransactions()
forEach(transaction in transactions)
  var result = submitTransaction();
  processResult(result);
```

Unconfirmed transactions (those in the signed or submitted state), should be repeatedly submitted until they are confirmed or errored. Yes, we could submit a transaction once and then just check it’s hash with the ‘tx’ RPC call. But stellard may have crashed or lost the transaction, in which case we’d have to resubmit anyway. Additionally, resubmitting costs us nothing, because of the property of idempotence mentioned early: a transaction’s signed txblob can be resubmitted without worrying about double paying.

### Confirming Transactions and Handling Errors
The first time a transaction is submitted to the network, stellard will do cursory “pre-validation”, which includes checking to make sure the transaction sequence number is the account’s current sequence number, the account is funded, the destination address exists, among other checks. If any of these checks fail, the transaction should be put into the error state, and any transactions with sequence numbers higher than this one should be resigned.

Assuming pre-validation succeeds, the response will return an engine_result of “tesSUCCESS”. This does not mean the transaction has succeeded and been applied to the ledger, but only that it “looks good” from the local stellard’s perspective. The transaction should be repeatedly re-submitted, until you receive a “tefPAST_SEQ” error. That means that this transaction’s sequence number has already been applied to your account. By checking the transaction’s hash in the network, you can see that this transaction was indeed applied (check tx.inLedger property), validated (check validated property), and successful (check meta.TransactionResult.

Here’s an example fully validated and successful transaction:
```
{
   "result" : {
      "Account" : "gHWNXSaNcNtwBYKWJj2dqSceEvfRq66C3E",
      "Amount" : {
         "currency" : "BRE",
         "issuer" : "gBAde4mkDijZatAdNhBzCsuC7GP4MzhA3B",
         "value" : "3"
      },
      "Destination" : "gKeuTtwUgikZ1aZsara89VDt7xSob7Xbwh",
      "DestinationTag" : 123,
      "Fee" : "10",
      "Flags" : 2147483648,
      "Sequence" : 415,
      "SigningPubKey" : "A05BED4FB24996126EE6094B8A6F1ED84666ACCFFC1D838C061D2C232504FA68",
      "TransactionType" : "Payment",
      "TxnSignature" : "625DE6779DC5E1084734839ECAB64907B6E37798B09067BA07BC9C4DADDA64BAEFB2B37513997701B756FE1707C68573303F87A5468A6A358AA20B86693BC504",
      "hash" : "0858519FA7F41E5E83890AF726245DA22E8DC047BC8F1B92F0B9EFCD444A4E0A",
      "inLedger" : 2269840,
      "ledger_index" : 2269840,
      "meta" : {
         [...]
         "TransactionResult" : "tesSUCCESS"
      },
      "status" : "success",
      "validated" : true
   }
}
```

Here’s a list of error results you’ll encounter when resubmitting transactions.

### Errors
##### tesSUCCESS
The transaction has passed stellard’s pre validation and is well formed, with the correct sequence number. The stellard will attempt to apply this to the current ledger.

##### tefALREADY
This error means the transaction that you are submitting is in the node’s current ledger transaction set, and is waiting to be applied. This error should be ignored, and transaction submission should continue.

##### tesPENDING
This signifies that the transaction has been applied to this node’s closed ledger, but has not been validated through consensus. This error should be ignored, and transaction submission should continue.

##### tefPAST_SEQ
A past sequence error means that a transaction with this sequence number has already been submitted to the network. If you’ve followed the best practices and have only been submitting transactions through one singular point of submission, this is your transaction and it is in a validated, confirmed ledger! To be sure, the reference client double checks that this transaction hash is in a ledger using the ‘tx’ RPC call. If it is, we can then safely mark the transaction as confirmed. If it’s not, we throw a fatal error and stop processing.

##### terPRE_SEQ
This means that the transaction your submitting has a sequence number in the future. For instance, if the last sequence number for your account is 10 and you submit a transaction with 15, you’ll get this error. This could happen for a variety of reasons, and usually it will resolve itself. For instance, you submit transaction A with sequence 1 and it returns tesSUCCESS. But then the stellard instance crashes and it drops transaction A. You then submit transaction B with sequence number 2. A terPRE_SEQ error will be returned because the node hasn’t seen sequence number 1 yet. At this point, you need to resubmit transaction A first, and then transaction B will have the correct sequence number and processing will continue.

##### tecUNFUNDED_PAYMENT
This error is sent when your account doesn’t have funds to cover this transaction. However, as with all “tec” transactions, this transaction took a sequence number and claimed a fee. This should be a fatal error requiring manual intervention before continuing to process.

##### tefDST_TAG_NEEDED
This means the destination account requires a destination tag to send a payment.

##### Error Codes
For all other errors we don’t explicitly handle, there are (stable) error codes you can fall back on.

-300…-399 Local Transaction Error, does not claim a fee or sequence number, resign
-200…-299 Malformed Transaction Error, does not claim a fee or sequence number, resign
-100…-199 Fail Transaction Error, does not claim a fee or sequence number, resign
-1....-99 Retry Transaction Error, does not claim a fee or sequence number, retry
0 Success
100...159 Claim Fee Submission Error, claims a fee and sequence number
