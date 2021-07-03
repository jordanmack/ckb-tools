import React from 'react';
import ReactDOM from 'react-dom';
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {ModalContainer} from 'reoverlay';
import 'reoverlay/lib/ModalWrapper.css';

import App from './containers/App/App';
import "./index.scss";

async function main()
{
	const html =
	(
		<>
		{/* <React.StrictMode> */}
			<App />
			<ToastContainer />
			<ModalContainer />
		{/* </React.StrictMode> */}
		</>
	);
	ReactDOM.render(html, document.getElementById('root'));
}
main();

// import reportWebVitals from './reportWebVitals';
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
