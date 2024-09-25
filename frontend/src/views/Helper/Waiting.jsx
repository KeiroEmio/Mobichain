import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { blue } from '@mui/material/colors';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'; // Blockchain related icon

const style = {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column', // Change flexDirection to column for better layout of icon and text
    borderRadius: '10px', // Rounded corners for a smoother look
    backgroundColor: blue[500], // A blue shade for a tech feel
    color: '#fff', // White text for better contrast
    width: '300px' // Set a specific width for the modal
};


const LoadingIndicator = ({ isOpen, message }) => {
    return (
        <Modal
            open={isOpen}
            aria-labelledby="loading-modal-title"
            aria-describedby="loading-modal-description"
        >
            <Box sx={style}>
                <AccountBalanceWalletIcon sx={{ fontSize: 60, marginBottom: 2 }} /> {/* Larger icon for visual emphasis */}
                <CircularProgress color="inherit" />
                {message && (
                    <Typography id="loading-modal-description" sx={{ mt: 2 }}>
                        {message}
                    </Typography>
                )}
            </Box>
        </Modal>
    );
};

export default LoadingIndicator;
