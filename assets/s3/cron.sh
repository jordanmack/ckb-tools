#!/usr/bin/env bash

echo "Stopping Nervos Testnet CKB node and Testnet CKB Indexer..."
sudo systemctl stop nervos-testnet
sudo systemctl stop nervos-ckb-indexer-testnet
sleep 10

filename1=/tmp/$(date +%Y%m%d)-nervos-ckb-indexer-testnet-snapshot.7z
echo "Compressing CKB Indexer Testnet data to: ${filename1}..."
nice -n 19 7z a -r -mmt=1 -mx9 $filename1 /home/nervos/ckb-indexer/testnet-data/*
sleep 1

filename2=/tmp/$(date +%Y%m%d)-nervos-ckb-node-testnet-snapshot.7z
echo "Compressing CKB node Testnet data to: ${filename1}..."
nice -n 19 7z a -r -mmt=1 -mx9 $filename2 /home/nervos/ckbt/data/db/*
sleep 1

echo "Starting Nervos Testnet CKB node and Testnet CKB Indexer..."
sudo systemctl start nervos-testnet
sudo systemctl start nervos-ckb-indexer-testnet
sleep 1

echo "Uploading archives to Amazon S3..."
aws s3 cp $filename1 s3://cdn.ckb.tools/snapshots/ --storage-class REDUCED_REDUNDANCY --acl public-read
aws s3 cp $filename2 s3://cdn.ckb.tools/snapshots/ --storage-class REDUCED_REDUNDANCY --acl public-read
sleep 1

echo "Removing archives..."
rm $filename1
rm $filename2
sleep 1

echo "Completed!"
