import React, {useState, useEffect, useCallback} from 'react';
import PWCore, {EthProvider, Provider} from '@lay2/pw-core';
import {toast} from 'react-toastify';
import {SegmentedControlWithoutStyles as SegmentedControl} from 'segmented-control';
import * as _ from 'lodash';
import detectEthereumProvider from '@metamask/detect-provider';

import Config from '../../config.js';
import {ChainTypes, ChainTypeString} from '../../common/ts/Types';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import CreateNervosAccountModal from './modals/CreateNervosAccountModal/index';
import BasicCollector from '../../collectors/BasicCollector';
import { AddressTranslator } from 'nervos-godwoken-integration';
import { ThemeProvider } from './styles/theme/index';

import './CreateLayerTwoAccount.scss';

interface PwObject
{
	collector: BasicCollector,
	pwCore: PWCore,
	provider: Provider,
}


function Component()
{
	const [open, setOpen] = useState(false)
	const [ckbAddress, setCkbAddress] = useState<string | null>(null);
	const [pw, setPw] = useState<PwObject|null>(null);
	const [loading, setLoading] = useState(true);
	const [chainType] = useState(ChainTypes.testnet);
	const [layer2Balance, setLayer2Balance] = useState<number | null>(null);
	const [modalError, setModalError] = useState<string | null>(null);
	const [waitingForAccountCreation, setWaitingForAccountCreation] = useState(false);

	async function initPwCore(chainType: ChainTypes)
{
	const provider = new EthProvider();
	const collector = new BasicCollector(Config[ChainTypes[chainType] as ChainTypeString].ckbIndexerUrl);
	const pwCore = await new PWCore(Config[ChainTypes[chainType] as ChainTypeString].ckbRpcUrl).init(provider, collector);

	return {pwCore, provider, collector};
}

const fetchConnectedAccountBalance = useCallback(async function () {
	const response = await fetch("https://godwoken-testnet-web3-rpc.ckbapp.dev/", {
		method: 'POST',
		"headers": {
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			jsonrpc: '2.0',
			id: 1,
			method: 'eth_getBalance',
			params: [ pw?.provider.address.addressString, 'latest']
		}),
		mode: 'cors'
	});

	const json = await response.json();

	return parseInt(json.result);
}, [pw?.provider.address.addressString]);

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
					setLoading(true);
					setPw(pwValues);
				});
			}
			else
				alert('A MetaMask compatible browser extension was not detected.\nThis tool will not function without one installed.');
		});
	}, [chainType, setPw]);

	useEffect(() => {
		if (pw) {
			const ckbAddress = pw.provider.address.toCKBAddress();
			setCkbAddress(ckbAddress.toString());
		}
	}, [pw, pw?.provider.address.addressString]);

	useEffect(() => {
		if (!pw?.provider.address.addressString) {
			return;
		}

		(async () => {
			const balance = await fetchConnectedAccountBalance();
			setLayer2Balance(balance);
			setLoading(false);
		})();
		
	}, [fetchConnectedAccountBalance, pw?.provider.address.addressString]);

  const onClick = () => {
    setOpen(true)
  }

  const handleChainChanged = () => {};

	return <main className="create-l2-account">
		{loading && <LoadingSpinner />}
		<section className="chain-type">
						<label title='Chain types can be either Mainnet or Testnet.'>
							Nervos CKB Chain Type
							<SegmentedControl name="chain-type" setValue={handleChainChanged} options={
								[
									{label: 'Testnet', value: ChainTypes.testnet, default: true},
								]
							} />
						</label>
					</section>

		{pw?.provider.address.addressString ? <>
			<div>Connected ETH address: {pw.provider.address.addressString}</div>
			<br/>
			{layer2Balance ? <>
				<div>You already have a Nervos Layer 2 account with CKB.</div>
			<br/>
			<div>Your Layer 2 balance is: {layer2Balance ?? 0} Shannons.</div>
			<div><i>1 Shannon is 1 / 10 ^ 8 of CKB.</i></div>
			</> : <>
			{layer2Balance === null ? <>
				
			</> : <>
				<div>You don't have a Nervos Layer 2 account yet.</div>
	  <br/>

	  {waitingForAccountCreation ? <div>
		  Please wait between 3 - 5 minutes for account to be created. The page will refresh automatically.
	  </div> : <button onClick={onClick} disabled={!ckbAddress}>Create Layer 2 account</button>}
	  
	  <ThemeProvider>
      <CreateNervosAccountModal
	  title="Create Nervos Layer 2 Account"
	  text="First, please transfer at least 461 CKB to your account (copy your Layer 1 address into faucet and request funds) and then create a new account by pressing the CREATE ACCOUNT button."
	  walletAddress={ckbAddress}
	  error={modalError}
	  faucetAddress="https://faucet.nervos.org/"
        open={open}
        handleClose={() => {
			setOpen(false);
			setModalError(null);
		}}
		handleCreateNervosAccount={async () => {
				try {
					const addressTranslator = new AddressTranslator();
					await addressTranslator.createLayer2Address(pw.provider.address.addressString);

					setOpen(false);
					setWaitingForAccountCreation(true);
					setLoading(true);

					let maxTries = 300;
					let currentTry = 1;

					let balance: number | null = null;

					while (!balance && currentTry <= maxTries) {
						await new Promise(r => setTimeout(r, 1000));
						balance = await fetchConnectedAccountBalance();
						currentTry++;
					}

					setLayer2Balance(balance);
					toast.success('You have successfully created and funded your Layer 2 account!');
				} catch (error: any) {
					if (error?.message) {
						setModalError(error.message || 'Unknown error');
					}
				} finally {
					setWaitingForAccountCreation(false);
					setLoading(false);
				}
			
		}}
      />
	  </ThemeProvider>
			</>}
	  
			</>}
			
      
    
		</> : <div>
			Please connect Ethereum account. Check for "Connect account" modal in your wallet extension.	
		</div>}
		
  
		
	</main>
}

export default Component;
