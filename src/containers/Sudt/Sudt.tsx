import React, {useState, useEffect} from 'react';
import PWCore, {Address, AddressType, Amount, AmountUnit, EthProvider, Provider, SUDT} from '@lay2/pw-core';
import {toast} from 'react-toastify';
import {Reoverlay} from 'reoverlay';
import {SegmentedControlWithoutStyles as SegmentedControl} from 'segmented-control';
import * as _ from 'lodash';
import ClipboardJS from 'clipboard';
import detectEthereumProvider from '@metamask/detect-provider';

import Config from '../../config.js';
import {ChainTypes} from '../../common/ts/Types';
import type {ChainTypeString} from '../../common/ts/Types';
import BasicCollector from '../../collectors/BasicCollector';
import BurnModal from './BurnModal';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import MintModal from './MintModal';
import SudtBurnBuilder from '../../builders/SudtBurnBuilder';
import SudtMintBuilder from '../../builders/SudtMintBuilder';
import Utils from '../../common/ts/Utils';
import './Sudt.scss';

interface PwObject
{
	collector: BasicCollector,
	pwCore: PWCore,
	provider: Provider,
}

interface DataType
{
	address: Address,
	capacity: Amount,
	sudtBalance: Amount,
}

interface getBalancesOptions
{
	callback?: React.Dispatch<any>
}

enum TransactionStatus
{
	Pending,
	Confirmed,
	Failed
}

interface TransactionTracker
{
	txId: string,
	timestamp: number,
	updated: number,
	status: TransactionStatus
}

let transactionMonitorTimer: NodeJS.Timeout | null = null;

const getBalances = _.debounce(getBalancesReal, Config.defaultDebouceDelay);
async function getBalancesReal(collector: BasicCollector, provider: Provider, options?: getBalancesOptions)
{
	const address = new Address(provider.address.addressString, AddressType.eth);
	const capacity = await collector.getBalance(address);
	const sudtBalance = await collector.getSUDTBalance(new SUDT(provider.address.toLockScript().toHash()), provider.address);

	const data = {address, capacity, sudtBalance};

	if(options && options.callback)
		options.callback(data);

	return data;
}

async function mintSudt(pw: PwObject, chainType: ChainTypes, destinationAddress: Address, amount: Amount)
{
	const issuerAddress = pw.provider.address;
	const issuerLockHash = issuerAddress.toLockScript().toHash();
	const collector = new BasicCollector(Config[ChainTypes[chainType] as ChainTypeString].ckbIndexerUrl);
	const fee = new Amount('10000', AmountUnit.shannon);

	const builder = new SudtMintBuilder(new SUDT(issuerLockHash), issuerAddress, destinationAddress, amount, collector, fee);
	const transaction = await builder.build();
	console.info(transaction);

	const txId = await pw.pwCore.sendTransaction(transaction);
	console.log(`Transaction submitted: ${txId}`);

	return txId;
}

async function burnSudt(pw: PwObject, chainType: ChainTypes, burnAddress: Address, amount: Amount)
{
	const issuerLockHash = pw.provider.address.toLockScript().toHash();
	const collector = new BasicCollector(Config[ChainTypes[chainType] as ChainTypeString].ckbIndexerUrl);
	const fee = new Amount('10000', AmountUnit.shannon);

	const builder = new SudtBurnBuilder(new SUDT(issuerLockHash), burnAddress, amount, collector, fee);
	const transaction = await builder.build();
	console.info(transaction);

	const txId = await pw.pwCore.sendTransaction(transaction);
	console.log(`Transaction submitted: ${txId}`);

	return txId;
}

async function initPwCore(chainType: ChainTypes)
{
	const provider = new EthProvider();
	const collector = new BasicCollector(Config[ChainTypes[chainType] as ChainTypeString].ckbIndexerUrl);
	const pwCore = await new PWCore(Config[ChainTypes[chainType] as ChainTypeString].ckbRpcUrl).init(provider, collector);

	return {pwCore, provider, collector};
}

