#!/usr/bin/env bash

echo "Stopping Nervos services..."
sudo systemctl stop ckb-indexer-testnet
sudo systemctl stop ckb-testnet
sleep 10

ckb_node_version=$(/home/nervos/ckb/ckb -V)
ckb_node_version=${ckb_node_version/ckb /}
filename1=/tmp/$(date +%Y%m%d)-nervos-ckb-node-${ckb_node_version}-testnet-snapshot.7z
echo "Compressing CKB Node Testnet data to: ${filename1}..."
sudo rm -f /home/nervos/ckbt/data/db/LOG.old.*
nice -n 19 7z a -r -mmt=2 -mx9 $filename1 /home/nervos/ckbt/data/db/*
sleep 1

ckb_indexer_version=$(/home/nervos/ckb-indexer/ckb-indexer -V)
ckb_indexer_version=${ckb_indexer_version/ckb-indexer /}
filename2=/tmp/$(date +%Y%m%d)-nervos-ckb-indexer-${ckb_indexer_version}-testnet-snapshot.7z
echo "Compressing CKB Indexer Testnet data to: ${filename2}..."
sudo rm -f /home/nervos/ckb-indexer/testnet-data/LOG.old.*
nice -n 19 7z a -r -mmt=2 -mx9 $filename2 /home/nervos/ckb-indexer/testnet-data/*
sleep 1

echo "Starting Nervos services..."
sudo systemctl start ckb-testnet
sudo systemctl start ckb-indexer-testnet
sleep 1

echo "Uploading archives to DigitalOcean..."
aws s3 cp $filename1 s3://cdn-ckb-tools/snapshots/ --acl public-read --endpoint=https://sfo3.digitaloceanspaces.com --profile=digitalocean
aws s3 cp $filename2 s3://cdn-ckb-tools/snapshots/ --acl public-read --endpoint=https://sfo3.digitaloceanspaces.com --profile=digitalocean
sleep 1

echo "Removing archives..."
rm $filename1
rm $filename2
sleep 1

echo "Completed!"
