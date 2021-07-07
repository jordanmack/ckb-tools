import React from 'react';
import './Bootstrap.scss';

function Component()
{
	const html =
	(
		<main className="bootstrap">
			<img className="logo" src="./nervos-white.png" alt="Nervos Logo" />
			<p>
				It takes several hours for a new CKB node to download and synchronize with the rest of the network.
				Fully synchronizing from the genesis block and verifying every transaction in the blockchain is the safest way.
				This process is slow, but a necessary process for a Mainnet node.
			</p>
			<p>
				However, this same level of security may not be required for a Testnet node since we are not dealing with real funds.
				For convinience purposes, we provide recent snapshots of the Testnet chain data for the <a href="https://github.com/nervosnetwork/ckb/releases" target="_blank" rel="noreferrer">CKB Node</a>, <a href="https://github.com/nervosnetwork/ckb-indexer/releases" target="_blank" rel="noreferrer">CKB Indexer</a>, and <a href="https://github.com/nervosnetwork/ckb-cli/releases" target="_blank" rel="noreferrer">CKB-CLI</a>.
				Downloading and using this chain data can save many hours when bootstrapping a new instance of a CKB node or a CKB Indexer.
			</p>
			<p>
				You can view the available snapshots and download them on <a href="https://s3.amazonaws.com/cdn.ckb.tools/snapshots.html" target="_blank" rel="noreferrer">Amazon S3</a>.
			</p>
			<p>
				Usage Instructions:
			</p>
			<ol>
				<li>Install the software for the CKB node, CKB Indexer, or any application that uses them.</li>
				<li>Follow the normal instructions to configure the software to use the Testnet.</li>
				<li>On first launch, the software will create the required data folders. As soon as it begins the sync process, shut down the software.</li>
				<li>Download a snapshot archive to your local hard drive.</li>
				<li>Decompress the archive to a temporary folder using <a href="https://www.7-zip.org/" target="_blank" rel="noreferrer">7-Zip</a>.</li>
				<li>Backup or delete the existing chain/indexer files from the application's data folder, the replace them with the contents of the archive.</li>
				<li>Restart the app and allow it to complete the syncing process.</li>
			</ol>
			<p>
				Data folders for common applications: 
			</p>
			<ul>
				<li>CKB Node: &lt;app_folder&gt;/data/db</li>
				<li>CKB Indexer: indexer_data (path specified during setup)</li>
				<li>CKB-CLI (Linux/MacOS): ~/.ckb-cli/index-v1/0x10639e0895502b5688a6be8cf69460d76541bfa4821629d86d62ba0aae3f9606</li>
				<li>CKB-CLI (Win 10): C:\&lt;USERNAME&gt;\.ckb-cli\index-v1\0x10639e0895502b5688a6be8cf69460d76541bfa4821629d86d62ba0aae3f9606</li>
				<li>Neuron Wallet (Win 10): C:\Users\&lt;username&gt;\AppData\Roaming\Neuron\indexer_data\<wbr />0x10639e0895502b5688a6be8cf69460d76541bfa4821629d86d62ba0aae3f9606</li>
			</ul>
		</main>
	);

	return html;
}

export default Component;