function onBurnConfirm(pw: PwObject, chainType: ChainTypes, sudtBalance: Amount, options?: {setBusy?: React.Dispatch<any>, addTransaction?: React.Dispatch<any>})
{
	return function(e: React.SyntheticEvent): boolean
	{
		e.preventDefault();
	
		const address = new Address((document.getElementById('burn-token-form')!.getElementsByClassName('address')[0] as HTMLInputElement)!.value, AddressType.ckb);
		if(!address.valid())
		{
			toast.error('An invalid CKB address was provided.');
			return false;
		}
	
		let amount;
		try
		{
			amount = new Amount((document.getElementById('burn-token-form')!.getElementsByClassName('amount')[0] as HTMLInputElement)!.value, 0);
			if(amount.lte(Amount.ZERO))
			{
				toast.error('A valid token amount must be an integer greater than 0.');
				return false;
			}	
		}
		catch(e)
		{
			toast.error('An invalid token amount was provided.');
			return false;
		}

		if(amount.gt(sudtBalance))
		{
			toast.error('You cannot burn more SUDT tokens than you own.');
			return false;
		}

		burnSudt(pw, chainType, address, amount)
		.then((txId)=>
		{
			options?.addTransaction?.(txId);
			toast.success('Transaction has been sent to the network.');
		})
		.catch((e)=>
		{
			const error = Utils.decodeError(e);
			if(!!error && error?.json?.code === -1107)
				toast.error('A duplicate transaction was detected. Please wait a minute before resubmitting.');
			else if(e?.code === 4001)
				toast.error(e?.message);
			else
				toast.error('An error occurred while sending the transaction. Please view the console for details.', error?.json?.code);

			console.error(e);
			return false;
		});

		return true;
	}
}

