---
title: Versioning and Upgrading
---


This document describes the various mechanisms used to keep the overall system working as it evolves.

# Ledger versioning
## ledgerVersion
This uint32 stored in the ledger header describes the version number of the overall protocol.
Protocol in this case is defined both as "wire format"--i.e., the serialized forms of all objects stored in the ledger--and its behavior.

This version number is incremented every time the protocol changes.

### Integration with consensus
Most of the time, consensus is simply reached on which transaction set needs to be applied to the previous ledger.

Consensus can also, however, be reached on upgrade steps.

One such upgrade step is "update ledgerVersion to value X after ledger N".

If nodes do not consider that the upgrade step is valid, they simply drop the upgrade step from their vote.

A node considers a step invalid either because they do not understand it or some condition is not met. In the previous example, it could be that X is not supported by the node or that the ledger number didn't reach N yet.

Upgrade steps are applied before applying the transaction set to ensure that the logic scheduling steps is the same that is processing it. Otherwise, the steps would have to be applied after the ledger is closed.

### Supported versions
Each node has its own way of tracking which version it supports--for example, a "min version", "max version"--but it can also include things like "black listed versions." Supported versions are not tracked from within the protocol.

Note that minProtocolVersion is distinct from the version an instance understands:
typically an implementation understands versions n .. maxProtocolVersion, where n <= minProtocolVersion.
The reason for this is that nodes must be able to replay transactions from history (down to version 'n'), yet there might be some issue/vulnerability that we don't want to be exploitable for new transactions.

## Ledger object versioning

Data structures that are likely to evolve over time contain the following extension point:
```C++
union switch(int v)
{
case 0:
    void;
} ext;
```

In this case, the version 'v' refers to the version of the object and permits the addition of new arms.

This scheme offers several benefits:
* Implementations become wire compatible without code changes only by updating their protocol definition files.
* Even without updating the protocol definition files, older implementations continue to function as long as they don't encounter newer formats.
* It promotes code sharing between versions of the objects.

Note that while this scheme promotes code sharing for components consuming those objects, code sharing is not necessarily promoted for stellar-core itself because the behavior must be preserved for all versions: In order to reconstruct the ledger chain from arbitrary points in time, the behavior must be 100% compatible.

## Operations versioning

Operations are versioned as a whole: If a new parameter needs to be added or changed, versioning is achieved by adding a new operation.
This causes some duplication of logic in clients but avoids introducing potential bugs. For example, code that would sign only certain types of transactions must be fully aware of what it's signing.

## Envelope versioning

Pattern used to allow for extensibility of envelopes (signed content):
```C++
union TransactionEnvelope switch (int v)
{
case 0:
    struct
    {
        Transaction tx;
        DecoratedSignature signatures<20>;
    } v0;
};
```

This pattern allows the capability to modify the envelope if needed and ensures that clients don't blindly consume content that they couldn't validate.

## Upgrading objects that don't have an extension point

The object's schema must be cloned and its parent object must be updated to use the new object type. The assumption here is that there is no unversioned "root" object.

## Supported implementations lifetime considerations

In order to keep the codebase in a maintainable state, implementations may not preserve the ability to play back from genesis. Instead they may opt to support a limited range--for example, only preserve the capability to replay the previous 3 months of transactions (assuming that the network's minProtocolVersion is more recent than that).

This does not change the ability of the node to (re)join or participate in the network; it only affects the ability for a node to do historical validation.

# Overlay versioning

Overlay follows a similar pattern for versioning: It has a min-maxOverlayVersion.

The versioning policy at the overlay layer is a lot more aggressive when it comes to the deprecation schedule; the set of nodes involved is limited to the ones that connect directly to the instance.

With this in mind, structures follow the "clone" model at this layer:
if a message needs to be modified, a new message is defined by cloning the old message type using a new type identifier.

Knowing that the older implementation will be deleted anyway, the clone model makes it possible to refactor large parts of the code and avoids the headache of maintaining older versions.

At this layer, it's acceptable to modify the behavior of older versions as long as it stays compatible.

The implementation may decide to share the underlying code--for example, by converting legacy messages into the new format internally.

The "HELLO" message exchanged when peers connect to each other contains the min and max version the instance supports. The other endpoint may decide to disconnect right away if it's not compatible.




