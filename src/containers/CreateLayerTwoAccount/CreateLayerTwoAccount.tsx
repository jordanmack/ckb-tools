import React, {useState, useEffect, useCallback, useMemo} from 'react';
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
import { AddressTranslator, IAddressTranslatorConfig } from 'nervos-godwoken-integration';
import { ThemeProvider } from './styles/theme/index';

import './CreateLayerTwoAccount.scss';
import { NetworkEnum } from './AccountBox/AccountBox.types';

interface PwObject
{
	collector: BasicCollector,
	pwCore: PWCore,
	provider: Provider,
}

const TESTNET_L2_RPC_URL = 'https://godwoken-testnet-web3-rpc.ckbapp.dev/';

const MAINNET_CONFIG: IAddressTranslatorConfig = {
	CKB_URL: 'https://rpc.ckb.tools/',
	INDEXER_URL: 'https://indexer.ckb.tools/',
	RPC_URL: 'https://mainnet.godwoken.io/rpc',
	deposit_lock_script_type_hash: '0xe24164e2204f998b088920405dece3dcfd5c1fbcb23aecfce4b3d3edf1488897',
	eth_account_lock_script_type_hash: '0x1563080d175bf8ddd44a48e850cecf0c0b4575835756eb5ffd53ad830931b9f9',
	portal_wallet_lock_hash: '0xbf43c3602455798c1a61a596e0d95278864c552fafe231c063b3fabf97a8febc',
	rollup_type_hash: '0x40d73f0d3c561fcaae330eabc030d8d96a9d0af36d0c5114883658a350cb9e3b',
	rollup_type_script: {
		code_hash: '0xa9267ff5a16f38aa9382608eb9022883a78e6a40855107bb59f8406cce00e981',
		hash_type: 'type',
		args: '0x2d8d67c8d73453c1a6d6d600e491b303910802e0cc90a709da9b15d26c5c48b3'
	}
};

const TESTNET_MESSAGE = "First, please transfer at least 470 CKB to your account (copy your Layer 1 address into faucet and request funds) and then create a new account by pressing the CREATE ACCOUNT button.";
const MAINNET_MESSAGE = "First, please transfer at least 470 CKB to your account and then create a new account by pressing the CREATE ACCOUNT button.";

const TESTNET_FAUCET = 'https://faucet.nervos.org/';
const MAINNET_EXPLORER = 'https://explorer.nervos.org/address/';

function Component()
{
	const [open, setOpen] = useState(false)
	const [ckbAddress, setCkbAddress] = useState<string | null>(null);
	const [pw, setPw] = useState<PwObject|null>(null);
	const [loading, setLoading] = useState(true);
	const [chainType, setChainType] = useState(ChainTypes.testnet);
	const [layer2Balance, setLayer2Balance] = useState<number | null>(null);
	const [modalError, setModalError] = useState<string | null>(null);
	const [waitingForAccountCreation, setWaitingForAccountCreation] = useState(false);

	const isMainnet = chainType === ChainTypes.mainnet;

	async function initPwCore(chainType: ChainTypes)
{
	const provider = new EthProvider();
	const collector = new BasicCollector(Config[ChainTypes[chainType] as ChainTypeString].ckbIndexerUrl);
	const pwCore = await new PWCore(Config[ChainTypes[chainType] as ChainTypeString].ckbRpcUrl).init(provider, collector);

	return {pwCore, provider, collector};
}

const fetchConnectedAccountBalance = useCallback(async function () {
	const response = await fetch(isMainnet ? MAINNET_CONFIG.RPC_URL : TESTNET_L2_RPC_URL, {
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
}, [pw?.provider.address.addressString, isMainnet]);

	useEffect(()=>
	{
		(async () => {
			const provider = await detectEthereumProvider();

			if (provider) {
				const pwValues = await initPwCore(chainType);
				
				setPw(pwValues);
			} else {
				alert('A MetaMask compatible browser extension was not detected.\nThis tool will not function without one installed.');
			}
		})();
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
			setLoading(true);
			const balance = await fetchConnectedAccountBalance();
			setLayer2Balance(balance);
			setLoading(false);
		})();
		
	}, [fetchConnectedAccountBalance, pw?.provider.address.addressString]);

  const onClick = () => {
    setOpen(true)
  }

  const handleChainChanged = (value: ChainTypes) => {
	setChainType(value);
	setLayer2Balance(null);
  };

	return <main className="create-l2-account">
		{loading && <LoadingSpinner />}
		<section className="chain-type">
						<label title='Chain types can be either Mainnet or Testnet.'>
							Nervos CKB Chain Type
							<SegmentedControl name="chain-type" setValue={handleChainChanged} options={
								[
									{label: 'Testnet', value: ChainTypes.testnet, default: true},
									{label: 'Mainnet', value: ChainTypes.mainnet},
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
	  network={isMainnet ? NetworkEnum.Layer1Mainnet : NetworkEnum.Layer1Testnet}
	  title="Create Nervos Layer 2 Account"
	  text={isMainnet ? MAINNET_MESSAGE : TESTNET_MESSAGE}
	  walletAddress={ckbAddress ?? undefined}
	  error={modalError ?? undefined}
	  faucetAddress={isMainnet ? `${MAINNET_EXPLORER}${ckbAddress}` : TESTNET_FAUCET}
        open={open}
        handleClose={() => {
			setOpen(false);
			setModalError(null);
		}}
		handleCreateNervosAccount={async () => {
				try {
					let config = isMainnet ? MAINNET_CONFIG : undefined;
					const addressTranslator = new AddressTranslator(config);

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
