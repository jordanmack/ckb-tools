import React from 'react';
import {ModalWrapper, Reoverlay} from 'reoverlay';

import './BurnModal.scss';

interface ModalOptions
{
	defaultAddress?: string,
	defaultAmount?: string,
	onConfirm: (e: React.SyntheticEvent) => boolean,
}

function BurnModal(options: ModalOptions)
{
	const closeModal = () =>
	{
		Reoverlay.hideModal();
	}

	const onConfirm = (e: React.SyntheticEvent) =>
	{
		if(options.onConfirm(e))
			Reoverlay.hideModal();
	};

	const html =
	(
		<ModalWrapper contentContainerClassName="mint">
			<form id="burn-token-form" onSubmit={()=>false}>
				<h2>Burn SUDT Tokens</h2>
				<p>
					Burn (destory) SUDT tokens on your current address.
				</p>
				<p>
					<label>
						Nervos CKB Address
						<input type="text" className="address" defaultValue={options.defaultAddress} disabled={true} />
					</label>
				</p>
				<p>
					<label>
						Token Amount
						<input type="number" lang="en" className="amount" defaultValue={options.defaultAmount} />
					</label>
				</p>
				<div className="button-bar">
					<button onClick={closeModal}>Cancel</button>
					<span className="spacer" />
					<button onClick={onConfirm}>Burn Tokens</button>
				</div>
			</form>
		</ModalWrapper>
	);

	return html;
}

export default BurnModal;