function onMintConfirm(pw: PwObject, chainType: ChainTypes, options?: {setBusy?: React.Dispatch<any>, addTransaction?: React.Dispatch<any>})
{
	return function(e: React.SyntheticEvent): boolean
	{
		e.preventDefault();
	
		const address = new Address((document.getElementById('mint-token-form')!.getElementsByClassName('address')[0] as HTMLInputElement)!.value, AddressType.ckb);
		if(!address.valid())
		{
			toast.error('An invalid CKB address was provided.');
			return false;
		}
	
		let amount;
		try
		{
			amount = new Amount((document.getElementById('mint-token-form')!.getElementsByClassName('amount')[0] as HTMLInputElement)!.value, 0);
			if(amount.lte(Amount.ZERO))
			{
				toast.error('A valid token amount must be an integer greater than 0.');
				return false;
			}	
		}
		catch(e)
		{
			toast.error('An invalid token amount was provided.');
			return false;
		}
	
		options?.setBusy?.(true);
		mintSudt(pw, chainType, address, amount)
		.then((txId)=>
		{
			options?.addTransaction?.(txId);
			toast.success('Transaction has been sent to the network.');
		})
		.catch((e)=>
		{
			const error = Utils.decodeError(e);
			if(!!error && error?.json?.code === -1107)
				toast.error('A duplicate transaction was detected. Please wait a minute before resubmitting.');
			else if(e?.code === 4001)
				toast.error(e?.message);
			else
				toast.error('An error occurred while sending the transaction. Please view the console for details.', error?.json?.code);

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

function generateTransactionRows(transactions: TransactionTracker[], chainType: ChainTypes)
{
	const rows = [];

	for(const [i, transaction] of transactions.entries())
	{
		const shortTx = <span className="short">{transaction.txId.substr(0, 10)}…{transaction.txId.substr(58)}</span>
		const longTx = <span className="long">{transaction.txId}</span>;
		const explorerLink = (Config[ChainTypes[chainType] as ChainTypeString].ckbExplorerUrl) ? <a href={Config[ChainTypes[chainType] as ChainTypeString].ckbExplorerUrl + 'transaction/' + transaction.txId} target="_blank" rel="noreferrer">{shortTx}{longTx}</a> : transaction.txId;

		let transactionStatus;
		if(transaction.status === TransactionStatus.Pending)
			transactionStatus = <span title="The transaction is waiting for confirmation.">Pending</span>;
		else if(transaction.status === TransactionStatus.Confirmed)
			transactionStatus = <span title="The transaction has been confirmed.">Confirmed</span>;
		else if(transaction.status === TransactionStatus.Failed)
			transactionStatus = <span title="The transaction did not confirm in the expected timeframe.">Failed</span>;
		else
			transactionStatus = <span>Unknown</span>;

		const row = 
		(
			<tr key={i}>
				<td>{explorerLink}</td>
				<td>{transactionStatus}</td>
			</tr>
		);
		rows.push(row);
	}

	return rows;
}

async function updateTransactionMonitor(pw: PwObject, transactions: TransactionTracker[], setTransactions: React.Dispatch<any>)
{
	// Get the current time.
	const time = new Date().getTime();

	// Track if a status change occurred.
	let statusChanged = false;

	// Sort by the last updated time.
	const sortedTransactions = _.sortBy(transactions, 'updated');
	for(const [i, transaction] of sortedTransactions.entries())
	{
		// If transaction is pending and needs to be updated.
		if(transaction.status === TransactionStatus.Pending && transaction.updated <= time - Config.sudtTransactionMonitorUpdateDelay)
		{
			// Try and catch is used here to suppress errors because status updates are a non-essential background process.
			try
			{
				// Retrieve the status from the RPC.
				const txData = await pw.pwCore.rpc.get_transaction(transaction.txId);
				const status = txData?.tx_status?.status;

				// Create a new transaction structure to update.
				const newTransactions = _.cloneDeep(sortedTransactions);

				// Update the transaction update time.
				newTransactions[i].updated = time;

				// Check if status is committed.
				if(status === 'committed')
				{
					newTransactions[i].status = TransactionStatus.Confirmed;
					statusChanged = true;
				}

				// Check if failure time has passed.
				else if(transaction.timestamp < time - Config.sudtTransactionMonitorFailureDelay)
				{
					newTransactions[i].status = TransactionStatus.Failed;
					statusChanged = true;
				}

				// Resort by timestamp so they show up in the order they were added.
				const resortedTransactions = _.sortBy(newTransactions, 'timestamp');

				// Update transactions.
				setTransactions(resortedTransactions);
			}
			catch(e)
			{
				console.error(e);
			}

			// Only process the first found entry per cycle.
			break;
		}
	}

	return statusChanged;
}

function Component()
{
	const [busy, setBusy] = useState(true);
	const [loading, setLoading] = useState(true);
	const [chainType, setChainType] = useState(ChainTypes.testnet);
	const [data, setData] = useState<DataType|null>(null);
	const [transactions, setTransactions] = useState<TransactionTracker[]>([]);
	const [transactionStatusUpdateTime, setTransactionStatusUpdateTime] = useState(0);
	const [pw, setPw] = useState<PwObject|null>(null);

	const updateData = (newData: any) =>
	{
		setData(newData);
		setBusy(false);
		setLoading(false);
	};

	const addTransaction = (txId: string) =>
	{
		const tx =
		{
			txId,
			timestamp: new Date().getTime(),
			updated: new Date().getTime(),
			status: TransactionStatus.Pending
		};

		const newTransactions = _.cloneDeep(transactions);
		newTransactions.push(tx);

		setTransactions(newTransactions);
	};

	const handleChainChanged = (value: ChainTypes) =>
	{
		if(value !== chainType)
		{
			setBusy(true);
			setLoading(true);
			setTransactions([]);
			setTransactionStatusUpdateTime(0);
			setChainType(value);
		}
	};

	const handleMint = () =>
	{
		const onConfirm = onMintConfirm(pw!, chainType, {setBusy, addTransaction});
		Reoverlay.showModal(MintModal, {defaultAddress: pw!.provider.address.toCKBAddress(), defaultAmount: 0, onConfirm});
	};

	const handleBurn = () =>
	{
		const onConfirm = onBurnConfirm(pw!, chainType, data!.sudtBalance, {setBusy, addTransaction});
		Reoverlay.showModal(BurnModal, {defaultAddress: pw!.provider.address.toCKBAddress(), defaultAmount: 0, onConfirm});
	};

	useEffect(()=>
	{
		detectEthereumProvider()
		.then(function(provider)
		{
			if(provider)
			{
				initPwCore(chainType)
				.then((pwValues) =>
				{
					setBusy(true);
					setLoading(true);
					setPw(pwValues);
				});
			}
			else
				alert('A MetaMask compatible browser extension was not detected.\nThis tool will not function without one installed.');
		});
	}, [chainType, setPw]);
	useEffect(()=>{pw && getBalances(pw!.collector, pw!.provider, {callback: updateData});}, [pw, transactionStatusUpdateTime]);
	useEffect(()=>
	{
		if(!busy && !loading && !!data)
		{
			new ClipboardJS('.copy-button');
			Utils.addCopyButtonTooltips('copy-button');
		}
	}, [busy, loading, data]);
	useEffect(()=>
	{
		if(transactionMonitorTimer)
			clearInterval(transactionMonitorTimer);

		if(pw)
		{
			transactionMonitorTimer = setInterval(() =>
			{
				updateTransactionMonitor(pw, transactions, setTransactions)
				.then((result)=>
				{
					if(result)
						setTransactionStatusUpdateTime(new Date().getTime());
				});
			}, Config.sudtTransactionMonitorDelay);
		}
	}, [pw, transactions]);

	let html = <main></main>;
	if(!!pw)
	{
		html =
		(
			<>
				<main className="sudt">
					<h2>SUDT Tool</h2>
					<p>
						The SUDT tool allows you easily create SUDT tokens using just MetaMask.
					</p>
					<p>
						The account selected in MetaMask is used to generate the SUDT Token ID.
						This account is also the "owner" or "issuer" of the token, and the only account that can mint more tokens.
						Each account can only have one token associated with it, as intended by the SUDT standard.
						To create a second token, switch to a different account in MetaMask.
					</p>
					<section className="chain-type">
						<label title='Chain types can be either Mainnet or Testnet.'>
							Nervos CKB Chain Type
							<SegmentedControl name="chain-type" setValue={handleChainChanged} options={
								[
									{label: 'Mainnet', value: ChainTypes.mainnet},
									{label: 'Testnet', value: ChainTypes.testnet, default: true},
								]
							} />
						</label>
					</section>
					<table className={(loading) ? 'loading' : ''}>
						<tbody>
							<tr>
								<td>ETH Address:</td>
								<td>
									{
										(loading) ? '...' :
										(
											<>
												<span id="eth-address">{PWCore.provider.address.addressString}</span>
												<button className="copy-button" data-clipboard-target="#eth-address"><i className="far fa-copy"></i></button>
											</>
										)
									}
								</td>
							</tr>
							<tr>
								<td>CKB Address:</td>
								<td>
									{
										(loading) ? '...' :
										(
											<>
												<span id="ckb-address">{data!.address.toCKBAddress()}</span>
												<button className="copy-button" data-clipboard-target="#ckb-address"><i className="far fa-copy"></i></button>
											</>
										)
									}
								</td>
							</tr>
							<tr>
								<td>CKB Balance:</td>
								<td>
									{
										(loading) ? '...' :
										(
											<>
												{Number(data!.capacity.toString(AmountUnit.ckb)).toLocaleString() + ' CKBytes'}
												<button className="copy-button" data-clipboard-text={data!.capacity.toString(AmountUnit.ckb)}><i className="far fa-copy"></i></button>
												{chainType===ChainTypes.testnet && data!.capacity.eq(Amount.ZERO) && <>(Get Testnet CKBytes from the <a href="https://faucet.nervos.org/" target="_blank" rel="noreferrer">Testnet Faucet</a>.)</>}
											</>
										)
									}
								</td>
							</tr>
							<tr>
								<td>SUDT Token ID:</td>
								<td>
									{
										(loading) ? '...' :
										(
											<>
												<span id="token-id">{data!.address.toLockScript().toHash()}</span>
												<button className="copy-button" data-clipboard-target="#token-id"><i className="far fa-copy"></i></button>
											</>
										)
									}
								</td>
							</tr>
							<tr>
								<td>SUDT Balance:</td>
								<td>
									{
										(loading) ? '...' :
										(
											<>
												{Number(data!.sudtBalance.toString(0)).toLocaleString() + ' Tokens'}
												<button className="copy-button" data-clipboard-text={data!.sudtBalance.toString(0)}><i className="far fa-copy"></i></button>
											</>
										)
									}
								</td>
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
					<br />
					<br />
					<div className={(transactions.length!==0) ? 'transactions visible' : 'transactions'}>
						{/* <h2>Transactions</h2> */}
						<table>
							<thead>
								<tr>
									<th>Transaction ID</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								{generateTransactionRows(transactions, chainType)}
							</tbody>
						</table>
					</div>
				</main>
				{loading && <LoadingSpinner />}
			</>
		);
	}

	return html;
}

export default Component;
