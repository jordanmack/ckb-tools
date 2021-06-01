const config =
{
	ckbRpcUrl: 'https://rpc-testnet.ckb.tools',
	ckbIndexerUrl: 'https://indexer-testnet.ckb.tools',
	ckbExplorerUrl: 'https://explorer.nervos.org/aggron/',

	testnet:
	{
		ckbRpcUrl: 'https://rpc-testnet.ckb.tools',
		ckbIndexerUrl: 'https://indexer-testnet.ckb.tools',
		ckbExplorerUrl: 'https://explorer.nervos.org/aggron/',
	},

	mainnet:
	{
		ckbRpcUrl: 'https://rpc.ckb.tools',
		ckbIndexerUrl: 'https://indexer.ckb.tools',
		ckbExplorerUrl: 'https://explorer.nervos.org/',
	},

	sudtTransactionMonitorDelay: 2_000,
	sudtTransactionMonitorFailureDelay: 300_000,
	sudtTransactionMonitorUpdateDelay: 10_000,

	defaultDebouceDelay: 200,
};

export default config;
