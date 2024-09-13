import React, { useState } from 'react';
import { Modal, Form, InputNumber, Button, message } from 'antd';
import useApi from '../../Hooks/useApi';

const TokenModal = ({ visible, onClose, onTokenChange, initialTokens, selectedUser }) => {
    const [tokens, setTokens] = useState(initialTokens);
    const [loading, setLoading] = useState(false);
    const api = new useApi();
    const upDateToken_Url = '/api/user/token/';

    const handleSubmit = async () => {
        // Check for more than two decimal places
        if (!/^\-?\d+(\.\d{1,2})?$/.test(String(tokens))) {
            message.error('小数点只能填前两位，比如：0.01');
            return; // Do not proceed with the submission
        }

        setLoading(true);
        try {
            const response = await api.post(upDateToken_Url, {
                userId: selectedUser.id,
                token: tokens
            });
            message.success('Token amount updated successfully');
            alert('编辑成功:', response.data);
            onTokenChange(tokens); // Ensure this is called to update the token in the parent component
            onClose();
        } catch (error) {
            message.error('Failed to update tokens');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="增加或减少token"
            visible={visible}
            onOk={handleSubmit}
            onCancel={onClose}
            footer={[
                <Button key="back" onClick={onClose} disabled={loading}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    Update Tokens
                </Button>,
            ]}
        >
            <Form layout="vertical">
                <Form.Item label="Token数量">
                    <InputNumber
                        min={-10000}
                        value={tokens}
                        onChange={setTokens}
                        style={{ width: '100%' }}
                        step={0.01}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default TokenModal;
