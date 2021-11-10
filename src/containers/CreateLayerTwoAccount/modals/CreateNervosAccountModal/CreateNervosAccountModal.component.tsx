/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useEffect, useState } from 'react'

import AccountFaucetBox from '../../AccountFaucetBox/AccountFaucetBox.component'
import ModalHeader from '../../ModalHeader'
import Button from '../../buttons/Button'
import Modal from '../Modal'
import { Box, CircularProgress, Typography } from '@material-ui/core'
import { useTheme } from '@material-ui/core/styles'

import messages from './CreateNervosAccountModal.messages'
import { ICreateNervosAccountModalProps } from './CreateNervosAccountModal.types'

const branchIcon = 'wallet.svg';

const CreateNervosAccountModal: React.FC<ICreateNervosAccountModalProps> = ({
  open,
  title,
  text,
  error,
  walletAddress,
  faucetAddress,
  handleClose,
  handleCreateNervosAccount,
  network
}) => {
  const [clicked, setClicked] = useState(false)
  const { spacing, palette } = useTheme()
  const address = {
    network,
    address: walletAddress,
    explorerUrl: faucetAddress,
  }
  const creatingNervosAccount = () => {
    if (handleCreateNervosAccount) {
      handleCreateNervosAccount();
    }
    setClicked(true);
  }
  useEffect(() => {
    error ? setClicked(false) : null
  }, [error])

  return (
    <Modal open={open} handleClose={handleClose}>
      <Box borderRadius={8} bgcolor="white" maxWidth={550}>
        <Box p={2}>
          <ModalHeader title={title} icon={branchIcon as any} onClose={handleClose} />
          <Box>
            <Typography
              style={{ marginTop: spacing(1), textAlign: 'center' }}
              variant="body1"
            >
              {text}
            </Typography>
          </Box>

          <Box display="grid" justifyContent="center" pt={2}>
            <AccountFaucetBox key={address.address} {...address} />
          </Box>
          <Box pt={4} pb={2} display="flex" justifyContent="center">
            <Button
              style={{ width: 190 }}
              text={messages.DISMISS}
              onClick={handleClose}
            />
            <Button
              style={{ width: 190, marginLeft: spacing(2), fontWeight: 500 }}
              text={
                clicked ? (
                  <CircularProgress color="inherit" />
                ) : (
                  messages.CREATE_ACCOUNT
                )
              }
              onClick={creatingNervosAccount}
            />
          </Box>
        </Box>

        {error && (
          <Box
            paddingY={1.125}
            paddingX={2}
            style={{ borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}
            bgcolor={palette.error.main}
          >
            <Typography style={{ color: palette.common.white }}>
              {error}
            </Typography>
          </Box>
        )}
      </Box>
    </Modal>
  )
}

export default CreateNervosAccountModal
