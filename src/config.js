const config =
{
	testnet:
	{
		ckbRpcUrl: '//rpc-testnet.ckb.tools',
		ckbIndexerUrl: '//indexer-testnet.ckb.tools',
		ckbExplorerUrl: '//explorer.nervos.org/aggron/',
		faucetUrl: 'https://faucet.nervos.org/'
	},

	mainnet:
	{
		ckbRpcUrl: '//rpc.ckb.tools',
		ckbIndexerUrl: '//indexer.ckb.tools',
		ckbExplorerUrl: '//explorer.nervos.org/'
	},

	sudtTransactionMonitorDelay: 2_000,				// Delay in milliseconds that the SUDT transaction monitor waits before checking if anything needs updating. 
	sudtTransactionMonitorFailureDelay: 300_000,	// Delay in milliseconds before a transaction that isn't confirming is marked as failed.
	sudtTransactionMonitorUpdateDelay: 10_000,		// Delay in milliseconds before a transaction is rechecked for a status change.

	defaultDebouceDelay: 200,
};

export default config;
