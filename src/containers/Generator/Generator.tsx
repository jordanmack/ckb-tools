import React, {useEffect, useState, useRef} from 'react';
import {AddressPrefix, privateKeyToPublicKey, privateKeyToAddress} from '@nervosnetwork/ckb-sdk-utils';
import PWCore, {Address, AddressType, ChainID} from '@lay2/pw-core';
// import {SegmentedControlWithoutStyles as SegmentedControl} from 'segmented-control';
import ethWallet from 'ethereumjs-wallet';
import arrayBufferToBuffer from 'arraybuffer-to-buffer';
import * as Crypto from 'crypto';
// import * as _ from 'lodash';
import ClipboardJS from 'clipboard';

import Config from '../../config.js';
import {ChainTypes} from '../../common/ts/Types';
import NullCollector from '../../collectors/NullCollector';
import NullProvider from '../../providers/NullProvider';
import Utils from '../../common/ts/Utils';
import './Generator.scss';

enum GeneratorComponents
{
	PrivateKey,
	PublicKey,
	CkbAddress,
	CkbCodeHash,
	CkbHashType,
	CkbArgs,
	CkbLockHash,
	PwEthAddress,
	PwAddress,
	PwCodeHash,
	PwHashType,
	PwArgs,
	PwLockHash,
}

function generateRandomPrivateKey()
{
	const promise = new Promise((resolve, _reject) =>
	{
		Crypto.randomBytes(32, (error: Error|null, buffer: Uint8Array) =>
		{
			const hexBytes = Buffer.from(buffer).toString('hex');
			resolve('0x'+hexBytes);
		});
	});

	return promise;
}

async function initPwCore(chain: ChainTypes)
{
	const provider = new NullProvider();
	const collector = new NullCollector();
	const chainId = (chain === ChainTypes.mainnet) ? ChainID.ckb : ChainID.ckb_testnet;
	const pwCore = await new PWCore(Config[ChainTypes[chain] as 'mainnet'|'testnet'].ckbRpcUrl).init(provider, collector, chainId);

	return pwCore;
}

function isPrivateKeyValid(privateKey: string)
{
	const re = /^0x[a-f0-9]{64}$/i;

	return re.test(privateKey);
}

