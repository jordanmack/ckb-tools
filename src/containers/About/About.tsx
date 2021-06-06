import React from 'react';
import './About.scss';

function Component()
{
	const html =
	(
		<main className="about">
			<p>
				CKB.tools is an online collection of free development tools created by <a href="https://www.jordanmack.info/" target="_blank" rel="noreferrer">Jordan Mack</a>
				{" "}
				for use with <a href="https://nervos.org/" target="_blank" rel="noreferrer">Nervos Network</a>.
			</p>
			<p>
				The complete source code is available on <a href="https://github.com/jordanmack/ckb-tools" target="_blank" rel="noreferrer">GitHub</a>.
			</p>
		</main>
	);

	return html;
}

export default Component;
