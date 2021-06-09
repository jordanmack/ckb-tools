import React from 'react';
import './Bootstrap.scss';

function Component()
{
	const html =
	(
		<main className="bootstrap">
			<img className="logo" src="./nervos-white.png" alt="Nervos Logo" />
			<p>
				After a new Nervos CKB node or CKB Indexer is setup, it takes several hours for the data to download and synchronize with the rest of the network.
				Fully synchronizing from the genesis block and verifying every transaction in the blockchain is the safest way.
				This process is slow, but a necessary process for a Mainnet node.
			</p>
			<p>
				However, this same level of security may not be required for a Testnet node since we are not dealing with real funds.
				For convinience purposes, we provide recent snapshots of the Testnet chain data for the CKB node and CKB Indexer.
				Downloading and using this chain data can save many hours when bootstrapping a new instance of a CKB node or a CKB Indexer.
			</p>
			<p>
				You can view and download the available snapshots from <a href="https://s3.amazonaws.com/cdn.ckb.tools/snapshots.html" target="_blank" rel="noreferrer">Amazon S3</a>.
			</p>
		</main>
	);

	return html;
}

export default Component;
