Stellar.org doesn't currently run a validator. We do run a couple nodes recording and saving network history.

Important snippits from our .cfg
```
NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"

KNOWN_PEERS=[
"core-live1.stellar.org",
"core-live2.stellar.org",
"chiyou.strllar.org",
"confucius.strllar.org"]

# Stellar.org history store
[HISTORY.sdf1]
get="aws s3 cp --region eu-west-1 s3://history.stellar.org/prd/core-public/core-public-001/{0} {1}"

[HISTORY.sdf2]
get="aws s3 cp --region eu-west-1 s3://history.stellar.org/prd/core-public/core-public-002/{0} {1}"
```

#None of the following validators are recommended by Stellar Development Foundation.

We don't know who really controls these nodes. They could all be owned by the same person! This list is purely for informational purposes. 

If you would like to **list your validating node here** please make a pull request.

 Name:<br>
 Contact:<br>
 Description:<br>
 List of nodes:<br>

------
 Name: strllar.org<br>
 Contact: lab@strllar.org<br>
 Description:<br>
 Nice to be in your quorum slice.

 List of nodes:<br>
 
 Peer1: chiyou.strllar.org<br>
 NodeID: GD5DJQDDBKGAYNEAXU562HYGOOSYAEOO6AS53PZXBOZGCP5M2OPGMZV3<br>
 History: get="curl -sf https://stellar.oss-cn-beijing.aliyuncs.com/xlm/{0} -o {1}"

 Peer2: confucius.strllar.org <br>
 NodeID: GBGGNBZVYNMVLCWNQRO7ASU6XX2MRPITAGLASRWOWLB4ZIIPHMGNMC4I<br>
 History: get="curl -sf https://s3-ap-northeast-1.amazonaws.com/confucius.tome.strllar.org/xlm/{0} -o {1}"

------
 Name: Donovan<br>
 Contact: donovanhide@gmail.com<br>
 Description: Another possibility for your list<br>
 List of nodes:<br>
 GB6REF5GOGGSEHZ3L2YK6K4T4KX3YDMWHDCPMV7MZJDLHBDNZXEPRBGM
