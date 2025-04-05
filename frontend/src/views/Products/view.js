import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Spin, message, Typography, Divider, Tag, Tooltip, Space, Modal } from 'antd';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { BlockOutlined, CheckCircleOutlined, ClockCircleOutlined, ShoppingCartOutlined, MessageOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons';
import useApi from '../../Hooks/useApi';
import contractInstance from '../../contract/contract';
import useAuth from '../../Hooks/useAuth.js';
const { Title, Text, Paragraph } = Typography;

const ProductView = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const api = useApi();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [buyModalVisible, setBuyModalVisible] = useState(false);
    const [buyLoading, setBuyLoading] = useState(false);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState('');
    const auth  = useAuth();

    useEffect(() => {
        console.log('auth:',localStorage.getItem("userData"));
        const initContract = async () => {
            try {
                await contractInstance.init();
                const contractObj = contractInstance.getTransactionContract();
                const accountAddr = contractInstance.getAccount();

                console.log('合约对象:', contractObj);
                console.log('账户地址:', accountAddr);

                if (!contractObj) {
                    console.error('合约对象为空');
                    message.warning('合约初始化不完整，请确保已连接MetaMask');
                    return;
                }

                if (!accountAddr) {
                    console.error('账户地址为空');
                    message.warning('未检测到钱包账户，请确保已连接MetaMask');
                    return;
                }

                setContract(contractObj);
                setAccount(accountAddr);
                console.log('合约初始化成功');
            } catch (error) {
                console.error('合约初始化失败，详细错误:', error);
                message.error('合约初始化失败: ' + (error.message || '未知错误'));
            }
        };

        initContract();

        if (location.state?.rowData) {
            setProduct(location.state.rowData);
            console.log('从列表传递的商品数据:', location.state.rowData);
        } else {
            loadProductDetails();
        }
    }, []);

    const loadProductDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/products/view/${id}`);
            console.log('加载商品详情:', response);
            if (response && response.data) {
                setProduct(response.data.data);
            }
        } catch (error) {
            console.error('加载商品详情失败:', error);
            message.error('加载商品详情失败');
        } finally {
            setLoading(false);
        }
    };

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const handleCopyAddress = (text, e) => {
        if (e) {
            e.stopPropagation();
        }
        navigator.clipboard.writeText(text);
        message.success('地址已复制到剪贴板');
    };

    const handleBuy = () => {
        setBuyModalVisible(true);
    };

    const confirmBuy = async () => {
        setBuyLoading(true);
        try {
            if (!contract) {
                throw new Error('合约未初始化');
            }

            if (!account) {
                throw new Error('账户未连接');
            }

            if (!product || !product.productCount) {
                throw new Error('商品信息不完整');
            }

            console.log('调用合约购买参数:', product.productCount, account);

            // 获取代币合约
            const tokenContract = contractInstance.getTokenContract();
            if (!tokenContract) {
                throw new Error('代币合约未初始化');
            }

            const web3 = contractInstance.getWeb3();
            const priceInWei = web3.utils.toWei(product.price.toString(), 'ether');
            const approveResult = await tokenContract.methods.approve(
                contract._address, // 交易合约地址
                priceInWei
            ).send({
                from: account
            });

            console.log('代币授权结果:', approveResult);
            // 调用合约的buyProduct函数
            const result = await contract.methods.buyProduct(
                product.productCount, 
                account
            ).send({
                from: account,
                gas: 500000
            });

            if (!result) {
                throw new Error('合约调用失败');
            }

            console.log('购买合约调用成功:', result);
            console.log('购买合约调用成功:', result.blockHash);
            // 更新数据库中的商品状态
            const updateData = {
                pid: product.id,  
                uid: JSON.parse(localStorage.getItem("userData")).id,  
                is_sold: 1,
                buyer_address: account,
                seller_address: product.owner_address,  
                price: product.price,  
                tx_hash: result.transactionHash,
                block_number: result.blockNumber.toString(),
                block_hash: result.blockHash
            };

            const dbResult = await api.post('/api/products/sold', updateData);

            if (!dbResult) {
                throw new Error('数据库更新失败');
            }

            message.success('购买成功并已上链！');
            setBuyModalVisible(false);

            setProduct({
                ...product,
                is_sold: 1,
                buyer_address: account
            });

        } catch (error) {
            console.error('购买失败详情:', error);

            // 提供更友好的错误信息
            let errorMessage = error.message;
            if (errorMessage.includes('execution reverted')) {
                if (errorMessage.includes('Invalid product ID')) {
                    errorMessage = '商品ID无效';
                } else if (errorMessage.includes('Product is already sold')) {
                    errorMessage = '商品已售出';
                } else if (errorMessage.includes('Insufficient balance')) {
                    errorMessage = '代币余额不足';
                } else if (errorMessage.includes('Approve failed')) {
                    errorMessage = '代币授权失败';
                } else if (errorMessage.includes('Transfer failed')) {
                    errorMessage = '代币转账失败';
                } else {
                    errorMessage = '交易被回滚: ' + errorMessage;
                }
            }

            message.error(`购买失败: ${errorMessage}`);
        } finally {
            setBuyLoading(false);
        }
    };

    const handleChat = () => {
        // 跳转到聊天页面，并传递商品和卖家信息
        navigate('/user/chat', {
            state: {
                targetUser: product.uid,
                productInfo: {
                    id: product.id,
                    name: product.name,
                    price: product.price
                }
            }
        });
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!product) {
        return <div>商品不存在</div>;
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Card bordered={false} style={{ borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* 顶部区域 - 标题和状态 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={2} style={{ margin: 0 }}>{product.name}</Title>
                        <Tag color={product.is_sold ? 'red' : 'green'} style={{ padding: '4px 12px', fontSize: '14px' }}>
                            {product.is_sold ? '已售出' : '在售'}
                        </Tag>
                    </div>

                    <Divider style={{ margin: '12px 0' }} />

                    {/* 主要内容区域 */}
                    <div style={{ display: 'flex', gap: '24px' }}>
                        {/* 左侧图片区域 */}
                        <div style={{ flex: '0 0 400px' }}>
                            <img
                                src={`http://localhost:8060/assets/uploads/products/${product.photo}`}
                                alt={product.name}
                                style={{
                                    width: '100%',
                                    height: '400px',
                                    objectFit: 'cover',
                                    borderRadius: '10px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                        </div>

                        {/* 右侧信息区域 */}
                        <div style={{ flex: 1 }}>
                            <Title level={3} style={{ color: '#1890ff', marginTop: 0 }}>
                                {product.price} QZK
                            </Title>

                            <Descriptions column={1} style={{ marginBottom: '24px' }}>
                                <Descriptions.Item label={<Text strong>品牌</Text>}>{product.brand}</Descriptions.Item>
                                <Descriptions.Item label={<Text strong>类别</Text>}>{product.category}</Descriptions.Item>
                                <Descriptions.Item label={<Text strong>描述</Text>}>
                                    <Paragraph>{product.description}</Paragraph>
                                </Descriptions.Item>
                            </Descriptions>

                            {/* 区块链信息卡片 */}
                            <Card
                                title={<><BlockOutlined /> 区块链信息</>}
                                style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}
                                bordered={false}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <Text type="secondary">所有者地址：</Text>
                                        <Tooltip title="在Sepolia浏览器中查看">
                                            <Tag
                                                color="blue"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => window.open(`https://sepolia.etherscan.io/address/${product.owner_address}`, '_blank')}
                                            >
                                                {formatAddress(product.owner_address)} <LinkOutlined style={{ fontSize: '12px', marginRight: '4px' }} />
                                                <CopyOutlined
                                                    style={{ fontSize: '12px' }}
                                                    onClick={(e) => handleCopyAddress(product.owner_address, e)}
                                                />
                                            </Tag>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Text type="secondary">交易哈希：</Text>
                                        <Tooltip title="在Sepolia浏览器中查看交易">
                                            <Tag
                                                color="purple"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => window.open(`https://sepolia.etherscan.io/tx/${product.tx_hash}`, '_blank')}
                                            >
                                                {formatAddress(product.tx_hash)} <LinkOutlined style={{ fontSize: '12px', marginRight: '4px' }} />
                                                <CopyOutlined
                                                    style={{ fontSize: '12px' }}
                                                    onClick={(e) => handleCopyAddress(product.tx_hash, e)}
                                                />
                                            </Tag>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Text type="secondary">区块哈希：</Text>
                                        <Tooltip title="在Sepolia浏览器中查看区块">
                                            <Tag
                                                color="geekblue"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => window.open(`https://sepolia.etherscan.io/block/${product.block_hash}`, '_blank')}
                                            >
                                                {formatAddress(product.block_hash)} <LinkOutlined style={{ fontSize: '12px', marginRight: '4px' }} />
                                                <CopyOutlined
                                                    style={{ fontSize: '12px' }}
                                                    onClick={(e) => handleCopyAddress(product.block_hash, e)}
                                                />
                                            </Tag>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Text type="secondary">区块高度：</Text>
                                        <Tag
                                            color="cyan"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => window.open(`https://sepolia.etherscan.io/block/${product.block_number}`, '_blank')}
                                        >
                                            {product.block_number} <LinkOutlined style={{ fontSize: '12px' }} />
                                        </Tag>
                                    </div>
                                    <div>
                                        <Text type="secondary">创建时间：</Text>
                                        <Tag icon={<ClockCircleOutlined />}>
                                            {formatDateTime(product.created_at)}
                                        </Tag>
                                    </div>
                                </div>
                            </Card>

                            {/* 操作按钮 */}
                            <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<ShoppingCartOutlined />}
                                    onClick={handleBuy}
                                    disabled={product.is_sold === 1}
                                    style={{ flex: 1 }}
                                >
                                    立即购买
                                </Button>
                                <Button
                                    type="default"
                                    size="large"
                                    icon={<MessageOutlined />}
                                    onClick={handleChat}
                                    style={{ flex: 1 }}
                                >
                                    联系卖家
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* 购买确认弹窗 */}
            <Modal
                title="确认购买"
                open={buyModalVisible}
                onCancel={() => setBuyModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setBuyModalVisible(false)}>
                        取消
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={buyLoading}
                        onClick={confirmBuy}
                    >
                        确认购买
                    </Button>,
                ]}
            >
                <p>您确定要购买 <Text strong>{product?.name}</Text> 吗？</p>
                <p>价格: <Text type="danger" strong>{product?.price} QZK</Text></p>
                <p>卖家: {formatAddress(product?.owner_address)}</p>
                <p>商品ID: {product?.productCount}</p>
                <p>交易将通过区块链进行，请确保您的钱包中有足够的ETH。</p>
            </Modal>
        </div>
    );
};

export default ProductView;