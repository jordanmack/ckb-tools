import React, {useState, useEffect} from 'react';
import {useAsync} from 'react-async';
import PWCore, {Address, AddressType, Amount, AmountUnit, Collector, EthProvider, Provider, SUDT} from '@lay2/pw-core';
import {toast} from "react-toastify";
import {Reoverlay} from 'reoverlay';

import Config from '../../config.js';
import BasicCollector from '../../collectors/BasicCollector';
import BurnModal from './BurnModal';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import MintModal from './MintModal';
import SudtBurnBuilder from '../../builders/SudtBurnBuilder';
import SudtMintBuilder from '../../builders/SudtMintBuilder';
import Utils from '../../common/ts/Utils';
import './Sudt.scss';

interface pwObject
{
	collector: Collector,
	pwCore: PWCore,
	provider: Provider,
}

interface getBalancesOptions
{
	callback?: React.Dispatch<any>
}

async function getBalances(collector: BasicCollector, provider: Provider, options?: getBalancesOptions)
{

	const address = new Address(provider.address.addressString, AddressType.eth);
	const capacity = await collector.getBalance(address);
	const sudtBalance = await collector.getSUDTBalance(new SUDT(provider.address.toLockScript().toHash()), provider.address);

	const data = {address, capacity, sudtBalance};

	if(options && options.callback)
		options.callback(data);

	return data;
}

async function mintSudt(pw: pwObject, address: Address, amount: Amount)
{
	const ownerLockHash = pw.provider.address.toLockScript().toHash();
	const collector = new BasicCollector(Config.ckbIndexerUrl);
	const fee = new Amount("10000", AmountUnit.shannon);

	const builder = new SudtMintBuilder(new SUDT(ownerLockHash), address, amount, collector, fee);
	const transaction = await builder.build();
	console.info(transaction);

	const tx_id = await pw.pwCore.sendTransaction(transaction);
	console.log(`Transaction submitted: ${tx_id}`);
}

async function burnSudt(pw: pwObject, address: Address, amount: Amount)
{
	const ownerLockHash = pw.provider.address.toLockScript().toHash();
	const collector = new BasicCollector(Config.ckbIndexerUrl);
	const fee = new Amount("10000", AmountUnit.shannon);

	const builder = new SudtBurnBuilder(new SUDT(ownerLockHash), address, amount, collector, fee);
	const transaction = await builder.build();
	console.info(transaction);

	const tx_id = await pw.pwCore.sendTransaction(transaction);
	console.log(`Transaction submitted: ${tx_id}`);
}

async function initPwCore()
{
	const provider = new EthProvider();
	const collector = new BasicCollector(Config.ckbIndexerUrl);
	const pwCore = await new PWCore(Config.ckbRpcUrl).init(provider, collector);

	return {pwCore, provider, collector};
}

function onBurnConfirm(pw: pwObject, sudtBalance: Amount, options?: {setBusy?: React.Dispatch<any>})
{
	return function(e: React.SyntheticEvent): boolean
	{
		e.preventDefault();
	
		const address = new Address((document.getElementById("burn-token-form")!.getElementsByClassName("address")[0] as HTMLInputElement)!.value, AddressType.ckb);
		if(!address.valid())
		{
			toast.error("An invalid CKB address was provided.");
			return false;
		}
	
		let amount;
		try
		{
			amount = new Amount((document.getElementById("burn-token-form")!.getElementsByClassName("amount")[0] as HTMLInputElement)!.value, 0);
			if(amount.lte(Amount.ZERO))
			{
				toast.error("A valid token amount must be an integer greater than 0.");
				return false;
			}	
		}
		catch(e)
		{
			toast.error("An invalid token amount was provided.");
			return false;
		}

		if(amount.gt(sudtBalance))
		{
			toast.error("You cannot burn more SUDT tokens than you own.");
			return false;
		}

		burnSudt(pw, address, amount)
		.then(()=>
		{
			toast.success("Transaction has been sent to the network.");
		})
		.catch((e)=>
		{
			const error = Utils.decodeError(e);
			if(!!error && error?.json?.code === -1107)
				toast.error("A duplicate transaction was detected. Please wait a minute before resubmitting.");
			else if(e?.code === 4001)
				toast.error(e?.message);
			else
				toast.error("An error occurred while sending the transaction. Please view the console for details.", error?.json?.code);

			console.error(e);
			return false;
		});

		return true;
	}
}

