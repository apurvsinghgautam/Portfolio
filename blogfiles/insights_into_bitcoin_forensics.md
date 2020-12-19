# Insights into Bitcoin Forensics


Bitcoin is a cryptocurrency. It is an attempt to bring back a Decentralized currency for people that is not controlled by any central body. It works on peer to peer network using Blockchain technology.

Blockchain is a type of distributed ledger. The data is stored in blocks and these blocks contain digitally recorded data that is unchangeable. They use linked list in which block contains hash of previous block and so on.

Blockchain has several applications like Smart Contracts, Equity, Croudfunding, Health care, Intellectual Property and much more.

## Algorithm

Bitcoin uses Elliptic Curve Signature Algorithm. ECDSA is used to generate a public key from the private key. The public key can be used to verify transactions signed using the private key. There are 64-byte public key that are hashed into 20-byte addresses. These 20-byte address are formatted using base58 check to produce either P2PKH or P2SH bitcoin address.

## Working

Bitcoin network is composed of Peers connected to other Peers over unencrypted TCP channels. Each peer attempts to maintain eight outgoing connections to peers. These eight peers are called entry nodes. Transaction and Block messages are propagated in network by being relayed through these entry nodes to the peers

## Forensic Steps

Forensic has major four steps. These are:

- Identification -identify specific objects that store important data for the case analysis
- Collection -establish a chain of custody and document all steps to prove that the collected data remains intact and unaltered
- Analysis & Evaluation -determine the type of information stored on digital evidence and conduct a thorough analysis of the media
- Reporting -Prepare and deliver an official report

Each forensic investigator should know the architecture of Blockchain. As currently there is no software tool available for Bitcoin Forensics so one should look at every information regarding bitcoin and blockchain.

Bitcoin don’t exist anywhere not even on hard drive. For a particular bitcoin address there are no digital bitcoins held against that address. One must reconstruct the balance of bitcoin by looking at the Blockchain. Everyone on the network knows about the transaction and the history can be traced back to the point where the bitcoins were produced

There are several websites on which information regarding bitcoins can be enumerated. These are:

- [Bitcoin Block Explorer](https://blockexplorer.com/) - Used to get latest block information(Height, Age, Hash, Transaction, Size)
- [http://blockexplorer.com/blocks](http://blockexplorer.com/blocks) - Used to get information of blocks by date and timestamps
- [Blockchain Explorer](https://www.blockchain.com/btc/blocks) - Used to get block information(Height, Time, Relayed by, Hash, Size)
- [Bitcoin currency statistics](https://www.blockchain.com/stats) - Used to get Block summary, Market summary, Transaction Summary

The information that can be collected from Bitcoin artifacts are:

- System Info
- Info about Logged Users
- Registry Info
- Web Browsing Activities
- Recent Communications

Every forensic investigator should look thoroughly through the transactions happening on Blockchain. It contains huge number of public addresses which should be noted down properly. Bitcoin addresses can help in tracing the purchases.