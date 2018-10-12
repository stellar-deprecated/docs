---
title: Known issues
---

This document describes a list of known issues and potential recovery steps.

- [Gaps Detected](#gaps-detected)
    - [Symptoms](#symptoms)
    - [Reasons for this error](#reasons-for-this-error)
        - [Mismatched stellar-core/Horizon configurations](#mismatched-stellar-corehorizon-configurations)
            - [Missing cursors](#missing-cursors)
            - [Mismatch policy between stellar-core and Horizon](#mismatch-policy-between-stellar-core-and-horizon)
        - [Corrupt database](#corrupt-database)
    - [Recovery process](#recovery-process)
        - [Reset everything](#reset-everything)
        - [Bridging the gap](#bridging-the-gap)
- [Backfilling history](#backfilling-history)
    - [Check your configuration](#check-your-configuration)
    - [Recovery process](#recovery-process-1)
        - [Reset everything](#reset-everything-1)
        - [Manually backfill history](#manually-backfill-history)
            - [Preparation steps](#preparation-steps)
            - [Reconstruction steps](#reconstruction-steps)
            - [Merging steps](#merging-steps)


# Gaps Detected
## Symptoms

Horizon will give an error similar to
```
Gap detected in stellar-core database. Please recreate Horizon DB.
```

## Reasons for this error

### Mismatched stellar-core/Horizon configurations

Horizon and stellar-core run independently of each other.

stellar-core produces meta data information that is then imported by Horizon.

Gaps occur when for some reason, Horizon doesn't find data for a ledger that it didn't import yet.

This can happen for a few reasons.

#### Missing cursors

stellar-core uses "cursors" to ensure that garbage collection doesn't delete data needed by consumers.

If cursors have not been configured, what can happen is that before Horizon has a chance to set a cursor, stellar-core's garbage collection can run and delete some data that Horizon expects.

Solution is to properly define cursors in stellar-core's configuration:
```yaml
KNOWN_CURSORS=["HORIZON"]
```

#### Mismatch policy between stellar-core and Horizon

When running stellar-core with partial history `CATCHUP_COMPLETE=false`, stellar-core's policy is to keep up with the network with a contiguous tail of at least `CATCHUP_RECENT` ledgers.

As a consequence, if stellar-core is taken offline for any reason, when it's powered back on, its goal is to catchup to the current ledger `N` from the network as quickly as possible by replaying ledgers that will include all ledgers from `N-CATCHUP_RECENT` up to `N`.

If stellar-core is offline longer than roughly `CATCHUP_RECENT` * 5 seconds (the average time between ledgers), it's possible that it will not replay certain ledgers.

Horizon on the other hand expects to replay all ledgers passed its initial ledger.

Here is an example to illustrate all this.

Assume Horizon started to ingest at ledger 10,000, it therefore expects stellar-core to emit data for all ledgers past 10,000.
stellar-core is configured with `CATCHUP_RECENT=1024` (roughly 85 minutes of tail ledgers).

everything is running fine until one day at ledger 500,000 stellar-core is taken down for a day.
At this point we have:
* stellar-core's latest ledger is 500,000
* Horizon ingested ledger 500,000 (or something like 499,999 if it was a bit behind)

Later, stellar-core is taken back online.
The network happens to be at ledger 520,000 (that's ~27 hours later), which causes stellar-core to
* catchup starting at 520,000-1024 = 518,976 (in reality right before that)
* replay ledgers up to 520,000 ; at this point it's in "Synced!" state
* close ledgers 520,001 and so on with the network

Horizon was at 500,000 but now sees ledger 518,976 ... where is 500,001?

It panics with
```
Gap detected in stellar-core database. Please recreate Horizon DB.
```

### Corrupt database
Some bugs can cause Horizon to get confused during ingestion.
 
## Recovery process

### Reset everything

In many cases resetting your instance is the simplest way to recover: the data will be reconstructed from history.

It's a good occasion to double check that your configuration in both stellar-core and Horizon are consistent with each other.

Pros:
* recovery is very likely as you will be importing data from a clean state
* data in Horizon is reconstructed with the latest code, providing the most detailed

Cons:
* importing a lot of ledgers can take a long time
* stellar-core and Horizon are not available during the recovery process 

### Bridging the gap

Note: if stellar-core is configured with `CATCHUP_COMPLETE=true` you can either switch your node to partial history (as it was already ingested by Horizon) or reset everything.

1. find out at what is the latest ledger (let's refer to it as `MY_LEDGER_NUMBER`) that Horizon ingested
    * you can get this by calling the '/metrics' endpoint on the Horizon server, the field is history.latest_ledger
    * for example for the SDF public network this data is at https://horizon.stellar.org/metrics
2. stop stellar-core and horizon
3. look at the value of history.latest_ledger for the public network, SDF https://horizon.stellar.org/metrics
    * this value will be somehow larger than `MY_LEDGER_NUMBER` , substract the two to get the gap between your instance and SDF's
    * multiply this number by some safety factor (how long do you think you will need to get back in business) to be safe you can use 10 as a ratio.
4. in your stellar-core config:
   * set CATCHUP_RECENT to that computed value, your configuration will look something like
```yaml
CATCHUP_COMPLETE=false
CATCHUP_RECENT=50000
```
   * set cursors if not set already
```yaml
KNOWN_CURSORS=["HORIZON"]
```
5. call "newdb" on the stellar-core instance to reset stellar-core's database
6. start up stellar-core normally, wait for it to be in "Synced!" state
7. start up Horizon, it should be able to see that stellar-core has data to ingest

# Backfilling history

In this case, you have a stellar-core instance that works properly (it has the ability to close ledgers without error), but you realize
that for some reason its history is incomplete, in the sense that the oldest
ledger available for Horizon to import is not old enough.

Many of the same reasons that can lead to this issue include some of the same problems that lead to
[gaps being detected](#gaps-detected).

## Check your configuration

Follow the steps in [mismatched core/Horizon configurations](#mismatched-corehorizon-configurations)

In particular, if the reason you have missing data is because of
garbage collection, you want to make sure that it doesn't happen again in the
future!

## Recovery process

Important, before attempting any recovery process:
* Make sure that your configuration is correct (and if not adjust it)
* **BACKUP** all data on your stellar-core node.

### Reset everything

The easiest way to recover is to [reset everything](#reset-everything).

This will take some time for the running processes, but it doesn't require manual intervention.

### Manually backfill history

The general idea behind this method is to construct the missing data on a
separate stellar-core instance, followed by an "import" into the instance you are trying to recover.

Note that **Horizon does not support backfilling**: it will have to reingest all
data from stellar-core.

#### Preparation steps

1. Stop Horizon.
2. Set the `HORIZON` cursor to 0 (which will stop garbage collection from continuing)
```
stellar-core --conf X.conf 'setcursor?id=HORIZON&cursor=0'
```
3. Stop your stellar-core instance.
4. Connect to your stellar-core database, and run:
```sql
SELECT ledgerseq FROM ledgerheaders ORDER BY ledgerseq ASC LIMIT 1;
```
This will return the _smallest_ ledger that your stellar-core instance currently knows about.

We'll call this value `ORIGINAL_LOW_LEDGER` for now on.

We'll call `LOW_LEDGER` the value that you want in history.

#### Reconstruction steps

Steps here are going to reconstruct history for the range `LOW_LEDGER .. ORIGINAL_LOW_LEDGER`

1. Prepare a fresh new stellar-core instance with a similar configuration file.
    * Use a different database, sqlite even
    * don't start it after running `newdb`
2. Perform a command line catchup to replay a range of ledger that includes the target range:
```
stellar-core --conf X.conf --catchup-at LOW_LEDGER --catchup-to ORIGINAL_LOW_LEDGER
```

If this succeeds you can proceed to next step - merging.

#### Merging steps

Repeat the following steps for the following sql tables:
* `ledgerheaders` (`ledgerseq`)
* `txhistory` (`ledgerseq`)
* `txfeehistory` (`ledgerseq`)
Not imported from history as of this writing:
* `scphistory`
* `scpquorums`

We'll use `ledgerheaders` here to illustrate.

1. On the temporary node, export the data from `ledgerheaders` (save into a file `ledgerHeaders.sql`)
```sql
SELECT * from ledgerheaders WHERE ledgerseq >= LOW_LEDGER AND ledgerseq < ORIGINAL_LOW_LEDGER
```
2. (Optional) Verify that the hash of ledger `ORIGINAL_LOW_LEDGER - 1` is the one stored in ledger `ORIGINAL_LOW_LEDGER`.
```sql
SELECT ledgerhash FROM ledgerheaders WHERE ledgerseq = ORIGINAL_LOW_LEDGER-1
```
3. Login into the stellar-core database and run the following:
```sql
SELECT prevhash FROM ledgerheaders WHERE ledgerseq = ORIGINAL_LOW_LEDGER
```
Verify that this value is the same than the `ledgerhash` returned on the previous step.
4.  Import the data exported in step 1.
5. Verify that there aren't any gaps within the history.
```sql
SELECT lh1.ledgerseq FROM ledgerheaders AS lh1 WHERE lh1.ledgerseq NOT IN ( SELECT lh2.ledgerseq-1 FROM ledgerheaders AS lh2 WHERE lh2.ledgerseq = lh1.ledgerseq + 1);
```

When this is completed, you can start stellar-core and wait for it to catch up to the network.

Finally, you can reset Horizon and have it ingest all data from `stellar-core`.
