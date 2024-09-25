import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Snackbar, Alert } from '@mui/material';
import useApi from '../../Hooks/useApi';

const AddUserModal = ({ open, onClose }) => {
    const api = useApi();
    const [successMessage, setSuccessMessage] = useState('');
    const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAdd = async () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            setOpenSnackbar(true);
            return;
        }
        try {
            const response = await api.post('/api/auth/register', {
                email: formData.email,
                password: formData.password,
                confirm_password: formData.confirmPassword
            });
            console.log('Response:', response);
            setSuccessMessage(`${formData.email} 注册成功！`);
            setOpenSuccessSnackbar(true);
            onClose();
        } catch (error) {
            setError(error.message || 'Failed to add user.');
            setOpenSnackbar(true);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose}>
                <DialogTitle>添加新用户</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="email"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="standard"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="password"
                        label="密码输入..."
                        type="password"
                        fullWidth
                        variant="standard"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="confirmPassword"
                        label="密码确认..."
                        type="password"
                        fullWidth
                        variant="standard"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>取消</Button>
                    <Button onClick={handleAdd}>添加</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
            <Snackbar open={openSuccessSnackbar} autoHideDuration={6000} onClose={() => setOpenSuccessSnackbar(false)}>
                <Alert severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default AddUserModal;
