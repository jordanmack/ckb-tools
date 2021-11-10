import React, { useState } from 'react'

import Chip from '../Chip/Chip.component'
import { getAddressLabel } from '../Header/Header.utils'
import { Box, Button, Typography, useTheme } from '@material-ui/core'
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined'
import FilterNoneOutlinedIcon from '@material-ui/icons/FilterNoneOutlined'
import LinkIcon from '@material-ui/icons/Link'

import { messages } from './AccountBox.messages'
import { IAccountBox } from './AccountBox.types'

const AccountBox: React.FC<IAccountBox> = ({
  address,
  network,
  explorerUrl,
}) => {
  const { spacing } = useTheme()
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(address as any)
    setCopiedToClipboard(true)
  }

  return (
    <Box
      key={address}
      borderRadius={8}
      border={1}
      padding={3}
      margin={4}
      display={'flex'}
      flexDirection={'column'}
      maxWidth={300}
    >
      <Typography
        style={{
          marginTop: spacing(1),
          textAlign: 'center',
        }}
        variant="body1"
      >
        {network}
      </Typography>
      <Chip label={getAddressLabel(address as any)} />
      {copiedToClipboard ? (
        <Button
          size="small"
          color="primary"
          startIcon={<CheckCircleOutlineOutlinedIcon />}
        >
          {messages.COPIED_TO_CLIPBOARD}
        </Button>
      ) : (
        <Button
          onClick={handleCopyToClipboard}
          size="small"
          color="primary"
          startIcon={<FilterNoneOutlinedIcon />}
        >
          {messages.COPY_TO_CLIPBOARD}
        </Button>
      )}
      <Button
        href={`${explorerUrl}${address}`}
        target="_blank"
        size="small"
        color="primary"
        startIcon={<LinkIcon />}
      >
        {`${network} Explorer`}
      </Button>
    </Box>
  )
}

export default AccountBox
