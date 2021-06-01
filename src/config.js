const config =
{
	ckbRpcUrl: '//rpc-testnet.ckb.tools',
	ckbIndexerUrl: '//indexer-testnet.ckb.tools',
	ckbExplorerUrl: '//explorer.nervos.org/aggron/',

	testnet:
	{
		ckbRpcUrl: '//rpc-testnet.ckb.tools',
		ckbIndexerUrl: '//indexer-testnet.ckb.tools',
		ckbExplorerUrl: '//explorer.nervos.org/aggron/',
	},

	mainnet:
	{
		ckbRpcUrl: '//rpc.ckb.tools',
		ckbIndexerUrl: '//indexer.ckb.tools',
		ckbExplorerUrl: '//explorer.nervos.org/',
	},

	sudtTransactionMonitorDelay: 2_000,
	sudtTransactionMonitorFailureDelay: 300_000,
	sudtTransactionMonitorUpdateDelay: 10_000,

	defaultDebouceDelay: 200,
};

export default config;
