import React from 'react';
import {A} from 'hookrouter';
import './Home.scss';

function Component()
{
	const html =
	(
		<main className="home">
			<img className="logo" src="./nervos-white.png" alt="Nervos Logo" />
			<p>
				CKB.tools is an online collection of free development tools for use with <a href="https://nervos.org/" target="_blank" rel="noreferrer">Nervos Network</a>.
			</p>
			<p>
				The following tools are currently available, and more will be added as they are completed.
			</p>
			<ul>
				<li><A href="/address">Address Tool</A> - A tool to view the components and attributes of Nervos CKB addresses.</li>
				<li><A href="/sudt">SUDT Tool</A> - A tool to create SUDT tokens on the Testnet using MetaMask.</li>
			</ul>
			<p>
				Note: In order to use these tools you must have <a href="https://metamask.io/" target="_blank" rel="noreferrer">MetaMask</a> installed.
			</p>
			<p>
				These tools are built on the following technologies, tools, and frameworks.
			</p>
			<ul>
				<li><a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer">TypeScript</a></li>
				<li><a href="https://reactjs.org/" target="_blank" rel="noreferrer">React</a> + <a href="https://reactjs.org/docs/create-a-new-react-app.html" target="_blank" rel="noreferrer">CRA</a></li>
				<li><a href="https://github.com/lay2dev/pw-core" target="_blank" rel="noreferrer">PW-SDK Framework</a></li>
				<li><a href="https://github.com/nervosnetwork/ckb" target="_blank" rel="noreferrer">CKB Node Software</a></li>
				<li><a href="https://github.com/nervosnetwork/ckb-indexer" target="_blank" rel="noreferrer">CKB Indexer Software</a></li>
			</ul>
			<p>
				The complete source code for all tools is always available on <a href="https://github.com/jordanmack/ckb-tools" target="_blank" rel="noreferrer">GitHub</a>.
			</p>
		</main>
	);

	return html;
}

export default Component;
