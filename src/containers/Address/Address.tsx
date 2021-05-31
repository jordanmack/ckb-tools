import React, {useEffect, useState, useRef} from 'react';
import PWCore, {Address, AddressType, ChainID, CHAIN_SPECS} from '@lay2/pw-core';
import * as _ from 'lodash';

import Config from '../../config.js';
import NullCollector from '../../collectors/NullCollector';
import NullProvider from '../../providers/NullProvider';
import './Address.scss';

enum AddressComponents
{
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

async function initPwCore(chain: "mainnet"|"testnet")
{
	const provider = new NullProvider();
	const collector = new NullCollector();
	const pwCore = await new PWCore(Config[chain].ckbRpcUrl).init(provider, collector, ChainID.ckb);

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

function Component()
{
	const [valid, setValid] = useState(false);
	const [inputAddress, setInputAddress] = useState<Address|null>(null);
	const inputAddressRef = useRef<HTMLInputElement>(null);

	const handleInputAddressChange = (e: React.SyntheticEvent) =>
	{
		e.preventDefault();
	
		const inputAddressString = (inputAddressRef.current?.value) ? inputAddressRef.current?.value : '';
		const inputAddressPrefix = inputAddressString.substr(0, 3);

		if(inputAddressPrefix !== 'ckb' && inputAddressPrefix !== 'ckt')
			setValid(false);
		else
		{
			// Init PWCore basec on the prefix of the address provided.
			// PWCore must be initialized to the proper ChainId before addresses can be validated.
			initPwCore((inputAddressPrefix==='ckb') ? 'mainnet' : 'testnet')
			.then(()=>
			{
				const inputAddress = new Address(inputAddressString, AddressType.ckb);
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

	const getAddressComponent = (component: AddressComponents) =>
	{
		if(!valid)
			return '';

		const lockScript = inputAddress!.toLockScript();

		if(component === AddressComponents.CodeHash)
			return lockScript.codeHash;
		if(component === AddressComponents.HashType)
			return lockScript.hashType;
		if(component === AddressComponents.Args)
			return lockScript.args;
		if(component === AddressComponents.LockHash)
			return lockScript.toHash();
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
		const MultiSigLockList = _.flatten(chainSpecs.filter((o)=>_.has(o, 'multiSigLock.script')).map((o)=>o.multiSigLock.script));
		const pwLockList = _.flatten(chainSpecs.filter((o)=>_.has(o, 'pwLock.script')).map((o)=>o.pwLock.script));

		if(flag === AddressFlags.Acp)
			return !!acpLockList.find((n)=>n.sameWith(lockScript));
		if(flag === AddressFlags.DefaultLock)
			return !!defaultLockList.find((n)=>n.sameWith(lockScript));
		if(flag === AddressFlags.MultiSigLock)
			return !!MultiSigLockList.find((n)=>n.sameWith(lockScript));
		if(flag === AddressFlags.PwLock)
			return !!pwLockList.find((n)=>n.sameWith(lockScript));
		if(flag === AddressFlags.Mainnet)
			return inputAddressPrefix==='ckb';
		if(flag === AddressFlags.Testnet)
			return inputAddressPrefix==='ckt';
		else
			throw new Error('Invalid address flag specified.');
	}

	useEffect(()=>
	{
		inputAddressRef.current?.focus();
	});

	const html =
	(
		<main className="address">
			<h2>Address Tool</h2>
			<p>
				This tool allows for the decoding of an address to view the components and attributes associated with it.
			</p>
			<form id="address-form" onSubmit={()=>false}>
				<section>
					<label>
						Nervos CKB Address
						<input id="input-address" className={(valid)?'valid':'invalid'} type="text" onChange={handleInputAddressChange} ref={inputAddressRef} placeholder="Enter a Nervos CKB address to get started." />
					</label>
				</section>
				<section>
					<label>
						Lock Script Code Hash
						<input type="text" readOnly={true} value={getAddressComponent(AddressComponents.CodeHash)} />
					</label>
					<label>
						Lock Script Hash Type
						<input type="text" readOnly={true} value={getAddressComponent(AddressComponents.HashType)} />
					</label>
					<label>
						Lock Script Args
						<input type="text" readOnly={true} value={getAddressComponent(AddressComponents.Args)} />
					</label>
				</section>
				<section>
					<label>
						Lock Script Hash
						<input type="text" readOnly={true} value={getAddressComponent(AddressComponents.LockHash)} />
					</label>
				</section>
				<section className="flags">
					<fieldset>
						<label>Mainnet <Flag checked={getAddressFlag(AddressFlags.Mainnet)} /></label>
						<label>Testnet <Flag checked={getAddressFlag(AddressFlags.Testnet)} /></label>
					</fieldset>
					<fieldset>
						<label>ACP <Flag checked={getAddressFlag(AddressFlags.Acp)} /></label>
						<label>Default Lock <Flag checked={getAddressFlag(AddressFlags.DefaultLock)} /></label>
						<label>Multi-Sig Lock <Flag checked={getAddressFlag(AddressFlags.MultiSigLock)} /></label>
						<label>PW-Lock <Flag checked={getAddressFlag(AddressFlags.PwLock)} /></label>
					</fieldset>
				</section>
			</form>
		</main>
	);

	return html;
}

export default Component;
