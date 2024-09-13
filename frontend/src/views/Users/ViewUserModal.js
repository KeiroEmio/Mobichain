import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const ViewUserModal = React.memo(({ user, open, onClose }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>User Details</DialogTitle>
            <DialogContent>
                <p>ID: {user ? user.id : 'Loading...'}</p>
                <p>Email: {user ? user.email : 'Loading...'}</p>
                <p>Address: {user ? user.address : 'Loading...'}</p>
                <p>Email Verified: {user ? user.email_verified_at : 'Loading...'}</p>
                <p>Token: {user ? user.token : 'Loading...'}</p>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
});

export default ViewUserModal;
