import React, {useState} from 'react';
import {A, usePath} from 'hookrouter';
import './Navigation.scss';

function Component()
{
	const currentPath = usePath();
	const [isMenuActive, setMenuActive] = useState(false);

	const toggleMenu = (e: React.SyntheticEvent) =>
	{
		// Match the backdrop height to the visible content container.
		const main = document.querySelector('section.main') as HTMLElement;
		const backdrop = document.querySelector('div.menu3-backdrop') as HTMLElement;
		const contentHeight = Math.max(main.offsetHeight, window.innerHeight);
		backdrop.style.height = contentHeight + 'px';

		// Toggle the menu active state.
		setMenuActive(!isMenuActive);
	}

	const html =
	(
		<nav className="primary">
			<div className="background">&nbsp;</div>
			<div className="logo"><A href="/">CKB<small>.tools</small></A></div>
			<ul className="menu1">
				<li><A href="/" className={(currentPath==='/')?'active':''} title="Home"><i className="fas fa-home"></i></A></li>
				<li><A href="/address" className={(currentPath==='/address')?'active':''} title="Address Tool">Address</A></li>
				<li><A href="/bootstrap" className={(currentPath==='/bootstrap')?'active':''} title="Bootstrap a Testnet Node">Bootstrap</A></li>
				<li><A href="/generator" className={(currentPath==='/generator')?'active':''} title="Generator Tool">Generator</A></li>
				<li><A href="/sudt" className={(currentPath==='/sudt')?'active':''} title="SUDT Tool">SUDT</A></li>
				<li><A href="/create-layer2-account" className={(currentPath==='/create-layer2-account')?'active':''} title="Create Layer 2 Account">Create Layer 2 Account</A></li>
			</ul>
			<ul className="menu2">
				<li><A href="/about" className={(currentPath==='/about')?'active':''} title="About"><i className="fas fa-info-circle"></i></A></li>
				<li><A href="/contact" className={(currentPath==='/contact')?'active':''} title="Contact"><i className="far fa-envelope"></i></A></li>
				<li><a href="https://github.com/jordanmack/ckb-tools" target="_blank" rel="noreferrer" title="GitHub"><i className="fab fa-github"></i></a></li>
			</ul>
			<button className="hamburger" onClick={toggleMenu}><i className="fas fa-bars"></i></button>
			<div className={"menu3-backdrop"+((isMenuActive)?' active':'')} onClick={toggleMenu}>&nbsp;</div>
			<ul className={"menu3"+((isMenuActive)?' active':'')}>
				<li><A href="/" className={(currentPath==='/')?'active':''} title="Home" onClick={toggleMenu}>Home</A></li>
				<li><A href="/address" className={(currentPath==='/address')?'active':''} title="Address Tool" onClick={toggleMenu}>Address</A></li>
				<li><A href="/bootstrap" className={(currentPath==='/bootstrap')?'active':''} title="Bootstrap a Testnet Node" onClick={toggleMenu}>Bootstrap</A></li>
				<li><A href="/generator" className={(currentPath==='/generator')?'active':''} title="Generator Tool">Generator</A></li>
				<li><A href="/sudt" className={(currentPath==='/sudt')?'active':''} title="SUDT Tool" onClick={toggleMenu}>SUDT</A></li>
				<li><A href="/create-layer2-account" className={(currentPath==='/create-layer2-account')?'active':''} title="Create Layer 2 Account">Create Layer 2 Account</A></li>
				<li><A href="/about" className={(currentPath==='/about')?'active':''} title="About" onClick={toggleMenu}>About</A></li>
				<li><A href="/contact" className={(currentPath==='/contact')?'active':''} title="Contact" onClick={toggleMenu}>Contact</A></li>
				<li><a href="https://github.com/jordanmack/ckb-tools" target="_blank" rel="noreferrer" title="GitHub" onClick={toggleMenu}>GitHub</a></li>
			</ul>
		</nav>
	);

	return html;
}

export default Component;
