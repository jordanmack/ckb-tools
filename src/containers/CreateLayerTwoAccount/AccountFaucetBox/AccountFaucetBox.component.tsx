import React, { useState } from 'react'

import Chip from '../Chip/Chip.component'
import { getAddressLabel } from '../Header/Header.utils'
import { Box, Button, Typography, useTheme } from '@material-ui/core'
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined'
import FilterNoneOutlinedIcon from '@material-ui/icons/FilterNoneOutlined'
import LinkIcon from '@material-ui/icons/Link'

import { messages } from '../AccountBox/AccountBox.messages'
import { IAccountBox } from '../AccountBox/AccountBox.types'

const AccountFaucetBox: React.FC<IAccountBox> = ({
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
      padding={1}
      margin={3}
      display={'flex'}
      flexDirection={'column'}
      maxWidth={300}
    >
      <Typography
        style={{
          marginTop: spacing(1),
          marginBottom: spacing(2),
          textAlign: 'center',
          fontSize: '20px',
        }}
        variant="body1"
      >
        {`Your ${network} address:`}
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
        href={explorerUrl as any}
        target="_blank"
        size="small"
        color="primary"
        startIcon={<LinkIcon />}
      >
        {`Go to ${network} Nervos`}
      </Button>
    </Box>
  )
}

export default AccountFaucetBox
