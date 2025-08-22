import React, { useState, useEffect } from 'react';
import { Form, InputNumber, Input, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import FormData from 'form-data';
import useApi from '../../Hooks/useApi';
import contractInstance from '../../contract/contract';

const SellingUIComponent = () => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const api = new useApi();
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    const handleFileChange = ({ file, fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const upload = async (file, uniqueFileName) => {
        if (file instanceof File) {
            const formData = new FormData();
            formData.append('formData', file, uniqueFileName);

            try {
                const response = await api.upload('/api/upload/products', formData);
                console.log('图片上传成功:', response);
                return true;
            } catch (error) {
                console.error('Upload error:', error);
                message.error(error.toString());
                return false;
            }
        } else {
            console.error('Upload failed: The file is not a valid Blob.');
            return false;
        }
    };

    const handlePublishProduct = async (values) => {
        setIsLoading(true);
        try {
            if (!contract) {
                throw new Error('合约未初始化');
            }
            
            if (!account) {
                throw new Error('账户未连接');
            }
            const priceValue = parseFloat(values.price);
            const multiplier = window.BigInt(10 ** 18);
            const priceInWei = (window.BigInt(Math.floor(priceValue * 100)) * multiplier / window.BigInt(100)).toString();
            
            const result = await contract.methods.publishProduct(
                values.name,
                values.description,
                values.category,
                priceInWei,
                values.brand,
                values.owner
            ).send({ 
                from: account,
                gas: 500000
            });

            if (!result) {
                throw new Error('合约调用失败');
            }
            
            const productId = result.events.ProductListed.returnValues[0].id.toString();
            let uniqueFileName = '';

            if (fileList.length > 0) {
                const file = fileList[0].originFileObj;
                const fileExtension = file.name.split('.').pop();
                uniqueFileName = `product_${productId}.${fileExtension}`;
            }

            const sendData = {
                name: values.name,
                description: values.description,
                category: values.category,
                price: values.price.toString(),
                brand: values.brand,
                owner: values.owner,
                imagePath: uniqueFileName,
                txHash: result.transactionHash,
                from: result.from,
                to: result.to,
                blockNumber: result.blockNumber.toString(),
                productCount: result.events.ProductListed.returnValues[0].id.toString(),
                blockHash:result.blockHash,
                uid : JSON.parse(localStorage.getItem('userData')).id,
            };

            const dbResult = await api.post('/api/products/add', sendData);
            
            if (!dbResult) {
                throw new Error('数据库保存失败');
            }

            if (fileList.length > 0) {
                const uploadSuccess = await upload(fileList[0].originFileObj, uniqueFileName);
                if (!uploadSuccess) {
                    throw new Error('图片上传失败');
                }
            }

            message.success('商品发布成功');
            form.resetFields();
            setFileList([]);
        } catch (error) {
            console.error('发布商品失败:', error);
            message.error(`发布失败: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ margin: '0 300px', maxHeight: '80vh', overflow: 'auto' }}>
            <Form form={form} layout="vertical" onFinish={handlePublishProduct}>
                <Form.Item
                    name="image"
                    label="商品图片"
                    rules={[{ required: true, message: '请上传商品图片' }]}
                >
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onChange={handleFileChange}
                        beforeUpload={() => false}
                        maxCount={1}
                    >
                        {fileList.length < 1 && (
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>上传图片</div>
                            </div>
                        )}
                    </Upload>
                </Form.Item>
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
                    name="brand"
                    label="品牌"
                    rules={[{ required: true, message: '请输入品牌' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="price"
                    label="价格"
                    rules={[
                        { required: true, message: '请输入价格' },
                        { type: 'number', min: 0, message: '价格必须大于0' },
                    ]}
                >
                    <InputNumber 
                        style={{ width: '100%' }} 
                        precision={2} 
                        step={0.01}
                        placeholder="例如: 1.11"
                        addonAfter="QKZ"
                    />
                </Form.Item>
                <Form.Item name="owner" hidden>
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        block
                        loading={isLoading}
                    >
                        发布商品
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default SellingUIComponent;