export interface ICreateNervosAccountModalProps {
  open: boolean
  title: string
  text: string
  walletAddress?: string
  faucetAddress?: string
  error?: string
  handleClose?: () => void
  handleCreateNervosAccount?: () => void
}
