import React, { useState, useEffect } from 'react';
import { Tabs, Form, InputNumber, Input, Checkbox, Button, DatePicker, Upload, message } from 'antd';
import { UploadOutlined, AppleOutlined, AndroidOutlined } from '@ant-design/icons';
import FormData from 'form-data';
import useApi from '../../Hooks/useApi';
import contractInstance from '../../contract/contract';

const SellingUIComponent = () => {
    const [form] = Form.useForm();
    const [currentKey, setCurrentKey] = useState('1');
    const [fileList, setFileList] = useState([]);
    const [imagePath, setImagePath] = useState('');
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
        initContract()
        console.log(initContract());
        
        const userData = localStorage.getItem('userData');
        // console.log('userData:', userData);
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
            // 使用封装好的 upload 方法
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

            console.log('调用合约参数:', values.name,
                values.description,
                values.category,
                values.price, 
                values.brand,
                values.owner);

            // 1. 调用合约
            const result = await contract.methods.publishProduct(
                values.name,
                values.description,
                values.category,
                values.price, 
                values.brand,
                values.owner
            ).send({ 
                from: account,
                gas: 500000
            });

            if (!result) {
                throw new Error('合约调用失败');
            }
            console.log('合约调用成功:', result);
            const productId = result.events.ProductListed.returnValues[0].id.toString();
            let uniqueFileName = '';

            // 2. 准备图片文件名
            if (fileList.length > 0) {
                const file = fileList[0].originFileObj;
                const fileExtension = file.name.split('.').pop();
                uniqueFileName = `product_${productId}.${fileExtension}`;
            }

            // 3. 保存到数据库
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

            // 4. 最后上传图片
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
            // 处理错误，比如回滚合约调用或回滚数据库操作
            message.error(`发布失败: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const onFinish = async (values) => {
        if (currentKey === '3') {
            await handlePublishProduct(values);
        } else {
            const sendData = {
                brand: values.brand,
                model: values.model,
                price: Number(values.price),
                owner: values.owner,
                issold: values.isSold ? 1 : 0,
                transactionTime: values.transactionTime ? values.transactionTime.format("YYYY-MM-DD HH:mm:ss") : null,
            };

            try {
                // 1. 先保存数据
                const endpoint = currentKey === '1' ? '/api/iphone/add' : '/api/android/add';
                const response = await api.post(endpoint, sendData);
                
                if (!response) {
                    throw new Error('数据保存失败');
                }

                // 2. 如果有图片，再上传图片
                if (fileList.length > 0) {
                    const file = fileList[0].originFileObj;
                    const fileExtension = file.name.split('.').pop();
                    const uniqueFileName = `${response.id}.${fileExtension}`;
                    
                    const uploadSuccess = await upload(file, uniqueFileName);
                    if (!uploadSuccess) {
                        throw new Error('图片上传失败');
                    }
                }

                message.success('表单提交成功');
                form.resetFields();
                setFileList([]);
            } catch (error) {
                message.error(`提交失败: ${error.message}`);
            }
        }
    };

    // 其余 JSX 部分保持不变
    return (
        <div style={{ margin: '0 300px', maxHeight: '80vh', overflow: 'auto' }}>
            <Tabs defaultActiveKey="1" onChange={(key) => setCurrentKey(key)}>
                {[
                    { key: '1', label: <span><AppleOutlined /> Apple</span> },
                    { key: '2', label: <span><AndroidOutlined /> Android</span> },
                    { key: '3', label: "其他设备" }
                ].map(tab => (
                    <Tabs.TabPane tab={tab.label} key={tab.key}>
                        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ isSold: false }}>
                            {currentKey === '3' ? (
                                <>
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
                                        <InputNumber style={{ width: '100%' }} precision={0} />
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
                                </>
                            ) : (
                                <>
                                    <Form.Item name="brand" label="品牌">
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="model" label="型号">
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="price" label="价格">
                                        <Input type="number" />
                                    </Form.Item>
                                    <Form.Item name="owner" label="所有者" hidden>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="transactionTime" label="存在时间">
                                        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
                                    </Form.Item>
                                    <Form.Item name="isSold" valuePropName="checked">
                                        <Checkbox>已售</Checkbox>
                                    </Form.Item>
                                    <Form.Item name="image" label="上传图片">
                                        <Upload
                                            listType="picture"
                                            fileList={fileList}
                                            onChange={handleFileChange}
                                            beforeUpload={() => false}
                                        >
                                            <Button icon={<UploadOutlined />}>点击上传</Button>
                                        </Upload>
                                    </Form.Item>
                                </>
                            )}
                            <Form.Item>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    block
                                    loading={isLoading}
                                >
                                    {currentKey === '3' ? '发布商品' : '提交'}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Tabs.TabPane>
                ))}
            </Tabs>
        </div>
    );
};

export default SellingUIComponent;