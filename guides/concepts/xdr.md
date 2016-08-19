---
title: XDR
---

**XDR**, also known as _External Data Representation_, is used throughout the Stellar network and protocol.  The ledger, transactions, results, history, and even the messages passed between computers running stellar-core are encoded using XDR.

XDR is specified in [RFC 4506](http://tools.ietf.org/html/rfc4506.html) and is similar to tools like Protocol Buffers or Thrift. XDR provides a few important features:

- It is very compact, so it can be transmitted quickly and stored with minimal disk space.
- Data encoded in XDR is reliably and predictably stored. Fields are always in the same order, which makes cryptographically signing and verifying XDR messages simple.
- XDR definitions include rich descriptions of data types and structures, which is not possible in simpler formats like JSON, TOML, or YAML.

Since XDR is a binary format and not as widely known as simpler formats like JSON, the Stellar SDKs all include tools for parsing XDR and will do so automatically when retrieving data.

In addition, the Horizon API server generally exposes the most important parts of the XDR data in JSON, so they are easier to parse if you are not using an SDK. The XDR data is still included (encoded as a base64 string) inside the JSON in case you need direct access to it.

## .X files

Data structures in XDR are specified in an _interface definition file_ (IDL).
The IDL files used for the Stellar Network are available
[on GitHub](https://github.com/stellar/stellar-core/tree/master/src/xdr).
