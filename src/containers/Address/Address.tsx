import React, {useEffect, useState, useRef} from 'react';
import PWCore, {Address, AddressType, ChainID, CHAIN_SPECS} from '@lay2/pw-core';
import {SegmentedControlWithoutStyles as SegmentedControl} from 'segmented-control';
import * as _ from 'lodash';
import ClipboardJS from 'clipboard';
import {Reoverlay} from 'reoverlay';

import Config from '../../config.js';
import {ChainTypes} from '../../common/ts/Types';
import NullCollector from '../../collectors/NullCollector';
import NullProvider from '../../providers/NullProvider';
import QrCode from '../../components/QrCode/QrCode';
import Utils from '../../common/ts/Utils';
import './Address.scss';

const KNOWN_ADDRESSES: {[key: string]: any} =
{
	'ckt1qyqvsv5240xeh85wvnau2eky8pwrhh4jr8ts8vyj37': <>Note: This address is used for genesis issued cell #1 on a CKB dev chain. More information can be found <a href="https://docs.nervos.org/docs/basics/guides/devchain#adding-the-genesis-issued-cells" target="_blank" rel="noreferrer">here.</a></>,
	'ckt1qyqywrwdchjyqeysjegpzw38fvandtktdhrs0zaxl4': <>Note: This address is used for genesis issued cell #2 on a CKB dev chain. More information can be found <a href="https://docs.nervos.org/docs/basics/guides/devchain#adding-the-genesis-issued-cells" target="_blank" rel="noreferrer">here.</a></>,
};

enum AddressComponents
{
	CkbAddress,
	CodeHash,
	HashType,
	Args,
	LockHash
}

enum AddressFlags
{
	Acp,
	DefaultLock,
	MultiSigLock,
	PwLock,
	OmniLock,
	Mainnet,
	Testnet,
	Ckb2021,
	Pre2021,
}

async function initPwCore(chain: ChainTypes)
{
	const provider = new NullProvider();
	const collector = new NullCollector();
	const chainId = (chain === ChainTypes.mainnet) ? ChainID.ckb : ChainID.ckb_testnet;
	const pwCore = await new PWCore(Config[ChainTypes[chain] as 'mainnet'|'testnet'].ckbRpcUrl).init(provider, collector, chainId);

	return pwCore;
}

function Flag(props: {checked: boolean})
{
	let src;
	if(props.checked)
		src = 'checkbox-checked.png';
	else
		src = 'checkbox-unchecked.png';
	const altText = (props.checked) ? 'Checked Checkbox' : 'Unchecked Checkbox';
	const html = <img className="checkbox" src={src} alt={altText} />;

	return html;
}

function renderNotes(valid: boolean, inputAddress: Address|null)
{
	if(!valid || !inputAddress)
		return null;

	const address = inputAddress.toCKBAddress();

	let html = null;
	if(_.has(KNOWN_ADDRESSES, address))
	{
		html =
		(
			<section className="notes">
				{KNOWN_ADDRESSES[address]}
			</section>
		);
	}

	return html;
}

function renderQrCode(e?: React.SyntheticEvent<HTMLButtonElement>)
{
	if(e)
	{
		e.preventDefault();

		const value = (document.getElementById(e.currentTarget.dataset.target!.substr(1)) as HTMLInputElement).value;
		Reoverlay.showModal(QrCode, {value});
	}
}

