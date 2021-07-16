#!/usr/bin/env bash

echo "Stopping Nervos services..."
sudo systemctl stop nervos-testnet
sudo systemctl stop nervos-ckb-indexer-testnet
sudo systemctl stop nervos-ckb-cli-testnet
sleep 10

ckb_indexer_version=$(/home/nervos/ckb-indexer/ckb-indexer -V)
ckb_indexer_version=${ckb_indexer_version/ckb-indexer /}
filename1=/tmp/$(date +%Y%m%d)-nervos-ckb-indexer-${ckb_indexer_version}-testnet-snapshot.7z
echo "Compressing CKB Indexer Testnet data to: ${filename1}..."
nice -n 19 7z a -r -mmt=1 -mx9 $filename1 /home/nervos/ckb-indexer/testnet-data/*
sleep 1

ckb_node_version=$(/home/nervos/ckb/ckb -V)
ckb_node_version=${ckb_node_version/ckb /}
filename2=/tmp/$(date +%Y%m%d)-nervos-ckb-node-${ckb_node_version}-testnet-snapshot.7z
echo "Compressing CKB Node Testnet data to: ${filename2}..."
nice -n 19 7z a -r -mmt=1 -mx9 $filename2 /home/nervos/ckbt/data/db/*
sleep 1

ckb_cli_version=$(/home/nervos/ckb/ckb-cli -V)
ckb_cli_version=${ckb_cli_version/ckb-cli /}
filename3=/tmp/$(date +%Y%m%d)-nervos-ckb-cli-${ckb_cli_version}-testnet-snapshot.7z
echo "Compressing CKB-CLI Testnet data to: ${filename3}..."
nice -n 19 7z a -r -mmt=1 -mx9 $filename3 /home/nervos/.ckb-cli/index-v1/*
sleep 1

echo "Starting Nervos services..."
sudo systemctl start nervos-testnet
sudo systemctl start nervos-ckb-indexer-testnet
sudo systemctl start nervos-ckb-cli-testnet
sleep 1

echo "Uploading archives to Amazon S3..."
aws s3 cp $filename1 s3://cdn.ckb.tools/snapshots/ --storage-class REDUCED_REDUNDANCY --acl public-read
aws s3 cp $filename2 s3://cdn.ckb.tools/snapshots/ --storage-class REDUCED_REDUNDANCY --acl public-read
aws s3 cp $filename3 s3://cdn.ckb.tools/snapshots/ --storage-class REDUCED_REDUNDANCY --acl public-read
sleep 1

echo "Removing archives..."
rm $filename1
rm $filename2
rm $filename3
sleep 1

echo "Completed!"
