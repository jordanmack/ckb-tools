import React from 'react';
import {A, usePath} from 'hookrouter';
import './Navigation.scss';

function Component()
{
	const currentPath = usePath();

	const html =
	(
		<nav className="primary">
			<div className="logo"><A href="/">CKB<small>.tools</small></A></div>
			<ul className="menu1">
				<li><A href="/" className={(currentPath==='/')?'active':''} title="Home"><i className="fas fa-home"></i></A></li>
				<li><A href="/address" className={(currentPath==='/address')?'active':''} title="Address Tool">Address</A></li>
				<li><A href="/sudt" className={(currentPath==='/sudt')?'active':''} title="SUDT Tool">SUDT</A></li>
			</ul>
			<ul className="menu2">
				<li><A href="/about" className={(currentPath==='/about')?'active':''} title="About"><i className="fas fa-info-circle"></i></A></li>
				<li><A href="/contact" className={(currentPath==='/contact')?'active':''} title="Contact"><i className="far fa-envelope"></i></A></li>
				<li><a href="https://github.com/jordanmack/ckb-tools" target="_blank" rel="noreferrer" title="GitHub"><i className="fab fa-github"></i></a></li>
			</ul>
		</nav>
	);

	return html;
}

export default Component;