function Component()
{
	const [valid, setValid] = useState(false);
	const [inputAddress, setInputAddress] = useState<Address|null>(null);
	const [inputAddressType, setInputAddressType] = useState(AddressType.ckb);
	const [chainType, setChainType] = useState(ChainTypes.mainnet);
	const inputAddressRef = useRef<HTMLInputElement>(null);

	const handleInputAddressChange = (e?: React.SyntheticEvent) =>
	{
		if(e) e.preventDefault();

		const inputAddressString = (inputAddressRef.current?.value) ? inputAddressRef.current?.value : '';
		const inputAddressPrefixCkb = inputAddressString.substr(0, 3);
		const inputAddressPrefixEth = inputAddressString.substr(0, 2);

		if(inputAddressPrefixCkb !== 'ckb' && inputAddressPrefixCkb !== 'ckt' && inputAddressPrefixEth !== '0x')
			setValid(false);
		else
		{
			// Init PWCore basec on the prefix of the address provided.
			// PWCore must be initialized to the proper ChainId before CKB addresses can be validated.
			const ct = (inputAddressType===AddressType.ckb) ? (inputAddressPrefixCkb==='ckb') ? ChainTypes.mainnet : ChainTypes.testnet : chainType;
			initPwCore(ct)
			.then(()=>
			{
				const inputAddress = new Address(inputAddressString, inputAddressType);
				const valid = inputAddress.valid();

				// The validity of the address controls the order that state is updated.
				// To prevent error conditions, `inputAddress` must be set if `valid` is true.
				if(valid)
				{
					setInputAddress((valid) ? inputAddress : null);
					setValid(valid);
				}
				else
				{
					setValid(valid);
					setInputAddress((valid) ? inputAddress : null);
				}
			});
		}
	};

	const handleChainChanged = (value: ChainTypes) =>
	{
		if(value !== chainType)
		{
			setChainType(value);
			// handleInputAddressChange(); // This is now called in useEffect().
		}
	};

	const handleTabClick = (e: React.SyntheticEvent<HTMLSpanElement>) =>
	{
		if(e) e.preventDefault();

		setValid(false);
		setInputAddress(null);
		if(inputAddressRef.current?.value) inputAddressRef.current.value = '';
		setInputAddressType(Number(e.currentTarget.dataset['tab']) as AddressType);
	};

	const getAddressComponent = (component: AddressComponents) =>
	{
		if(!valid)
			return '';

		const lockScript = inputAddress!.toLockScript();

		if(component === AddressComponents.CodeHash)
			return lockScript.codeHash;
		else if(component === AddressComponents.HashType)
			return lockScript.hashType;
		else if(component === AddressComponents.Args)
			return lockScript.args;
		else if(component === AddressComponents.LockHash)
			return lockScript.toHash();
		else if(component === AddressComponents.CkbAddress)
			return inputAddress!.toCKBAddress();
		else
			throw new Error('Invalid address component specified.');
	}

	const getAddressFlag = (flag: AddressFlags) =>
	{
		if(!valid)
			return false;

		const lockScript = inputAddress!.toLockScript();
		lockScript.args = '0x'; // Clear args so it can match against the chain specs which never include args.
		const inputAddressPrefix = inputAddress!.toCKBAddress().substr(0, 3);
		const addressDetails = inputAddress!.describe();

		// The code below is manipulating and filtering the chainspecs so it can be checked against easier.
		const chainSpecs = _.flatMap(CHAIN_SPECS, (n)=>[n]);
		const acpLockList = _.flatten(chainSpecs.filter((o)=>_.has(o, 'acpLockList')).map((o)=>o.acpLockList));
		const defaultLockList = _.flatten(chainSpecs.filter((o)=>_.has(o, 'defaultLock.script')).map((o)=>o.defaultLock.script));
		const multiSigLockList = _.flatten(chainSpecs.filter((o)=>_.has(o, 'multiSigLock.script')).map((o)=>o.multiSigLock.script));
		const pwLockList = _.flatten(chainSpecs.filter((o)=>_.has(o, 'pwLock.script')).map((o)=>o.pwLock.script));
		const omniLockList = _.flatten(chainSpecs.filter((o)=>_.has(o, 'omniLock.script')).map((o: any)=>o.omniLock.script)); // "o: any" used to ignore erroneous error on missing o.omniLock.

		if(flag === AddressFlags.Acp)
			return !!acpLockList.find((n)=>n.sameWith(lockScript));
		if(flag === AddressFlags.DefaultLock)
			return !!defaultLockList.find((n)=>n.sameWith(lockScript));
		if(flag === AddressFlags.MultiSigLock)
			return !!multiSigLockList.find((n)=>n.sameWith(lockScript));
		if(flag === AddressFlags.PwLock)
			return !!pwLockList.find((n)=>n.sameWith(lockScript));
		if(flag === AddressFlags.OmniLock)
			return !!omniLockList.find((n)=>n.sameWith(lockScript));
		if(flag === AddressFlags.Mainnet)
			return (inputAddressType===AddressType.ckb) ? inputAddressPrefix==='ckb' : ChainTypes[chainType]==='mainnet';
		if(flag === AddressFlags.Testnet)
			return (inputAddressType===AddressType.ckb) ? inputAddressPrefix==='ckt' : ChainTypes[chainType]==='testnet';
		if(flag === AddressFlags.Ckb2021)
			return addressDetails.addressVersion==='ckb2021';
		if(flag === AddressFlags.Pre2021)
			return addressDetails.addressVersion==='pre2021';
		else
			throw new Error('Invalid address flag specified.');
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(()=>{handleInputAddressChange();}, [chainType]); // Trigger an input address change when the chain type is updated to reinitialize all values.
	useEffect(()=>{inputAddressRef.current?.focus();}, [inputAddressType]); // Focus the input field on load, and when the input address type is changed.
	useEffect(()=>{new ClipboardJS('.copy-button');Utils.addCopyButtonTooltips('copy-button');}, [chainType, inputAddressType]); // Initialize the clipboard buttons.

	// Values
	const inputAddressClassName = (valid) ? 'valid' : 'invalid';
	const inputAddressPlaceholder = {[AddressType.ckb]: 'Enter a Nervos CKB address to get started. eg: ckt1qyqvsv5240xeh85wvnau2eky8pwrhh4jr8ts8vyj37', [AddressType.eth]: 'Enter an Ethereum address to get started. eg: 0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', [AddressType.eos]: '', [AddressType.tron]: ''}[inputAddressType];
	const inputAddressLabel = {[AddressType.ckb]: 'Nervos CKB Address', [AddressType.eth]: 'Ethereum Address', [AddressType.eos]: '', [AddressType.tron]: ''}[inputAddressType];
	const inputAddressTitle = {[AddressType.ckb]: 'A Nervos CKB address starts with either "ckb" or "ckt".', [AddressType.eth]: 'An Ethereum address starts with "0x" and is 42 characters long.', [AddressType.eos]: '', [AddressType.tron]: ''}[inputAddressType];

	const html =
	(
		<main className="address">
			<h2>Address Tool</h2>
			<p>
				The Address tool allows Nervos CKB addresses to be converted and decoded to view the components and attributes associated with it.
			</p>
			<form id="address-form" className={AddressType[inputAddressType]} onSubmit={()=>false}>
				<section className="tabs">
					<ul>
						<li><span className={(inputAddressType===AddressType.ckb)?'active':''} onClick={handleTabClick} data-tab={AddressType.ckb}>Nervos CKB</span></li>
						<li><span className={(inputAddressType===AddressType.eth)?'active':''} onClick={handleTabClick} data-tab={AddressType.eth}>Ethereum</span></li>
					</ul>
				</section>
				<section className="input-address">
					<label title={inputAddressTitle}>
						{inputAddressLabel}
						<div className="button-container">
								<input id="input-address" className={inputAddressClassName} type="text" onChange={handleInputAddressChange} ref={inputAddressRef} placeholder={inputAddressPlaceholder} />
								<button className="qrcode-button" data-target="#input-address" onClick={renderQrCode} disabled={!valid}><i className="fas fa-qrcode"></i></button>
								<button className="copy-button" data-clipboard-target="#input-address" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
						</div>
					</label>
				</section>
				{ (inputAddressType===AddressType.eth) &&
					<section>
						<label title='Chain types can be either Mainnet or Testnet.'>
							Nervos CKB Chain Type
							<SegmentedControl name="chain-type" setValue={handleChainChanged} options={
								[
									{label: 'Mainnet', value: ChainTypes.mainnet, default: true},
									{label: 'Testnet', value: ChainTypes.testnet},
								]
							} />
						</label>
					</section>
				}
				{(inputAddressType===AddressType.eth) &&
					<section className="output-address">
						<label title='A Nervos CKB address starts with either "ckb" or "ckt".'>
							Nervos CKB Address
							<div className="button-container">
								<input id="output-address" type="text" readOnly={true} value={getAddressComponent(AddressComponents.CkbAddress)} />
								<button className="qrcode-button" data-target="#output-address" onClick={renderQrCode} disabled={!valid}><i className="fas fa-qrcode"></i></button>
								<button className="copy-button" data-clipboard-target="#output-address" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
							</div>
						</label>
					</section>
				}
				<section>
					<label title="A script code hash indicates the cell dep required for execution.">
						Lock Script Code Hash
						<div className="button-container">
							<input id="code-hash" type="text" readOnly={true} value={getAddressComponent(AddressComponents.CodeHash)} />
							<button className="qrcode-button" data-target="#code-hash" onClick={renderQrCode} disabled={!valid}><i className="fas fa-qrcode"></i></button>
							<button className="copy-button" data-clipboard-target="#code-hash" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
						</div>
					</label>
					<label title="A script hash type indicates how the code hash should be matched against a cell dep.">
						Lock Script Hash Type
						<div className="button-container">
							<input id="hash-type" type="text" readOnly={true} value={getAddressComponent(AddressComponents.HashType)} />
							<button className="qrcode-button" data-target="#hash-type" onClick={renderQrCode} disabled={!valid}><i className="fas fa-qrcode"></i></button>
							<button className="copy-button" data-clipboard-target="#hash-type" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
						</div>
					</label>
					<label title="The script args are passed to the script code during execution.">
						Lock Script Args
						<div className="button-container">
							<input id="args" type="text" readOnly={true} value={getAddressComponent(AddressComponents.Args)} />
							<button className="qrcode-button" data-target="#args" onClick={renderQrCode} disabled={!valid}><i className="fas fa-qrcode"></i></button>
							<button className="copy-button" data-clipboard-target="#args" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
						</div>
					</label>
				</section>
				<section>
					<label title="A script hash is a 256-bit Blake2b hash of the script structure once it has been serialized in the Molecule format.">
						Lock Script Hash
						<div className="button-container">
							<input id="lock-hash" type="text" readOnly={true} value={getAddressComponent(AddressComponents.LockHash)} />
							<button className="qrcode-button" data-target="#lock-hash" onClick={renderQrCode} disabled={!valid}><i className="fas fa-qrcode"></i></button>
							<button className="copy-button" data-clipboard-target="#lock-hash" onClick={(e)=>e.preventDefault()} disabled={!valid}><i className="far fa-copy"></i></button>
						</div>
					</label>
				</section>
				<section className="flags">
					<fieldset>
						<label title='A Mainnet address always starts with "ckb".'>
							<span className="label">Mainnet</span> <Flag checked={getAddressFlag(AddressFlags.Mainnet)} />
						</label>
						<label title='A Testnet address always starts with "ckt".'>
							<span className="label">Testnet</span> <Flag checked={getAddressFlag(AddressFlags.Testnet)} />
						</label>
					</fieldset>
					<fieldset>
						<label title="An Anyone Can Pay (ACP) lock allows a user to receive funds without creating a new cell.">
							<span className="label">ACP</span> <Flag checked={getAddressFlag(AddressFlags.Acp)} />
						</label>
						<label title="The Default lock is also known as the SECP256k1-Blake160-Sighash lock.">
							<span className="label">Default Lock</span> <Flag checked={getAddressFlag(AddressFlags.DefaultLock)} />
						</label>
						<label title="The Multi-Sig lock is also known as the SECP256k1-Blake160-MultiSig lock.">
							<span className="label">Multi-Sig Lock</span> <Flag checked={getAddressFlag(AddressFlags.MultiSigLock)} />
						</label>
						<label title="PW-Lock is used for compatibility with wallets from other chains, such as MetaMask. Usage of PW-Lock is deprecated.">
							<span className="label">PW-Lock</span> <Flag checked={getAddressFlag(AddressFlags.PwLock)} />
						</label>
						<label title="Omni Lock is used for compatibility with wallets from other chains, such as MetaMask. Omni Lock is the replacement for PW-Lock.">
							<span className="label">Omni Lock</span> <Flag checked={getAddressFlag(AddressFlags.OmniLock)} />
						</label>
					</fieldset>
					<fieldset>
						<label title='CKB2021 addresses use the most recent encoding.'>
							<span className="label">CKB2021</span> <Flag checked={getAddressFlag(AddressFlags.Ckb2021)} />
						</label>
						<label title='Pre-2021 addresses use a deprecated address format.'>
							<span className="label">Pre-2021</span> <Flag checked={getAddressFlag(AddressFlags.Pre2021)} />
						</label>
					</fieldset>
				</section>
				{renderNotes(valid, inputAddress)}
			</form>
		</main>
	);

	return html;
}

export default Component;
