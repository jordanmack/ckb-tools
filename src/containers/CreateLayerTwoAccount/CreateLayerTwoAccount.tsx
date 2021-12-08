import {useState, useEffect, useCallback} from 'react';
import PWCore, {EthProvider, Provider} from '@lay2/pw-core';
import {toast} from 'react-toastify';
import {SegmentedControlWithoutStyles as SegmentedControl} from 'segmented-control';
import detectEthereumProvider from '@metamask/detect-provider';
import { AddressTranslator, IAddressTranslatorConfig } from 'nervos-godwoken-integration';

import './CreateLayerTwoAccount.scss';
import Config from '../../config.js';
import {ChainTypes, ChainTypeString} from '../../common/ts/Types';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import CreateNervosAccountModal from './modals/CreateNervosAccountModal/index';
import BasicCollector from '../../collectors/BasicCollector';
import { ThemeProvider } from './styles/theme/index';
import { NetworkEnum } from './AccountBox/AccountBox.types';
import { WithdrawLayerTwo } from '../WithdrawLayerTwo/WithdrawLayerTwo';

interface PwObject
{
	collector: BasicCollector,
	pwCore: PWCore,
	provider: Provider,
}

const MAINNET_CONFIG: IAddressTranslatorConfig = {
	CKB_URL: Config.mainnet.ckbRpcUrl,
	INDEXER_URL: Config.mainnet.ckbExplorerUrl,
	RPC_URL: Config.mainnet.godwoken.rpcUrl,
	deposit_lock_script_type_hash: Config.mainnet.godwoken.depositLockScriptTypeHash,
	eth_account_lock_script_type_hash: Config.mainnet.godwoken.ethAccountLockScriptTypeHash,
	portal_wallet_lock_hash: Config.mainnet.godwoken.portalWalletLockHash,
	rollup_type_hash: Config.mainnet.godwoken.rollupTypeHash,
	rollup_type_script: Config.mainnet.godwoken.rollupTypeScript
};

const TESTNET_MESSAGE = "First, please transfer at least 470 CKB to your account (copy your Layer 1 address into faucet and request funds) and then create a new account by pressing the CREATE ACCOUNT button.";
const MAINNET_MESSAGE = "First, please transfer at least 470 CKB to your account and then create a new account by pressing the CREATE ACCOUNT button.";

function Component()
{
	const [open, setOpen] = useState(false)
	const [ckbAddress, setCkbAddress] = useState<string | null>(null);
	const [pw, setPw] = useState<PwObject|null>(null);
	const [pwLoading, setPwLoading] = useState(false);
	const [fetchBalanceLoading, setFetchBalanceLoading] = useState(false);
	const [createAccountLoading, setCreateAccountLoading] = useState(false);
	
	const [chainType, setChainType] = useState(ChainTypes.testnet);
	const [layer2Balance, setLayer2Balance] = useState<number | null>(null);
	const [modalError, setModalError] = useState<string | null>(null);
	const [waitingForAccountCreation, setWaitingForAccountCreation] = useState(false);
	const [withdrawVisibile, setWithdrawVisibility] = useState(false);

	const loading = pwLoading || fetchBalanceLoading || createAccountLoading;
	const isMainnet = chainType === ChainTypes.mainnet;

	
	async function initPwCore(chainType: ChainTypes)
{
	setPwLoading(true);
	const provider = new EthProvider();
	const collector = new BasicCollector(Config[ChainTypes[chainType] as ChainTypeString].ckbIndexerUrl);
	const pwCore = await new PWCore(Config[ChainTypes[chainType] as ChainTypeString].ckbRpcUrl).init(provider, collector);
	setPwLoading(false);

	return {pwCore, provider, collector};
}

const fetchConnectedAccountBalance = useCallback(async function () {
	const response = await fetch(isMainnet ? MAINNET_CONFIG.RPC_URL : Config.testnet.godwoken.rpcUrl, {
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
			setFetchBalanceLoading(true);
			const balance = await fetchConnectedAccountBalance();
			setLayer2Balance(balance);
			setFetchBalanceLoading(false);
		})();
		
	}, [fetchConnectedAccountBalance, pw?.provider.address.addressString]);

	useEffect(() => {
		setWithdrawVisibility(false);
	}, [isMainnet]);

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
			<div>Your Layer 2 balance is: {layer2Balance ?? 0} Shannon.</div>
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
	  faucetAddress={isMainnet ? `${Config.mainnet.ckbExplorerUrl}address/${ckbAddress}` : Config.testnet.faucetUrl}
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
					setCreateAccountLoading(true);

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
					setCreateAccountLoading(false);
				}
			
		}}
      />
	  </ThemeProvider>
			</>}
	  
			</>}
			
      
    
		</> : <div>
			Please connect Ethereum account. Check for "Connect account" modal in your wallet extension.	
		</div>}
		
	{!isMainnet && Boolean(layer2Balance) && <><br/><br/><br/><hr /><br/><br/><button onClick={() => setWithdrawVisibility(!withdrawVisibile)}>Toggle Withdraw view</button></>}
	{!isMainnet && withdrawVisibile && pw && <><br/><br/><br/><WithdrawLayerTwo pw={pw} /></>}
	</main>
}

export default Component;
