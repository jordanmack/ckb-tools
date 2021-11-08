import React from 'react'

import { Backdrop, Fade, Modal as MUIModal } from '@material-ui/core'

import { useStyles } from './Modal.styles'
import { IModalProps } from './Modal.types'

const Modal: React.FC<IModalProps> = ({ children, open, handleClose }) => {
  const classes = useStyles()

  return (
    <MUIModal
      className={classes.modal}
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <div style={{ outline: 0 }}>{(children as unknown) as JSX.Element}</div>
      </Fade>
    </MUIModal>
  )
}

export default Modal
