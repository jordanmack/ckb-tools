import React, {useEffect, useState, useRef} from 'react';
import PWCore, {Address, AddressType, ChainID, CHAIN_SPECS} from '@lay2/pw-core';
import * as _ from 'lodash';

import Config from '../../config.js';
import NullCollector from '../../collectors/NullCollector';
import NullProvider from '../../providers/NullProvider';
import './Address.scss';

const KNOWN_ADDRESSES: {[key: string]: any} =
{
	'ckt1qyqvsv5240xeh85wvnau2eky8pwrhh4jr8ts8vyj37': <>Note: This address is used for genesis issued cell #1 on a CKB dev chain. More information can be found <a href="https://docs.nervos.org/docs/basics/guides/devchain" target="_blank" rel="noreferrer">here.</a></>,
	'ckt1qyqywrwdchjyqeysjegpzw38fvandtktdhrs0zaxl4': <>Note: This address is used for genesis issued cell #2 on a CKB dev chain. More information can be found <a href="https://docs.nervos.org/docs/basics/guides/devchain" target="_blank" rel="noreferrer">here.</a></>,
};

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

async function initPwCore(chain: 'mainnet'|'testnet')
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

function generateNotesSection(valid: boolean, inputAddress: Address|null)
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
					<label title='A Nervos CKB address normally started with either "ckb" or "ckt".'>
						Nervos CKB Address
						<input id="input-address" className={(valid)?'valid':'invalid'} type="text" onChange={handleInputAddressChange} ref={inputAddressRef} placeholder="Enter a Nervos CKB address to get started. eg: ckt1qyqvsv5240xeh85wvnau2eky8pwrhh4jr8ts8vyj37" />
					</label>
				</section>
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
				{generateNotesSection(valid, inputAddress)}
			</form>
		</main>
	);

	return html;
}

export default Component;
