import { NetworkEnum } from "../../AccountBox/AccountBox.types";

export interface ICreateNervosAccountModalProps {
  open: boolean
  title: string
  text: string
  network: NetworkEnum;
  walletAddress?: string
  faucetAddress?: string
  error?: string
  handleClose?: () => void
  handleCreateNervosAccount?: () => void
}