function onMintConfirm(pw: pwObject, options?: {setBusy?: React.Dispatch<any>})
{
	return function(e: React.SyntheticEvent): boolean
	{
		e.preventDefault();
	
		const address = new Address((document.getElementById("mint-token-form")!.getElementsByClassName("address")[0] as HTMLInputElement)!.value, AddressType.ckb);
		if(!address.valid())
		{
			toast.error("An invalid CKB address was provided.");
			return false;
		}
	
		let amount;
		try
		{
			amount = new Amount((document.getElementById("mint-token-form")!.getElementsByClassName("amount")[0] as HTMLInputElement)!.value, 0);
			if(amount.lte(Amount.ZERO))
			{
				toast.error("A valid token amount must be an integer greater than 0.");
				return false;
			}	
		}
		catch(e)
		{
			toast.error("An invalid token amount was provided.");
			return false;
		}
	
		options?.setBusy?.(true);
		mintSudt(pw, address, amount)
		.then(()=>
		{
			toast.success("Transaction has been sent to the network.");
		})
		.catch((e)=>
		{
			const error = Utils.decodeError(e);
			if(!!error && error?.json?.code === -1107)
				toast.error("A duplicate transaction was detected. Please wait a minute before resubmitting.");
			else if(e?.code === 4001)
				toast.error(e?.message);
			else
				toast.error("An error occurred while sending the transaction. Please view the console for details.", error?.json?.code);

			console.error(e);
			return false;
		})
		.finally(()=>
		{
			options?.setBusy?.(false);
		});

		return true;
	}
}

interface DataType
{
	address: Address,
	capacity: Amount,
	sudtBalance: Amount,
}

function App()
{
	const [busy, setBusy] = useState(true);
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<DataType|null>(null);
	const {data: pw, error: pwError} = useAsync(initPwCore);

	const updateData = (newData: any) =>
	{
		setData(newData);
		setBusy(false);
		setLoading(false);
	};

	// const handleTransfer = () =>
	// {
	// 	setBusy(true);
	// 	getBalances(pw!.collector, pw!.provider, {callback: updateData});
	// };

	const handleMint = () =>
	{
		const onConfirm = onMintConfirm(pw!, {setBusy});
		Reoverlay.showModal(MintModal, {defaultAddress: pw!.provider.address.toCKBAddress(), defaultAmount: 0, onConfirm});
	};

	const handleBurn = () =>
	{
		const onConfirm = onBurnConfirm(pw!, data!.sudtBalance, {setBusy});
		Reoverlay.showModal(BurnModal, {defaultAddress: pw!.provider.address.toCKBAddress(), defaultAmount: 0, onConfirm});
	};

	useEffect(()=>{if(pw){getBalances(pw!.collector, pw!.provider, {callback: updateData});}}, [pw]);

	let html = <main></main>;
	if(!pwError)
	{
		html =
		(
			<>
				<main className="sudt">
					<h2>SUDT Tool (Testnet)</h2>
					<p>
						This tool allows you easily create SUDT tokens.
						The account you are using in MetaMask is used to generate the SUDT Token ID.
						This account is also the "owner" or "issuer" of the token, and the only account that can mint more tokens.
						Each account can only have one token associated with it, as intended by the SUDT standard.
						To create a second token, switch to a different account in MetaMask.
					</p>
					<p>
						Note: If you need Testnet CKBytes you can request some from the <a href="https://faucet.nervos.org/" target="_blank" rel="noreferrer">Testnet Faucet</a>.
					</p>
					<table className={(loading) ? 'loading' : ''}>
						<tbody>
							<tr>
								<td>ETH Address:</td>
								<td>{(!loading) ? PWCore.provider.address.addressString : '...'}</td>
							</tr>
							<tr>
								<td>CKB Address:</td>
								<td>{(!loading) ? data!.address.toCKBAddress() : '...'}</td>
							</tr>
							<tr>
								<td>CKB Balance:</td>
								<td>
									{(!loading) ? Number(data!.capacity.toString(AmountUnit.ckb)).toLocaleString() + " CKBytes" : '...'}
								</td>
							</tr>
							<tr>
								<td>SUDT Token ID:</td>
								<td>{(!loading) ? data!.address.toLockScript().toHash() : '...'}</td>
							</tr>
							<tr>
								<td>SUDT Balance:</td>
								<td>{(!loading) ? data!.sudtBalance.toString(0) + " Tokens" : '...'}</td>
							</tr>
						</tbody>
					</table>
					<br />
					<div className="button-bar">
						<button className={(loading) ? 'loading' : ''} disabled={busy} onClick={()=>handleMint()}>Mint Tokens</button>
						<span className="spacer" />
						<button className={(loading) ? 'loading' : ''} disabled={busy} onClick={()=>handleBurn()}>Burn Tokens</button>
						{/* <span className="spacer" /> */}
						{/* <button className={(loading) ? 'loading' : ''} disabled={busy} onClick={()=>handleTransfer()}>Transfer Tokens</button> */}
					</div>
				</main>
				{loading && <LoadingSpinner />}
			</>
		);
	}
	else if(pwError)
	{
		toast.error("An error occurred during loading. Please view the console for details.");
		console.error(pwError);
	}

	return html;
}

export default App;
