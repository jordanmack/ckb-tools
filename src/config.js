const config =
{
	testnet:
	{
		ckbRpcUrl: '//rpc-testnet.ckb.tools',
		ckbIndexerUrl: '//indexer-testnet.ckb.tools',
		ckbExplorerUrl: '//explorer.nervos.org/aggron/',
		faucetUrl: 'https://faucet.nervos.org/',
		rc_lock_script_type_hash: '0x79f90bb5e892d80dd213439eeab551120eb417678824f282b4ffb5f21bad2e1e',

		godwoken: {
			rpcUrl: 'https://godwoken-testnet-v1.ckbapp.dev',
			rollupTypeHash: '0x702359ea7f073558921eb50d8c1c77e92f760c8f8656bde4995f26b8963e2dd8',
			rollupTypeScript: {
				code_hash: '0x1e44736436b406f8e48a30dfbddcf044feb0c9eebfe63b0f81cb5bb727d84854',
				hash_type: 'type',
				args: '0x86c7429247beba7ddd6e4361bcdfc0510b0b644131e2afb7e486375249a01802'
			},
			ethAccountLockScriptTypeHash: '0x07521d0aa8e66ef441ebc31204d86bb23fc83e9edc58c19dbb1b0ebe64336ec0',
			creatorAccountId: '0x4',
			polyjuiceValidatorScriptCodeHash: '0x1629b04b49ded9e5747481f985b11cba6cdd4ffc167971a585e96729455ca736',
			depositLockScriptTypeHash: '0x50704b84ecb4c4b12b43c7acb260ddd69171c21b4c0ba15f3c469b7d143f6f18',
			withdrawalLockScriptTypeHash: '0x06ae0706bb2d7997d66224741d3ec7c173dbb2854a6d2cf97088796b677269c6'
		}
	},

	mainnet:
	{
		ckbRpcUrl: '//rpc.ckb.tools',
		ckbIndexerUrl: '//indexer.ckb.tools',
		ckbExplorerUrl: '//explorer.nervos.org/',
		rc_lock_script_type_hash: '0x9f3aeaf2fc439549cbc870c653374943af96a0658bd6b51be8d8983183e6f52f',

		godwoken: {
			rpcUrl: 'https://mainnet.godwoken.io/rpc',
			rollupTypeHash: '0x40d73f0d3c561fcaae330eabc030d8d96a9d0af36d0c5114883658a350cb9e3b',
			rollupTypeScript: {
				code_hash: '0xa9267ff5a16f38aa9382608eb9022883a78e6a40855107bb59f8406cce00e981',
				hash_type: 'type',
				args: '0x2d8d67c8d73453c1a6d6d600e491b303910802e0cc90a709da9b15d26c5c48b3'
			},
			ethAccountLockScriptTypeHash: '0x1563080d175bf8ddd44a48e850cecf0c0b4575835756eb5ffd53ad830931b9f9',
			creatorAccountId: '0x3',
			polyjuiceValidatorScriptCodeHash: '0x636b89329db092883883ab5256e435ccabeee07b52091a78be22179636affce8',
			depositLockScriptTypeHash: '0xe24164e2204f998b088920405dece3dcfd5c1fbcb23aecfce4b3d3edf1488897',
			withdrawalLockScriptTypeHash: '0xf1717ee388b181fcb14352055c00b7ea7cd7c27350ffd1a2dd231e059dde2fed'
		}
	},

	sudtTransactionMonitorDelay: 2_000,				// Delay in milliseconds that the SUDT transaction monitor waits before checking if anything needs updating. 
	sudtTransactionMonitorFailureDelay: 300_000,	// Delay in milliseconds before a transaction that isn't confirming is marked as failed.
	sudtTransactionMonitorUpdateDelay: 10_000,		// Delay in milliseconds before a transaction is rechecked for a status change.

	defaultDebouceDelay: 200,
};

export default config;
