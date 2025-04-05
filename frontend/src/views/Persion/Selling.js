import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, message, Typography, Tooltip, Empty, Spin, Space, Modal, Descriptions, Divider, Statistic } from 'antd';
import { LinkOutlined, CopyOutlined, BlockOutlined, ShoppingOutlined, QrcodeOutlined, FieldTimeOutlined, DollarOutlined, TagOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';
import useApi from '../../Hooks/useApi';
import contractInstance from '../../contract/contract';

const { Title, Text, Paragraph } = Typography;

const Selling = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [account, setAccount] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const api = useApi();

    useEffect(() => {
        const initWallet = async () => {
            try {
                await contractInstance.init();
                const accountAddr = contractInstance.getAccount();
                setAccount(accountAddr);
                
                if (accountAddr) {
                    fetchSellingProducts(accountAddr);
                } else {
                    message.warning('未检测到钱包账户，请确保已连接MetaMask');
                    setLoading(false);
                }
            } catch (error) {
                console.error('钱包初始化失败:', error);
                message.error('钱包初始化失败: ' + (error.message || '未知错误'));
                setLoading(false);
            }
        };

        initWallet();
    }, []);

    const fetchSellingProducts = async (address) => {
        try {
            setLoading(true);
            const response = await api.get(`/api/products/unsold/${address}`);
            console.log('获取的商品数据:', response.data.data.data);
            if (response.data.data) {
                setProducts(response.data.data.data);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('获取在售商品失败:', error);
            message.error('获取在售商品失败: ' + (error.response?.data?.message || '未知错误'));
        } finally {
            setLoading(false);
        }
    };

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const handleCopyAddress = (text, e) => {
        if (e) {
            e.stopPropagation();
        }
        navigator.clipboard.writeText(text);
        message.success('地址已复制到剪贴板');
    };

    const viewProduct = (record) => {
        setSelectedProduct(record);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString();
    };

    const columns = [
        {
            title: '商品',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img 
                        src={`http://localhost:8060/assets/uploads/products/${record.photo}`}
                        alt={text}
                        style={{ width: 50, height: 50, marginRight: 10, objectFit: 'cover', borderRadius: 4 }}
                    />
                    <span>{text}</span>
                </div>
            ),
        },
        {
            title: '价格',
            dataIndex: 'price',
            key: 'price',
            render: (price) => (
                <Text strong style={{ color: '#1890ff' }}>{price} QZK</Text>
            ),
        },
        {
            title: '类别',
            dataIndex: 'category',
            key: 'category',
            render: (category) => (
                <Tag color="blue">{category}</Tag>
            ),
        },
        {
            title: '区块高度',
            dataIndex: 'block_number',
            key: 'block_number',
            render: (block_number) => (
                <Tooltip title="在Sepolia浏览器中查看区块">
                    <Tag 
                        color="purple" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => window.open(`https://sepolia.etherscan.io/block/${block_number}`, '_blank')}
                    >
                        {block_number} <LinkOutlined style={{ fontSize: '12px' }} />
                    </Tag>
                </Tooltip>
            ),
        },
        {
            title: '交易哈希',
            dataIndex: 'tx_hash',
            key: 'tx_hash',
            render: (tx_hash) => (
                <Tooltip title="在Sepolia浏览器中查看交易">
                    <Tag 
                        color="geekblue" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => window.open(`https://sepolia.etherscan.io/tx/${tx_hash}`, '_blank')}
                    >
                        {formatAddress(tx_hash)} 
                        <LinkOutlined style={{ fontSize: '12px', marginLeft: 4 }} />
                        <CopyOutlined
                            style={{ fontSize: '12px', marginLeft: 4 }}
                            onClick={(e) => handleCopyAddress(tx_hash, e)}
                        />
                    </Tag>
                </Tooltip>
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Button 
                    type="primary" 
                    icon={<ShoppingOutlined />}
                    onClick={(e) => {
                        e.stopPropagation();
                        viewProduct(record);
                    }}
                >
                    查看详情
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card 
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <BlockOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        <Title level={4} style={{ margin: 0 }}>我的在售商品</Title>
                    </div>
                }
                extra={
                    <Space>
                        <Text type="secondary">钱包地址:</Text>
                        <Tooltip title={account}>
                            <Tag color="green">
                                {formatAddress(account)}
                                <CopyOutlined
                                    style={{ marginLeft: 4, cursor: 'pointer' }}
                                    onClick={(e) => handleCopyAddress(account, e)}
                                />
                            </Tag>
                        </Tooltip>
                    </Space>
                }
                style={{ 
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    background: 'linear-gradient(to right, #f8f9fa, #ffffff)'
                }}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                    </div>
                ) : products.length > 0 ? (
                    <Table 
                        columns={columns} 
                        dataSource={products} 
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                        style={{ 
                            borderRadius: 8,
                            overflow: 'hidden'
                        }}
                        onRow={(record) => ({
                            onClick: () => viewProduct(record),
                            style: { cursor: 'pointer' }
                        })}
                    />
                ) : (
                    <Empty 
                        description="暂无在售商品" 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{ padding: '40px 0' }}
                    />
                )}
            </Card>

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <BlockOutlined style={{ fontSize: '20px', color: '#1890ff', marginRight: '10px' }} />
                        <span>区块链商品详情</span>
                    </div>
                }
                open={modalVisible}
                onCancel={handleCloseModal}
                footer={null}
                width={800}
                style={{ top: 20 }}
                bodyStyle={{ 
                    padding: '24px',
                    background: 'linear-gradient(to right, #f0f2f5, #ffffff)'
                }}
            >
                {selectedProduct && (
                    <div>
                        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                            {/* 左侧商品图片 */}
                            <div style={{ flex: '0 0 300px' }}>
                                <img
                                    src={`http://localhost:8060/assets/uploads/products/${selectedProduct.photo}`}
                                    alt={selectedProduct.name}
                                    style={{
                                        width: '100%',
                                        height: '300px',
                                        objectFit: 'cover',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                                
                                {/* 价格和状态标签 */}
                                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Statistic
                                        title="价格"
                                        value={selectedProduct.price}
                                        suffix="QZK"
                                        valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                                        prefix={<DollarOutlined />}
                                    />
                                    <Tag color={selectedProduct.is_sold ? 'red' : 'green'} style={{ padding: '4px 12px', fontSize: '14px' }}>
                                        {selectedProduct.is_sold ? '已售出' : '在售'}
                                    </Tag>
                                </div>
                            </div>
                            
                            {/* 右侧商品信息 */}
                            <div style={{ flex: 1 }}>
                                <Title level={3}>{selectedProduct.name}</Title>
                                
                                <Descriptions bordered column={1} size="small" style={{ marginTop: '16px' }}>
                                    <Descriptions.Item label={<><TagOutlined /> 品牌</>}>{selectedProduct.brand}</Descriptions.Item>
                                    <Descriptions.Item label={<><TagOutlined /> 类别</>}>{selectedProduct.category}</Descriptions.Item>
                                    <Descriptions.Item label={<><FileTextOutlined /> 描述</>}>
                                        <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: '展开' }}>
                                            {selectedProduct.description}
                                        </Paragraph>
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<><FieldTimeOutlined /> 创建时间</>}>
                                        {formatDateTime(selectedProduct.created_at)}
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        </div>
                        
                        <Divider orientation="left">
                            <Space>
                                <QrcodeOutlined />
                                <span>区块链信息</span>
                            </Space>
                        </Divider>
                        
                        {/* 区块链信息卡片 */}
                        <Card
                            style={{ 
                                backgroundColor: '#f0f7ff', 
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                            bordered={false}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <Text type="secondary">所有者地址：</Text>
                                    <Tooltip title={selectedProduct.owner_address}>
                                        <Tag
                                            color="blue"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => window.open(`https://sepolia.etherscan.io/address/${selectedProduct.owner_address}`, '_blank')}
                                        >
                                            {formatAddress(selectedProduct.owner_address)} <LinkOutlined style={{ fontSize: '12px', marginRight: '4px' }} />
                                            <CopyOutlined
                                                style={{ fontSize: '12px' }}
                                                onClick={(e) => handleCopyAddress(selectedProduct.owner_address, e)}
                                            />
                                        </Tag>
                                    </Tooltip>
                                </div>
                                
                                <div>
                                    <Text type="secondary">交易哈希：</Text>
                                    <Tooltip title={selectedProduct.tx_hash}>
                                        <Tag
                                            color="purple"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => window.open(`https://sepolia.etherscan.io/tx/${selectedProduct.tx_hash}`, '_blank')}
                                        >
                                            {formatAddress(selectedProduct.tx_hash)} <LinkOutlined style={{ fontSize: '12px', marginRight: '4px' }} />
                                            <CopyOutlined
                                                style={{ fontSize: '12px' }}
                                                onClick={(e) => handleCopyAddress(selectedProduct.tx_hash, e)}
                                            />
                                        </Tag>
                                    </Tooltip>
                                </div>
                                
                                <div>
                                    <Text type="secondary">区块哈希：</Text>
                                    <Tooltip title={selectedProduct.block_hash}>
                                        <Tag
                                            color="geekblue"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => window.open(`https://sepolia.etherscan.io/block/${selectedProduct.block_hash}`, '_blank')}
                                        >
                                            {formatAddress(selectedProduct.block_hash)} <LinkOutlined style={{ fontSize: '12px', marginRight: '4px' }} />
                                            <CopyOutlined
                                                style={{ fontSize: '12px' }}
                                                onClick={(e) => handleCopyAddress(selectedProduct.block_hash, e)}
                                            />
                                        </Tag>
                                    </Tooltip>
                                </div>
                                
                                <div>
                                    <Text type="secondary">区块高度：</Text>
                                    <Tag
                                        color="cyan"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => window.open(`https://sepolia.etherscan.io/block/${selectedProduct.block_number}`, '_blank')}
                                    >
                                        {selectedProduct.block_number}
                                    </Tag>
                                </div>
                                
                                <div>
                                    <Text type="secondary">商品ID：</Text>
                                    <Tag color="orange">{selectedProduct.productCount}</Tag>
                                </div>
                            </div>
                        </Card>
                        
                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="primary" onClick={handleCloseModal}>
                                关闭
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Selling;