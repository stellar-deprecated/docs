---
title: Hardware Requirements
---

# Considerations

The Stellar Network is a live system and the hardware requirements will grow along with usage of the network. Please keep this in mind as you decide what hardware you want to use for your Stellar integration.

If you opt to go with the minimum requirements that we have listed below, you may experience some lag during times of peak traffic on the network as your node tries to catch up to the rest of the network. For a smooth experience you should opt to go with the recommended hardware requirements listed for each service.

We will do our best to keep this doc up-to-date as we make further improvements to the codebase.

# Nodes

## Stellar-Core

Instances of Stellar-Core are part of the network as a node and therefore need to be large enough to support the volume on the network.

### Minimum
**CPU**: 4-Core (8-Thread) Intel i7/Xeon or equivalent (c5.xlarge on AWS)\
**RAM**: 8GB DDR4\
**SSD**: 64GB

### Recommended
**CPU**: 8-Core (16-Thread) Intel i7/Xeon or equivalent (c5.2xlarge on AWS)\
**RAM**: 16GB DDR4\
**SSD**: 120GB

## Horizon

Instances of Horizon ingest data from the network and therefore need to be large enough to support ingesting all of the latest transactions on the network.

There is a significant amount of computation that is done on the DB side of Horizon, these requirements are only for the application side of horizon. If you are going by these requirements then you will need to account for using a larger machine if using the same machine for the DB, or a separate machine for the DB altogether.

### Minimum
**CPU**: 8-Core (16-Thread) Intel i7/Xeon or equivalent (c5.2xlarge on AWS)\
**RAM**: 16GB DDR4\
**SSD**: 64GB

### Recommended
**CPU**: 16-Core (32-Thread) Intel i7/Xeon or equivalent (c5.4xlarge on AWS)\
**RAM**: 32GB DDR4\
**SSD**: 120GB

# Anchor Servers

The hardware requirements for these anchor services depend on your own internal usage, i.e. these hardware requirements will not increase as the volume on the network increases. Our suggestions below assume that you will run one machine for each service, although you can combine services onto a single machine with a larger capacity using VMs if you prefer.

## Bridge Server

### Minimum
**CPU**: 2-Core (4-Thread) Intel i7/Xeon or equivalent (c5.large on AWS)\
**RAM**: 4GB DDR3/DDR4\
**SSD**: Needs a DB to hold processed transactions. Above CPU and RAM requirements don’t account for running this database’s hardware. DB size depends on your usage of the network. 20GB seems like a good starting point.

### Recommended
**CPU**: 4-Core (8-Thread) Intel i7/Xeon or equivalent (c5.xlarge on AWS)\
**RAM**: 8GB DDR4\
**SSD**: Needs a DB to hold processed transactions. Above CPU and RAM requirements don’t account for running this database’s hardware. DB size depends on your usage of the network. 20GB seems like a good starting point.

## Federation Server

### Minimum
**CPU**: 2-Core (4-Thread) Intel i7/Xeon or equivalent (c5.large on AWS)\
**RAM**: 4GB DDR3/DDR4\
**SSD**: Needs a DB to hold federation table. Above CPU and RAM requirements don’t account for running this database’s hardware. DB size depends on how many accounts you have. See callbacks for more information.

### Recommended
**CPU**: 4-Core (8-Thread) Intel i7/Xeon or equivalent (c5.xlarge on AWS)\
**RAM**: 8GB DDR4\
**SSD**: Needs a DB to hold federation table. Above CPU and RAM requirements don’t account for running this database’s hardware. DB size depends on how many accounts you have. See callbacks for more information.

## Compliance Server

### Minimum
**CPU**: 2-Core (4-Thread) Intel i7/Xeon or equivalent (c5.large on AWS)\
**RAM**: 4GB DDR3/DDR4\
**SSD**: Needs a DB to hold processed transactions. Above CPU and RAM requirements don’t account for running this database’s hardware. DB size depends on your usage of the network. 20GB seems like a good starting point.

### Recommended
**CPU**: 4-Core (8-Thread) Intel i7/Xeon or equivalent (c5.xlarge on AWS)\
**RAM**: 8GB DDR4\
**SSD**: Needs a DB to hold processed transactions. Above CPU and RAM requirements don’t account for running this database’s hardware. DB size depends on your usage of the network. 20GB seems like a good starting point.
