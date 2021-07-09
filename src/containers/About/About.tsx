import React from 'react';
import GitHubButton from 'react-github-btn';
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
				The complete source code for all tools is always available on <a href="https://github.com/jordanmack/ckb-tools" target="_blank" rel="noreferrer">GitHub</a>.
			</p>
			<p>
				Donations are not necessary. If you like this project, please consider giving it a star on <a href="https://github.com/jordanmack/ckb-tools" target="_blank" rel="noreferrer">GitHub</a>.
			</p>
			<p>
				<GitHubButton href="https://github.com/jordanmack/ckb-tools" data-icon="octicon-star" data-show-count="true" data-size="large" aria-label="Star jordanmack/ckb-tools on GitHub">Star</GitHubButton>
			</p>
		</main>
	);

	return html;
}

export default Component;
