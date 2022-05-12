import {useState, useEffect, useCallback} from 'react';
import {toast} from 'react-toastify';
import {SegmentedControlWithoutStyles as SegmentedControl} from 'segmented-control';
import detectEthereumProvider from '@metamask/detect-provider';
import { AddressTranslator, IAddressTranslatorConfig } from 'nervos-godwoken-integration';

import './CreateLayerTwoAccount.scss';
import Config from '../../config.js';
import {ChainTypes} from '../../common/ts/Types';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import CreateNervosAccountModal from './modals/CreateNervosAccountModal/index';
import { ThemeProvider } from './styles/theme/index';
import { NetworkEnum } from './AccountBox/AccountBox.types';
import { WithdrawLayerTwo } from '../WithdrawLayerTwo/WithdrawLayerTwo';

const MAINNET_CONFIG: IAddressTranslatorConfig = {
	CKB_URL: Config.mainnet.ckbRpcUrl,
	INDEXER_URL: Config.mainnet.ckbIndexerUrl,
	RPC_URL: Config.mainnet.godwoken.rpcUrl,
	deposit_lock_script_type_hash: Config.mainnet.godwoken.depositLockScriptTypeHash,
	eth_account_lock_script_type_hash: Config.mainnet.godwoken.ethAccountLockScriptTypeHash,
	rollup_type_hash: Config.mainnet.godwoken.rollupTypeHash,
	rollup_type_script: Config.mainnet.godwoken.rollupTypeScript,
	rc_lock_script_type_hash: Config.mainnet.rc_lock_script_type_hash
};

const TESTNET_CONFIG: IAddressTranslatorConfig = {
	CKB_URL: Config.testnet.ckbRpcUrl,
	INDEXER_URL: Config.testnet.ckbIndexerUrl,
	RPC_URL: Config.testnet.godwoken.rpcUrl,
	deposit_lock_script_type_hash: Config.testnet.godwoken.depositLockScriptTypeHash,
	eth_account_lock_script_type_hash: Config.testnet.godwoken.ethAccountLockScriptTypeHash,
	rollup_type_hash: Config.testnet.godwoken.rollupTypeHash,
	rollup_type_script: Config.testnet.godwoken.rollupTypeScript,
	rc_lock_script_type_hash: Config.testnet.rc_lock_script_type_hash
};

const TESTNET_MESSAGE = "First, please transfer at least 470 CKB to your account (copy your Layer 1 address into faucet and request funds) and then create a new account by pressing the CREATE ACCOUNT button.";
const MAINNET_MESSAGE = "First, please transfer at least 470 CKB to your account and then create a new account by pressing the CREATE ACCOUNT button.";

function Component()
{
	const [open, setOpen] = useState(false)
	const [ckbAddress, setCkbAddress] = useState<string | undefined>();
	const [providerLoading, setProviderLoading] = useState(false);
	const [fetchBalanceLoading, setFetchBalanceLoading] = useState(false);
	const [createAccountLoading, setCreateAccountLoading] = useState(false);
	const [addressTranslator, setAddressTranslator] = useState<AddressTranslator>();
	const [connectedEthAddress, setConnectedEthAddress] = useState<string | undefined>();
	
	const [chainType, setChainType] = useState(ChainTypes.testnet);
	const [layer2Balance, setLayer2Balance] = useState<BigInt | null>(null);
	const [modalError, setModalError] = useState<string | null>(null);
	const [waitingForAccountCreation, setWaitingForAccountCreation] = useState(false);
	const [withdrawVisibile, setWithdrawVisibility] = useState(false);

	const loading = providerLoading || fetchBalanceLoading || createAccountLoading;
	const isMainnet = chainType === ChainTypes.mainnet;


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
			params: [ connectedEthAddress, 'latest']
		}),
		mode: 'cors'
	});

	const json = await response.json();

	return BigInt(json.result);
}, [connectedEthAddress, isMainnet]);

	useEffect(()=>
	{
		async function initProvider()
		{
			setProviderLoading(true);
		
			let config = isMainnet ? MAINNET_CONFIG : TESTNET_CONFIG;
			const translator = new AddressTranslator(config);
			await translator.init(isMainnet ? 'mainnet' : 'testnet');
		
			await translator.connectWallet();
		
			setAddressTranslator(translator);
			setConnectedEthAddress(translator.getConnectedWalletAddress());
			setProviderLoading(false);
		}

		(async () => {
			const provider = await detectEthereumProvider();

			if (provider) {
				await initProvider();
			} else {
				alert('A MetaMask compatible browser extension was not detected.\nThis tool will not function without one installed.');
			}
		})();
	}, [isMainnet]);

	useEffect(() => {
		if (!connectedEthAddress) {
			setCkbAddress(undefined);
			return;
		}

		if (addressTranslator) {
			const ckbAddress = addressTranslator.ethAddressToCkbAddress(connectedEthAddress);
			setCkbAddress(ckbAddress);
		}
	}, [addressTranslator, connectedEthAddress]);

	useEffect(() => {
		if (!connectedEthAddress) {
			return;
		}

		(async () => {
			setFetchBalanceLoading(true);
			const balance = await fetchConnectedAccountBalance();
			setLayer2Balance(balance);
			setFetchBalanceLoading(false);
		})();
		
	}, [fetchConnectedAccountBalance, connectedEthAddress]);

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
						<label title='Mainnet is unavailable until new version (v1) comes out.'>
							Nervos CKB Chain Type
							<SegmentedControl name="chain-type" setValue={handleChainChanged} options={
								[
									{label: 'Testnet (v1.1, Omnilock)', value: ChainTypes.testnet, default: true},
									{label: 'Mainnet', value: ChainTypes.mainnet, disabled: true},
								]
							} />
						</label>
					</section>

		{connectedEthAddress ? <>
			<div>Connected ETH address: {connectedEthAddress}</div>
			<br/>
			{layer2Balance ? <>
				<div>You already have a Nervos Layer 2 account with CKB.</div>
			<br/>
			<div>Your Layer 2 balance is: {layer2Balance ? layer2Balance.toString() : 0} Wei.</div>
			<div><i>1 Wei is 1 / 10¹⁸ of CKB.</i></div>
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
					if (!addressTranslator) {
						toast.error(`Critical error. Adress translator is undefined.`);
						return;
					}

					await addressTranslator.createLayer2Address(connectedEthAddress);

					setOpen(false);
					setWaitingForAccountCreation(true);
					setCreateAccountLoading(true);

					let maxTries = 300;
					let currentTry = 1;

					let balance: BigInt | null = null;

					while (!balance && currentTry <= maxTries) {
						await new Promise(r => setTimeout(r, 1000));
						balance = await fetchConnectedAccountBalance();
						currentTry++;
					}

					if (balance) {
						setLayer2Balance(balance);
						toast.success('You have successfully created and funded your Layer 2 account!');
					} else {
						toast.error(`Couldn't create your account due to unknown reasons.`);
					}
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
		
	{Boolean(layer2Balance) && <><br/><br/><br/><hr /><br/><br/><button onClick={() => setWithdrawVisibility(!withdrawVisibile)}>Toggle Withdraw view</button></>}
	{withdrawVisibile && addressTranslator && connectedEthAddress && <><br/><br/><br/><WithdrawLayerTwo addressTranslator={addressTranslator} chainType={chainType} ethAddress={connectedEthAddress} /></>}
	</main>
}

export default Component;
