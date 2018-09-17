---
title: Known issues
---

This document describes a list of known issues and potential recovery steps.

- [Gaps Detected](#gaps-detected)
    - [Symptoms](#symptoms)
    - [Reasons for this error](#reasons-for-this-error)
        - [mismatched core/Horizon configurations](#mismatched-corehorizon-configurations)
            - [Missing cursors](#missing-cursors)
            - [mismatch policy between core and Horizon](#mismatch-policy-between-core-and-horizon)
        - [corrupt database](#corrupt-database)
    - [Recovery process](#recovery-process)
        - [Reset everything](#reset-everything)
        - [Bridging the gap](#bridging-the-gap)


# Gaps Detected
## Symptoms

Horizon will give an error similar to
```
Gap detected in stellar-core database. Please recreate Horizon DB.
```

## Reasons for this error

### mismatched core/Horizon configurations

Horizon and core run independently of each other.

core produces meta data information that is then imported by Horizon.

Gaps occur when for some reason, Horizon doesn't find data for a ledger that it didn't import yet.

This can happen for a few reasons.

#### Missing cursors

core uses "cursors" to ensure that garbage collection doesn't delete data needed by consumers.

If cursors have not been configured, what can happen is that before Horizon has a chance to set a cursor, core's garbage collection can run and delete some data that Horizon expects.

Solution is to properly define cursors in core's configuration:
```yaml
KNOWN_CURSORS=["HORIZON"]
```

#### mismatch policy between core and Horizon

When running core with partial history `CATCHUP_COMPLETE=false` core's policy is to keep up to the network with a contiguous tail of at least `CATCHUP_RECENT` ledgers.

As a consequence, if core is taken offline for any reason, when it's powered back on, its goal is to catchup to the current ledger `N` from the network as quickly as possible by replaying ledgers that will include all ledgers from `N-CATCHUP_RECENT` up to `N`.

If core is offline longer than roughly `CATCHUP_RECENT` * 5 seconds (the average time between ledgers), it's possible that it will not replay certain ledgers.

Horizon on the other hand expects to replay all ledgers passed its initial ledger.

Here is an example to illustrate all this.

Assume Horizon started to ingest at ledger 10,000, it therefore expects core to emit data for all ledgers past 10,000.
core is configured with `CATCHUP_RECENT=1024` (roughly 85 minutes of tail ledgers).

everything is running fine until one day at ledger 500,000 core is taken down for a day.
At this point we have:
* core's latest ledger is 500,000
* Horizon ingested ledger 500,000 (or something like 499,999 if it was a bit behind)

Later, core is taken back online.
The network happens to be at ledger 520,000 (that's ~27 hours later), which causes core to
* catchup starting at 520,000-1024 = 518,976 (in reality right before that)
* replay ledgers up to 520,000 ; at this point it's in "Synced!" state
* close ledgers 520,001 and so on with the network

Horizon was at 500,000 but now sees ledger 518,976 ... where is 500,001?

It panics with
```
Gap detected in stellar-core database. Please recreate Horizon DB.
```

### corrupt database
Some bugs can cause Horizon to get confused during ingestion.
 
## Recovery process

### Reset everything

In many cases resetting your instance is the simplest way to recover: the data will be reconstructed from history.

It's a good occasion to double check that your configuration in both core and Horizon are consistent with each other.

Pros:
* recovery is very likely as you will be importing data from a clean state
* data in Horizon is reconstructed with the latest code, providing the most detailed

Cons:
* importing a lot of ledgers can take a long time
* core and Horizon are not available during the recovery process 

### Bridging the gap

Note: if core is configured with `CATCHUP_COMPLETE=true` you can either switch your node to partial history (as it was already ingested by Horizon) or reset everything.

1. find out at what is the latest ledger (let's refer to it as `MY_LEDGER_NUMBER`) that Horizon ingested
    * you can get this by calling the '/metrics' endpoint on the Horizon server, the field is history.latest_ledger
    * for example for the SDF public network this data is at https://horizon.stellar.org/metrics
2. stop core and horizon
3. look at the value of history.latest_ledger for the public network, SDF https://horizon.stellar.org/metrics
    * this value will be somehow larger than `MY_LEDGER_NUMBER` , substract the two to get the gap between your instance and SDF's
    * multiply this number by some safety factor (how long do you think you will need to get back in business) to be safe you can use 10 as a ratio.
4. in your core config:
   * set CATCHUP_RECENT to that computed value, your configuration will look something like
```yaml
CATCHUP_COMPLETE=false
CATCHUP_RECENT=50000
```
   * set cursors if not set already
```yaml
KNOWN_CURSORS=["HORIZON"]
```
5. call "newdb" on the core instance to reset core's database
6. start up stellar-core normally, wait for it to be in "Synced!" state
7. start up Horizon, it should be able to see that core has data to ingest
