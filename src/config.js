const config =
{
	testnet:
	{
		ckbRpcUrl: 'https://testnet.ckb.dev/ckb',
		ckbIndexerUrl: 'https://testnet.ckb.dev/indexer',
		ckbExplorerUrl: 'https://pudge.explorer.nervos.org/',
		faucetUrl: 'https://faucet.nervos.org/'
	},

	mainnet:
	{
		ckbRpcUrl: 'https://mainnet.ckb.dev/ckb',
		ckbIndexerUrl: 'https://mainnet.ckb.dev/indexer',
		ckbExplorerUrl: 'https://explorer.nervos.org/'
	},

	sudtTransactionMonitorDelay: 2_000,				// Delay in milliseconds that the SUDT transaction monitor waits before checking if anything needs updating. 
	sudtTransactionMonitorFailureDelay: 300_000,	// Delay in milliseconds before a transaction that isn't confirming is marked as failed.
	sudtTransactionMonitorUpdateDelay: 10_000,		// Delay in milliseconds before a transaction is rechecked for a status change.

	defaultDebouceDelay: 200,
};

export default config;