function Component()
{
	const [valid, setValid] = useState(false);
	const [privateKey, setPrivateKey] = useState<string|null>(null);
	const privateKeyRef = useRef<HTMLInputElement>(null);

	const handleGenerateClicked = (e?: React.SyntheticEvent) =>
	{
		if(e) e.preventDefault();

		generateRandomPrivateKey()
		.then((privateKey)=>
		{
			privateKeyRef.current!.value = privateKey as string;
			handlePrivateKeyChange();
		});
	};

	const handlePrivateKeyChange = (e?: React.SyntheticEvent) =>
	{
		if(e) e.preventDefault();

		const privateKeyString = (privateKeyRef.current?.value) ? privateKeyRef.current?.value : '';

		if(!isPrivateKeyValid(privateKeyString))
		{
			setPrivateKey(null);
			setValid(false);
		}
		else
		{
			setPrivateKey(privateKeyString);
			setValid(true);
		}
	};

	const getAddressComponent = (component: GeneratorComponents): string =>
	{
		if(!valid || !privateKey)
			return '';

		let address, lockScript, lockScriptHash, pwEthAddress;

		switch(component)
		{
			case GeneratorComponents.PrivateKey:
				return privateKey;
			case GeneratorComponents.PublicKey:
				return privateKeyToPublicKey(privateKey);
			case GeneratorComponents.CkbAddress:
				address = new Address(privateKeyToAddress(privateKey, {prefix: AddressPrefix.Testnet}), AddressType.ckb);
				return address.toCKBAddress();
			case GeneratorComponents.CkbCodeHash:
				address = new Address(privateKeyToAddress(privateKey, {prefix: AddressPrefix.Testnet}), AddressType.ckb);
				lockScript = address.toLockScript();
				return lockScript.codeHash;
			case GeneratorComponents.CkbHashType:
				address = new Address(privateKeyToAddress(privateKey, {prefix: AddressPrefix.Testnet}), AddressType.ckb);
				lockScript = address.toLockScript();
				return lockScript.hashType;
			case GeneratorComponents.CkbArgs:
				address = new Address(privateKeyToAddress(privateKey, {prefix: AddressPrefix.Testnet}), AddressType.ckb);
				lockScript = address.toLockScript();
				return lockScript.args;
			case GeneratorComponents.CkbLockHash:
				address = new Address(privateKeyToAddress(privateKey, {prefix: AddressPrefix.Testnet}), AddressType.ckb);
				lockScript = address.toLockScript();
				lockScriptHash = lockScript.toHash() 
				return lockScriptHash;
			case GeneratorComponents.PwEthAddress:
				return ethWallet.fromPrivateKey(arrayBufferToBuffer(Utils.hexToArrayBuffer(privateKey))).getAddressString();
			case GeneratorComponents.PwAddress:
				pwEthAddress = ethWallet.fromPrivateKey(arrayBufferToBuffer(Utils.hexToArrayBuffer(privateKey))).getAddressString()
				address = new Address(pwEthAddress, AddressType.eth);
				return address.toCKBAddress();
			case GeneratorComponents.PwCodeHash:
				pwEthAddress = ethWallet.fromPrivateKey(arrayBufferToBuffer(Utils.hexToArrayBuffer(privateKey))).getAddressString()
				address = new Address(pwEthAddress, AddressType.eth);
				lockScript = address.toLockScript();
				return lockScript.codeHash;
			case GeneratorComponents.PwHashType:
				pwEthAddress = ethWallet.fromPrivateKey(arrayBufferToBuffer(Utils.hexToArrayBuffer(privateKey))).getAddressString()
				address = new Address(pwEthAddress, AddressType.eth);
				lockScript = address.toLockScript();
				return lockScript.hashType;
			case GeneratorComponents.PwArgs:
				pwEthAddress = ethWallet.fromPrivateKey(arrayBufferToBuffer(Utils.hexToArrayBuffer(privateKey))).getAddressString()
				address = new Address(pwEthAddress, AddressType.eth);
				lockScript = address.toLockScript();
				return lockScript.args;
			case GeneratorComponents.PwLockHash:
				pwEthAddress = ethWallet.fromPrivateKey(arrayBufferToBuffer(Utils.hexToArrayBuffer(privateKey))).getAddressString()
				address = new Address(pwEthAddress, AddressType.eth);
				lockScript = address.toLockScript();
				lockScriptHash = lockScript.toHash() 
				return lockScriptHash;
			default:
				throw new Error('Invalid address component specified.');
		}
	}

	/* eslint-disable react-hooks/exhaustive-deps */
	useEffect(()=>{initPwCore(ChainTypes.testnet)}, [true]); // Init PwCore.
	useEffect(()=>{handlePrivateKeyChange();}, [true]); // Trigger a private key change when the chain type is updated to reinitialize all values.
	useEffect(()=>{privateKeyRef.current?.focus();}, [true]); // Focus the input field on load, and when the input address type is changed.
	useEffect(()=>{new ClipboardJS('.copy-button');Utils.addCopyButtonTooltips('copy-button');}, [valid]); // Initialize the clipboard buttons.
	/* eslint-enable react-hooks/exhaustive-deps */

	// Values
	const privateKeyClassName = (valid) ? 'valid' : 'invalid';

	const html =
	(
		<main className="generator">
			<h2>Generator Tool</h2>
			<p>
				The Generator tool provides a way to generate private keys and view the common output address formats and associated details.
			</p>
			<p>
				This tool is designed for testing purposes only! Do not use this tool to generate addresses to secure funds and assets!
			</p>
			<form id="address-form" onSubmit={()=>false}>
				{/* <section> */}
					{/* <button className="generate-button" onClick={handleGenerateClicked} title="Generate a new random private key.">Generate Private Key</button> */}
				{/* </section> */}
				<fieldset>
					<legend>Private/Public Key</legend>
					<section>
						<label title="A 256-bit (32 byte) private key.">
							Private Key (256-bit)
							<div className="copy-container">
								<input id="private-key" className={privateKeyClassName} type="text" onChange={handlePrivateKeyChange} ref={privateKeyRef} placeholder="Enter a 256-bit (32 byte) private key in hex format, or press the generate button." />
								<button className="copy-button" data-clipboard-target="#private-key" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
								<button className={"generate-button" + ((valid)?' valid':'')} onClick={handleGenerateClicked} title="Generate a new random private key."><i className="fas fa-sync-alt"></i></button>
							</div>
						</label>
						<label title="A public key that is derived from the private key.">
							Public Key (Secp256k1)
							<div className="copy-container">
								<input id="public-key" type="text" readOnly={true} value={getAddressComponent(GeneratorComponents.PublicKey)} />
								<button className="copy-button" data-clipboard-target="#public-key" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
							</div>
						</label>
					</section>
				</fieldset>
				<fieldset>
					<legend>Default Lock (Secp256k1-Blake160) - Testnet</legend>
					<section>
						<label title='A Nervos CKB address starts with either "ckb" or "ckt".'>
							Nervos CKB Address
							<div className="copy-container">
								<input id="ckb-address" type="text" readOnly={true} value={getAddressComponent(GeneratorComponents.CkbAddress)} />
								<button className="copy-button" data-clipboard-target="#ckb-address" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
							</div>
						</label>
					</section>
					<section>
						<label title="A script code hash indicates the cell dep required for execution.">
							Lock Script Code Hash
							<div className="copy-container">
								<input id="ckb-code-hash" type="text" readOnly={true} value={getAddressComponent(GeneratorComponents.CkbCodeHash)} />
								<button className="copy-button" data-clipboard-target="#ckb-code-hash" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
							</div>
						</label>
						<label title="A script hash type indicates how the code hash should be matched against a cell dep.">
							Lock Script Hash Type
							<div className="copy-container">
								<input id="ckb-hash-type" type="text" readOnly={true} value={getAddressComponent(GeneratorComponents.CkbHashType)} />
								<button className="copy-button" data-clipboard-target="#ckb-hash-type" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
							</div>
						</label>
						<label title="The script args are passed to the script code during execution.">
							Lock Script Args
							<div className="copy-container">
								<input id="ckb-args" type="text" readOnly={true} value={getAddressComponent(GeneratorComponents.CkbArgs)} />
								<button className="copy-button" data-clipboard-target="#ckb-args" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
							</div>
						</label>
					</section>
					<section>
						<label title="A script hash is a 256-bit Blake2b hash of the script structure once it has been serialized in the Molecule format.">
							Lock Script Hash
							<div className="copy-container">
								<input id="ckb-lock-hash" type="text" readOnly={true} value={getAddressComponent(GeneratorComponents.CkbLockHash)} />
								<button className="copy-button" data-clipboard-target="#ckb-lock-hash" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
							</div>
						</label>
					</section>
				</fieldset>
				<fieldset>
					<legend>PW-Lock (Ethereum) - Testnet</legend>
					<section>
						<label title='An Ethereum address derived from the public key.'>
							Ethereum Address
							<div className="copy-container">
								<input id="pw-eth-address" type="text" readOnly={true} value={getAddressComponent(GeneratorComponents.PwEthAddress)} />
								<button className="copy-button" data-clipboard-target="#pw-eth-address" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
							</div>
						</label>
					</section>
					<section>
						<label title='A Nervos CKB address starts with either "ckb" or "ckt".'>
							Nervos CKB Address
							<div className="copy-container">
								<input id="pw-ckb-address" type="text" readOnly={true} value={getAddressComponent(GeneratorComponents.PwAddress)} />
								<button className="copy-button" data-clipboard-target="#pw-ckb-address" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
							</div>
						</label>
					</section>
					<section>
						<label title="A script code hash indicates the cell dep required for execution.">
							Lock Script Code Hash
							<div className="copy-container">
								<input id="pw-code-hash" type="text" readOnly={true} value={getAddressComponent(GeneratorComponents.PwCodeHash)} />
								<button className="copy-button" data-clipboard-target="#pw-code-hash" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
							</div>
						</label>
						<label title="A script hash type indicates how the code hash should be matched against a cell dep.">
							Lock Script Hash Type
							<div className="copy-container">
								<input id="pw-hash-type" type="text" readOnly={true} value={getAddressComponent(GeneratorComponents.PwHashType)} />
								<button className="copy-button" data-clipboard-target="#pw-hash-type" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
							</div>
						</label>
						<label title="The script args are passed to the script code during execution.">
							Lock Script Args
							<div className="copy-container">
								<input id="pw-args" type="text" readOnly={true} value={getAddressComponent(GeneratorComponents.PwArgs)} />
								<button className="copy-button" data-clipboard-target="#pw-args" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
							</div>
						</label>
					</section>
					<section>
						<label title="A script hash is a 256-bit Blake2b hash of the script structure once it has been serialized in the Molecule format.">
							Lock Script Hash
							<div className="copy-container">
								<input id="pw-lock-hash" type="text" readOnly={true} value={getAddressComponent(GeneratorComponents.PwLockHash)} />
								<button className="copy-button" data-clipboard-target="#pw-lock-hash" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
							</div>
						</label>
					</section>
				</fieldset>
			</form>
		</main>
	);

	return html;
}

export default Component;
