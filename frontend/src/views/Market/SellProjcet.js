import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, InputNumber } from 'antd';
import LoadingIndicator from '../Helper/Waiting';
import contractInstance from '../../contract/contract';

const SellPorjectForm = () => {
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState('');
    useEffect(() => {
        const initContract = async () => {
            try {
                await contractInstance.init();
                setContract(contractInstance.getTransactionContract());
                setAccount(contractInstance.getAccount());
            } catch (error) {
                message.error('合约初始化失败');
            }
        };

        initContract();
        
        const userData = localStorage.getItem('userData');
        if (userData) {
            form.setFieldsValue({ owner: JSON.parse(userData).address });
        }
    }, [form]);

    const onFinish = async (values) => {
        setIsLoading(true);
        try {
            const sendData = {
                name: values.name,
                description: values.description,
                category: values.category,
                price: values.price,
                brand: values.brand,
                owner: values.owner
            };

            // 调用合约发布商品
            await contract.methods.publishProduct(
                sendData.name,
                sendData.description,
                sendData.category,
                sendData.price,
                sendData.brand,
                sendData.owner
            ).send({ from: account });

            message.success('发布成功');
            form.resetFields();
        } catch (error) {
            message.error(`发布失败: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ margin: '24px' }}>
            <LoadingIndicator isOpen={isLoading} message="处理中..." />
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Form.Item
                    name="name"
                    label="设备名称"
                    rules={[{ required: true, message: '请输入设备名称' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="设备描述"
                    rules={[{ required: true, message: '请输入设备描述' }]}
                >
                    <Input.TextArea />
                </Form.Item>

                <Form.Item
                    name="category"
                    label="设备类别"
                    rules={[{ required: true, message: '请输入设备类别' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="price"
                    label="价格"
                    rules={[
                        { required: true, message: '请输入价格' },
                        { type: 'number', min: 0, message: '价格必须大于0' },
                        { 
                            validator: (_, value) => {
                                if (value && !Number.isInteger(value)) {
                                    return Promise.reject('价格必须是整数');
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        precision={0}
                    />
                </Form.Item>

                <Form.Item
                    name="brand"
                    label="品牌"
                    rules={[{ required: true, message: '请输入品牌' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item name="owner" hidden>
                    <Input />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        发布商品
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default SellPorjectForm;