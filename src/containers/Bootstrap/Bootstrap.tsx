import React from 'react';
import './Bootstrap.scss';

function Component()
{
	const html =
	(
		<main className="bootstrap">
			<h2>Bootstrap Tool</h2>
			<img className="logo" src="./nervos-white.png" alt="Nervos Logo" />
			<p>
				It takes several hours for a new CKB node to download and synchronize with the rest of the network.
				Fully synchronizing from the genesis block and verifying every transaction in the blockchain is the safest way.
				This process is slow, but a necessary process for a Mainnet node.
			</p>
			<p>
				However, this same level of security may not be required for a Testnet node since we are not dealing with real funds.
				For convinience purposes, we provide recent snapshots of the Testnet chain data for the <a href="https://github.com/nervosnetwork/ckb/releases" target="_blank" rel="noreferrer">CKB Node</a>.
				Downloading and using this chain data can save many hours when bootstrapping a new instance of a CKB node.
			</p>
			<p>
				You can view the most recent snapshots <a href="https://cdn-ckb-tools.sfo3.digitaloceanspaces.com/snapshots/snapshots.html?prefix=snapshots/" target="_blank" rel="noreferrer">here</a>.
			</p>
			<p>
				Basic Usage Instructions:
			</p>
			<ol>
				<li>Install the software for the CKB node.</li>
				<li>Follow the normal instructions to configure the software to use the Testnet.</li>
				<li>On first launch, the software will create the required data folders. As soon as it begins the sync process, shut down the software.</li>
				<li>Download a snapshot archive to your local hard drive.</li>
				<li>Decompress the archive to a temporary folder using <a href="https://www.7-zip.org/" target="_blank" rel="noreferrer">7-Zip</a>.</li>
				<li>Backup or delete the existing chain files from the application's data folder, the replace them with the contents of the archive.</li>
				<li>Restart the app and allow it to complete the syncing process.</li>
			</ol>
			<p>
				Default data folders for the CKB Node: &lt;app_folder&gt;/data/db
			</p>
		</main>
	);

	return html;
}

export default Component;
