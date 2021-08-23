#!/usr/bin/env bash

echo "Stopping Nervos services..."
sudo systemctl stop nervos-ckb-cli-testnet
sudo systemctl stop nervos-ckb-indexer-testnet
sudo systemctl stop nervos-lumos-indexer-testnet
sudo systemctl stop nervos-testnet
sleep 10

ckb_node_version=$(/home/nervos/ckb/ckb -V)
ckb_node_version=${ckb_node_version/ckb /}
filename1=/tmp/$(date +%Y%m%d)-nervos-ckb-node-${ckb_node_version}-testnet-snapshot.7z
echo "Compressing CKB Node Testnet data to: ${filename1}..."
rm /home/nervos/ckbt/data/db/LOG.old.*
nice -n 19 7z a -r -mmt=1 -mx9 $filename1 /home/nervos/ckbt/data/db/*
sleep 1

ckb_indexer_version=$(/home/nervos/ckb-indexer/ckb-indexer -V)
ckb_indexer_version=${ckb_indexer_version/ckb-indexer /}
filename2=/tmp/$(date +%Y%m%d)-nervos-ckb-indexer-${ckb_indexer_version}-testnet-snapshot.7z
echo "Compressing CKB Indexer Testnet data to: ${filename2}..."
rm /home/nervos/ckb-indexer/testnet-data/LOG.old.*
nice -n 19 7z a -r -mmt=1 -mx9 $filename2 /home/nervos/ckb-indexer/testnet-data/*
sleep 1

ckb_cli_version=$(/home/nervos/ckb/ckb-cli -V)
ckb_cli_version=${ckb_cli_version/ckb-cli /}
filename3=/tmp/$(date +%Y%m%d)-nervos-ckb-cli-${ckb_cli_version}-testnet-snapshot.7z
echo "Compressing CKB-CLI Testnet data to: ${filename3}..."
rm /home/nervos/.ckb-cli/index-v1/0x10639e0895502b5688a6be8cf69460d76541bfa4821629d86d62ba0aae3f9606/LOG.old.*
nice -n 19 7z a -r -mmt=1 -mx9 $filename3 /home/nervos/.ckb-cli/index-v1/*
sleep 1

lumos_indexer_version=$(/home/jmack/.nvm/versions/node/v14.17.4/bin/node -p "require('/home/nervos/lumos-indexer/package.json').version")
filename4=/tmp/$(date +%Y%m%d)-nervos-lumos-indexer-${lumos_indexer_version}-testnet-snapshot.7z
echo "Compressing Lumos Indexer Testnet data to: ${filename4}..."
rm /home/nervos/lumos-indexer/testnet-data/LOG.old.*
nice -n 19 7z a -r -mmt=1 -mx9 $filename4 /home/nervos/lumos-indexer/testnet-data/*
sleep 1

echo "Starting Nervos services..."
sudo systemctl start nervos-testnet
sudo systemctl start nervos-ckb-cli-testnet
sudo systemctl start nervos-ckb-indexer-testnet
sudo systemctl start nervos-lumos-indexer-testnet
sleep 1

echo "Uploading archives to Amazon S3..."
aws s3 cp $filename1 s3://cdn.ckb.tools/snapshots/ --storage-class REDUCED_REDUNDANCY --acl public-read
aws s3 cp $filename2 s3://cdn.ckb.tools/snapshots/ --storage-class REDUCED_REDUNDANCY --acl public-read
aws s3 cp $filename3 s3://cdn.ckb.tools/snapshots/ --storage-class REDUCED_REDUNDANCY --acl public-read
aws s3 cp $filename4 s3://cdn.ckb.tools/snapshots/ --storage-class REDUCED_REDUNDANCY --acl public-read
sleep 1

echo "Removing archives..."
rm $filename1
rm $filename2
rm $filename3
rm $filename4
sleep 1

echo "Completed!"
