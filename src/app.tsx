import React from "react";
import {useState, useEffect} from "react";
import ReactDOM from "react-dom";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PWCore, {Address, AddressType, Amount, AmountUnit, EthProvider, PwCollector, SUDT} from "@lay2/pw-core";

import BasicCollector from "./collectors/basic-collector.js";
// import UploadComponent from "./components/upload";
import config from "./config.js";
import "./app.scss";

async function initPwCore()
{
	const provider = new EthProvider();
	const collector = new BasicCollector(config.ckb_indexer_url);
	const pwCore = await new PWCore(config.ckb_rpc_url).init(provider, collector);

	return {provider, collector, pwCore};
}

// async function getBalances(setData)
// {

// 	const address = new Address(PWCore.provider.address.addressString, AddressType.eth);
// 	const capacity = await PWCore.defaultCollector.getBalance(address);
// 	const sudtBalance = await PWCore.defaultCollector.getSUDTBalance(new SUDT(PWCore.provider.address.toLockScript().toHash()), PWCore.provider.address);

// 	const data = {address, capacity, sudtBalance};

// 	setData(data);
// }

// async function burnSudt(pwCore, amount)
// {
// 	const builder = new AuctionBuilder();

// 	const options =
// 	{
// 		address: PWCore.provider.address,
// 		amount: amount,
// 		collector: PWCore.defaultCollector,
// 		fee: new Amount(100_000, AmountUnit.shannon),
// 		sudt: new SUDT(PWCore.provider.address.toLockScript().toHash())
// 	};
// 	const transaction = await builder.build("burn", options);
// 	console.log(transaction);

// 	const tx_id = await pwCore.sendTransaction(transaction);
// 	console.log(`Transaction submitted: ${tx_id}`);

// 	toast("Transaction has been submitted.");
// }

// async function mintSudt(pwCore, amount)
// {
// 	const builder = new AuctionBuilder();

// 	const options =
// 	{
// 		address: PWCore.provider.address,
// 		amount: amount,
// 		collector: PWCore.defaultCollector,
// 		fee: new Amount(String(100_000), AmountUnit.shannon),
// 		sudt: new SUDT(PWCore.provider.address.toLockScript().toHash())
// 	};
// 	const transaction = await builder.build("mint", options);
// 	// console.log(transaction);

// 	const tx_id = await pwCore.sendTransaction(transaction);
// 	console.log(`Transaction submitted: ${tx_id}`);

// 	toast("Transaction has been submitted.");
// }

function PrimaryComponent(props)
{
	const [data, setData] = useState(null);

	const handleRefreshData = () =>
	{
		setData(null);
		// getBalances(setData);
	};

	const handleMintSudt = (amount) =>
	{
		// mintSudt(props.pwCore, new Amount(amount, 0));
		// getBalances(setData);
	};

	const handleBurnSudt = (amount) =>
	{
		// burnSudt(props.pwCore, new Amount(amount, 0));
		// getBalances(setData);
	};

	// useEffect(()=>getBalances(setData), [true]);

	let html = <main>Loading...</main>;
	if(data !== null)
	{
		html =
		(
			<main>
			</main>
		);
	}

	return html;
}

async function main()
{
	const {provider, collector, pwCore} = await initPwCore();

	const html =
	(
		<React.StrictMode>
			<PrimaryComponent collector={collector} provider={provider} pwCore={pwCore} />
			<ToastContainer />
		</React.StrictMode>
	);

	window.addEventListener("load", function()
	{
		ReactDOM.render(html, document.getElementById("root"));
	});
}
main();

