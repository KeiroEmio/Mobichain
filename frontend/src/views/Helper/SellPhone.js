import React, { useState, useEffect } from 'react';
import { Tabs, Form, Input, Checkbox, Button, DatePicker, Upload, message } from 'antd';
import { UploadOutlined, AppleOutlined, AndroidOutlined } from '@ant-design/icons';
import FormData from 'form-data';
import useApi from '../../Hooks/useApi';

const SellingUIComponent = () => {
    const [form] = Form.useForm();
    const [currentKey, setCurrentKey] = useState('1');
    const [fileList, setFileList] = useState([]);
    const [imagePath, setImagePath] = useState('');
    const api = new useApi();

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            form.setFieldsValue({ owner: JSON.parse(userData).address });
        }
    }, [form]);

    const handleFileChange = ({ file, fileList: newFileList }) => {
        setFileList(newFileList);
        if (file) {
            const timestamp = new Date().getTime();
            const fileExtension = file.name.split('.').pop();
            const uniqueFileName = `${timestamp}.${fileExtension}`;
            setImagePath(uniqueFileName);
            upload(file, uniqueFileName);
        }
    };

    const upload = (file, uniqueFileName) => {
        const formData = new FormData();
        if (file instanceof File) {
            // 注意这里使用 'formData' 作为键名，匹配后端的 req.files.formData
            formData.append('formData', file, uniqueFileName);

            api.post('/api/upload/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then(response => {
                    console.log('responseUpLoad:', response);
                })
                .catch(error => {
                    console.error('Upload error:', error);
                    message.error(error.toString());
                });
        } else {
            console.error('Upload failed: The file is not a valid Blob.');
        }
    };



    const onFinish = async (values) => {
        const sendData = {
            brand: values.brand,
            model: values.model,
            price: Number(values.price),
            owner: values.owner,
            issold: values.isSold ? 1 : 0,
            imagepath: imagePath, // 确保 imagepath 字段包含文件路径
            transactionTime: values.transactionTime ? values.transactionTime.format("YYYY-MM-DD HH:mm:ss") : null,
        };

        console.log('sendData:', sendData);
        const endpoint = currentKey === '1' ? '/api/iphone/add' : '/api/android/add';
        try {
            const response = await api.post(endpoint, sendData);
            if (response) {
                message.success('表单提交成功');
            } else {
                throw new Error(message);
            }
        } catch (error) {
            message.error(`提交失败: ${error.message}`);
        }
    };

    return (
        <div style={{ margin: '0 300px', maxHeight: '80vh', overflow: 'auto' }}>
            <Tabs defaultActiveKey="1" onChange={(key) => setCurrentKey(key)}>
                {[{ key: '1', label: <span><AppleOutlined /> Apple</span> }, { key: '2', label: <span><AndroidOutlined /> Android</span> }].map(tab => (
                    <Tabs.TabPane tab={tab.label} key={tab.key}>
                        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ isSold: false }}>
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
                                    beforeUpload={() => false} // 阻止自动上传
                                >
                                    <Button icon={<UploadOutlined />}>点击上传</Button>
                                </Upload>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">提交</Button>
                            </Form.Item>
                        </Form>
                    </Tabs.TabPane>
                ))}
            </Tabs>
        </div>
    );
};

export default SellingUIComponent;
