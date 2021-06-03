import React, {useEffect, useState, useRef} from 'react';
import PWCore, {Address, AddressType, ChainID, CHAIN_SPECS} from '@lay2/pw-core';
import {SegmentedControlWithoutStyles as SegmentedControl} from 'segmented-control';
import * as _ from 'lodash';

import Config from '../../config.js';
import NullCollector from '../../collectors/NullCollector';
import NullProvider from '../../providers/NullProvider';
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
	Mainnet,
	Testnet,
}

enum ChainTypes
{
	mainnet,
	testnet,
}

async function initPwCore(chain: 'mainnet'|'testnet')
{
	const provider = new NullProvider();
	const collector = new NullCollector();
	const chainId = (chain === 'mainnet') ? ChainID.ckb : ChainID.ckb_testnet;
	const pwCore = await new PWCore(Config[chain].ckbRpcUrl).init(provider, collector, chainId);

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
			const ct = (inputAddressType===AddressType.ckb) ? (inputAddressPrefixCkb==='ckb') ? 'mainnet' : 'testnet' : ChainTypes[chainType];
			initPwCore(ct as 'mainnet'|'testnet')
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

		const chainSpecs = _.flatMap(CHAIN_SPECS, (n)=>[n]);
		const acpLockList = _.flatten(chainSpecs.filter((o)=>_.has(o, 'acpLockList')).map((o)=>o.acpLockList));
		const defaultLockList = _.flatten(chainSpecs.filter((o)=>_.has(o, 'defaultLock.script')).map((o)=>o.defaultLock.script));
		const multiSigLockList = _.flatten(chainSpecs.filter((o)=>_.has(o, 'multiSigLock.script')).map((o)=>o.multiSigLock.script));
		const pwLockList = _.flatten(chainSpecs.filter((o)=>_.has(o, 'pwLock.script')).map((o)=>o.pwLock.script));

		if(flag === AddressFlags.Acp)
			return !!acpLockList.find((n)=>n.sameWith(lockScript));
		if(flag === AddressFlags.DefaultLock)
			return !!defaultLockList.find((n)=>n.sameWith(lockScript));
		if(flag === AddressFlags.MultiSigLock)
			return !!multiSigLockList.find((n)=>n.sameWith(lockScript));
		if(flag === AddressFlags.PwLock)
			return !!pwLockList.find((n)=>n.sameWith(lockScript));
		if(flag === AddressFlags.Mainnet)
			return (inputAddressType===AddressType.ckb) ? inputAddressPrefix==='ckb' : ChainTypes[chainType]==='mainnet';
			if(flag === AddressFlags.Testnet)
			return (inputAddressType===AddressType.ckb) ? inputAddressPrefix==='ckt' : ChainTypes[chainType]==='testnet';
		else
			throw new Error('Invalid address flag specified.');
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(()=>{handleInputAddressChange();}, [chainType]); // Trigger an input address change when the chain type is updated to reinitialize all values.
	useEffect(()=>{inputAddressRef.current?.focus();}, [inputAddressType]); // Focus the input field on load, and when the input address type is changed.

	// Values
	const inputAddressClassName = (valid) ? 'valid' : 'invalid';
	const inputAddressPlaceholder = {[AddressType.ckb]: 'Enter a Nervos CKB address to get started. eg: ckt1qyqvsv5240xeh85wvnau2eky8pwrhh4jr8ts8vyj37', [AddressType.eth]: 'Enter an Ethereum address to get started. eg: 0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'}[inputAddressType];
	const inputAddressLabel = {[AddressType.ckb]: 'Nervos CKB Address', [AddressType.eth]: 'Ethereum Address'}[inputAddressType];
	const inputAddressTitle = {[AddressType.ckb]: 'A Nervos CKB address starts with either "ckb" or "ckt".', [AddressType.eth]: 'An Ethereum address starts with "0x" and is 42 characters long.'}[inputAddressType];

	const html =
	(
		<main className="address">
			<h2>Address Tool</h2>
			<p>
				This tool allows Nervos CKB addresses to be decoded to view the components and attributes associated with it.
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
						<input id="input-address" className={inputAddressClassName} type="text" onChange={handleInputAddressChange} ref={inputAddressRef} placeholder={inputAddressPlaceholder} />
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
							<input type="text" readOnly={true} value={getAddressComponent(AddressComponents.CkbAddress)} />
						</label>
					</section>
				}
				<section>
					<label title="A script code hash indicates the cell dep required for execution.">
						Lock Script Code Hash
						<input type="text" readOnly={true} value={getAddressComponent(AddressComponents.CodeHash)} />
					</label>
					<label title="A script hash type indicates how the code hash should be matched against a cell dep.">
						Lock Script Hash Type
						<input type="text" readOnly={true} value={getAddressComponent(AddressComponents.HashType)} />
					</label>
					<label title="The script args are passed to the script code during execution.">
						Lock Script Args
						<input type="text" readOnly={true} value={getAddressComponent(AddressComponents.Args)} />
					</label>
				</section>
				<section>
					<label title="A script hash is a 256-bit Blake2b hash of the script structure once it has been serialized in the Molecule format.">
						Lock Script Hash
						<input type="text" readOnly={true} value={getAddressComponent(AddressComponents.LockHash)} />
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
						<label title="The PW-Lock is used for compatibility with wallets from other chains, such as MetaMask.">
							<span className="label">PW-Lock</span> <Flag checked={getAddressFlag(AddressFlags.PwLock)} />
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
