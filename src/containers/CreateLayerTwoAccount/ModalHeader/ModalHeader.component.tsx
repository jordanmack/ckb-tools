import React from 'react'

import { Box, CircularProgress, Typography, useTheme } from '@material-ui/core'

import { IModalHeaderProps } from './ModalHeader.types'

const CloseIcon: any = (props: any) => <img src="close.svg" alt="" {...props} />

const ModalHeader: React.FC<IModalHeaderProps> = ({
  title,
  icon,
  showLoader,
  onClose,
}) => {
  const { spacing, palette } = useTheme()

  return (
    <Box>
      <Box display="flex">
        <CloseIcon
          onClick={onClose}
          fill={palette.text.secondary}
          width={24}
          height={24}
          style={{
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        />
      </Box>

      <Box display="flex" justifyContent="center">
        <Box display="grid" justifyItems="center">
          {showLoader && (
            <CircularProgress
              style={{ marginBottom: spacing(3) }}
              color="primary"
            />
          )}
          {!showLoader && (
            <img
              style={{ height: 48, width: 48, marginBottom: spacing(2) }}
              src={icon}
              alt=""
            />
          )}

          <Typography variant="h4">{title}</Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default ModalHeader
