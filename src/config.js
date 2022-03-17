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
			rpcUrl: 'https://godwoken-testnet-web3-v1-rpc.ckbapp.dev',
			rollupTypeHash: '0x4940246f168f4106429dc641add3381a44b5eef61e7754142f594e986671a575',
			rollupTypeScript: {
				code_hash: '0x0d3bfeaa292a59fcb58ed026e8f14e2167bd27f1765aa4b2af7d842b6123c6a9',
				hash_type: 'type',
				args: '0x8137c84a9089f92fee684ac840532ee1133b012a9d42b6b76b74fbdde6999230'
			},
			ethAccountLockScriptTypeHash: '0x10571f91073fdc3cdef4ddad96b4204dd30d6355f3dda9a6d7fc0fa0326408da',
			creatorAccountId: '0x6',
			polyjuiceValidatorScriptCodeHash: '0xbeb77e49c6506182ec0c02546aee9908aafc1561ec13beb488d14184c6cd1b79',
			depositLockScriptTypeHash: '0xcc2b4e14d7dfeb1e72f7708ac2d7f636ae222b003bac6bccfcf8f4dfebd9c714',
			withdrawalLockScript: {
				code_hash: '0x00000000000000000000000000000000000000000000000000545950455f4944',
				args: '0xca4fec413acba90c3e50a0422d3780a8c5e8cce70ba0e6736d4b6559d79d639d',
				hash_type: 'type'
			},
			withdrawalLockCellDep: {
				tx_hash: '0xb4b07dcd1571ac18683b515ada40e13b99bd0622197b6817047adc9f407f4828',
				index: '0x0',
				depType: 'code'
			}
		}
	},

	testnet_v0:
	{
		ckbRpcUrl: '//rpc-testnet.ckb.tools',
		ckbIndexerUrl: '//indexer-testnet.ckb.tools',
		ckbExplorerUrl: '//explorer.nervos.org/aggron/',
		faucetUrl: 'https://faucet.nervos.org/',
		rc_lock_script_type_hash: '0x79f90bb5e892d80dd213439eeab551120eb417678824f282b4ffb5f21bad2e1e',

		godwoken: {
			rpcUrl: '//godwoken-testnet-web3-rpc.ckbapp.dev',
			rollupTypeHash: '0x4cc2e6526204ae6a2e8fcf12f7ad472f41a1606d5b9624beebd215d780809f6a',
			rollupTypeScript: {
				code_hash: '0x5c365147bb6c40e817a2a53e0dec3661f7390cc77f0c02db138303177b12e9fb',
				hash_type: 'type',
				args: '0x213743d13048e9f36728c547ab736023a7426e15a3d7d1c82f43ec3b5f266df2'
			},
			ethAccountLockScriptTypeHash: '0xdeec13a7b8e100579541384ccaf4b5223733e4a5483c3aec95ddc4c1d5ea5b22',
			creatorAccountId: '0x3',
			polyjuiceValidatorScriptCodeHash: '0xbeb77e49c6506182ec0c02546aee9908aafc1561ec13beb488d14184c6cd1b79',
			depositLockScriptTypeHash: '0x5a2506bb68d81a11dcadad4cb7eae62a17c43c619fe47ac8037bc8ce2dd90360',
			withdrawalLockScript: {
				code_hash: '0x170ef156e9f6132dbca6069dfd3e436f7d91c29d3ac7332c4b33e633b6a299b5',
				args: '0x',
				hash_type: 'type'
			},
			withdrawalLockCellDep: {
				tx_hash: '0xb4b07dcd1571ac18683b515ada40e13b99bd0622197b6817047adc9f407f4828',
				index: '0x0',
				depType: 'code'
			}
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
			withdrawalLockScript: {
				code_hash: '0xf1717ee388b181fcb14352055c00b7ea7cd7c27350ffd1a2dd231e059dde2fed',
				args: '0x',
				hash_type: 'type'
			},
			withdrawalLockCellDep: {
				tx_hash: '0x3d727bd8bb1d87ba79638b63bfbf4c9a4feb9ac5ac5a0b356f3aaf4ccb4d3a1c',
				index: '0x0',
				depType: 'code'
			}
		}
	},

	sudtTransactionMonitorDelay: 2_000,				// Delay in milliseconds that the SUDT transaction monitor waits before checking if anything needs updating. 
	sudtTransactionMonitorFailureDelay: 300_000,	// Delay in milliseconds before a transaction that isn't confirming is marked as failed.
	sudtTransactionMonitorUpdateDelay: 10_000,		// Delay in milliseconds before a transaction is rechecked for a status change.

	defaultDebouceDelay: 200,
};

export default config;
