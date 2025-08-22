import React, { useState, useEffect } from 'react';
import { Card, Table, Input, Button, Tabs, Typography, Spin, Statistic, Row, Col, Divider, Tag, List, Descriptions, Empty, Modal } from 'antd';
import { SearchOutlined, ShoppingOutlined, WalletOutlined, FileSearchOutlined, AppstoreOutlined, CheckCircleOutlined } from '@ant-design/icons';
import contractInstance from '../../contract/contract';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const BlockchainExplorer = () => {
    const [contract, setContract] = useState(null);
    const [tokenContract, setTokenContract] = useState(null);
    const [account, setAccount] = useState('');
    const [loading, setLoading] = useState(false);
    const [productCount, setProductCount] = useState(0);
    const [products, setProducts] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [searchType, setSearchType] = useState('product');
    const [tokenInfo, setTokenInfo] = useState({
        balance: 0,
        address: ''
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    useEffect(() => {
        initContractData();
    }, []);

    const initContractData = async () => {
        try {
            setLoading(true);
            await contractInstance.init();
            const marketContract = contractInstance.getTransactionContract();
            const token = contractInstance.getTokenContract();
            const currentAccount = contractInstance.getAccount();
            
            setContract(marketContract);
            setTokenContract(token);
            setAccount(currentAccount);

            const countResult = await marketContract.methods.productCount().call();
            const count = parseInt(countResult) - 1;
            setProductCount(count);

            if (token && currentAccount) {
                const balance = await token.methods.balanceOf(currentAccount).call();
                const tokenAddress = await marketContract.methods.tokenAddress().call();
                
                setTokenInfo({
                    balance: contractInstance.getWeb3().utils.fromWei(balance, 'ether'),
                    address: tokenAddress
                });
            }

            await loadRecentProducts(marketContract, count);
            
        } catch (error) {
            console.error('初始化合约数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRecentProducts = async (marketContract, count) => {
        try {
            const productList = [];
            const startIndex = 1;
            const endIndex = count;
            
            if (count > 0) {
                for (let i = startIndex; i <= endIndex; i++) {
                    try {
                        const product = await marketContract.methods.getProduct(i).call();
                        if (product && product.id) {
                            productList.push({
                                key: i.toString(),
                                id: product.id,
                                name: product.name,
                                description: product.description,
                                category: product.category,
                                brand: product.brand,
                                price: contractInstance.getWeb3().utils.fromWei(product.price, 'ether'),
                                owner: product.owner,
                                isSold: product.isSold,
                                isReceived: product.isReceived,
                                buyer: product.buyer
                            });
                        }
                    } catch (err) {
                        console.warn(`获取产品ID ${i} 失败:`, err.message);
                    }
                }
            }
            
            console.log('加载的产品信息:', productList);
            setProducts(productList);
            
        } catch (error) {
            console.error('加载产品数据失败:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchValue || !contract) return;
        
        setLoading(true);
        try {
            if (searchType === 'product') {
                const productId = parseInt(searchValue);
                if (!isNaN(productId) && productId > 0) {
                    try {
                        const product = await contract.methods.getProduct(productId).call();
                        if (product && product.id) {
                            const formattedProduct = {
                                key: productId.toString(),
                                id: product.id,
                                name: product.name,
                                description: product.description,
                                category: product.category,
                                brand: product.brand,
                                price: contractInstance.getWeb3().utils.fromWei(product.price, 'ether'),
                                owner: product.owner,
                                isSold: product.isSold,
                                isReceived: product.isReceived,
                                buyer: product.buyer
                            };
                            console.log('搜索到的产品信息:', formattedProduct);
                            setProducts([formattedProduct]);
                            setSelectedProduct(formattedProduct);
                            showProductDetails(formattedProduct);
                        } else {
                            setProducts([]);
                            setSelectedProduct(null);
                        }
                    } catch (err) {
                        console.error(`获取产品ID ${productId} 失败:`, err);
                        setProducts([]);
                        setSelectedProduct(null);
                    }
                } else {
                    setProducts([]);
                    setSelectedProduct(null);
                }
            } else if (searchType === 'address') {
                console.log('搜索钱包地址:', searchValue);
                if (contractInstance.getWeb3().utils.isAddress(searchValue)) {
                    try {
                        const balance = await tokenContract.methods.balanceOf(searchValue).call();
                        
                        setTokenInfo({
                            balance: contractInstance.getWeb3().utils.fromWei(balance, 'ether'),
                            address: searchValue
                        });
                        
                        const accountTab = document.querySelector('.ant-tabs-tab:nth-child(3)');
                        if (accountTab) {
                            accountTab.click();
                        }
                    } catch (err) {
                        console.error(`查询地址 ${searchValue} 余额失败:`, err);
                    }
                }
            }
        } catch (error) {
            console.error('搜索失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const showProductDetails = (product) => {
        setSelectedProduct(product);
        setDetailModalVisible(true);
    };

    const productColumns = [
        {
            title: '产品ID',
            dataIndex: 'key',
            key: 'key',
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '类别',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: '品牌',
            dataIndex: 'brand',
            key: 'brand',
        },
        {
            title: '价格(QZK)',
            dataIndex: 'price',
            key: 'price',
        },
        {
            title: '状态',
            key: 'status',
            render: (_, record) => (
                <>
                    {record.isSold ? 
                        <Tag color="red">已售出</Tag> : 
                        <Tag color="green">在售</Tag>
                    }
                    {record.isReceived && <Tag color="purple">已确认收货</Tag>}
                </>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Button type="link" onClick={() => showProductDetails(record)}>
                    查看详情
                </Button>
            )
        }
    ];

    return (
        <div style={{ padding: '20px' }}>
            <Title level={2}>区块链数据浏览器</Title>
            <Paragraph>
                探索二手市场智能合约上的产品和账户信息
            </Paragraph>

            <Row gutter={16} style={{ marginBottom: '20px' }}>
                <Col span={8}>
                    <Card>
                        <Statistic 
                            title="产品总数" 
                            value={productCount} 
                            prefix={<AppstoreOutlined />} 
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic 
                            title="QZK代币地址" 
                            value={tokenInfo.address ? `${tokenInfo.address.substring(0, 8)}...${tokenInfo.address.substring(tokenInfo.address.length - 6)}` : '未连接'} 
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic 
                            title="我的QZK余额" 
                            value={tokenInfo.balance} 
                            precision={2} 
                            prefix={<WalletOutlined />} 
                        />
                    </Card>
                </Col>
            </Row>

            <Card style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', marginBottom: '16px' }}>
                    <Input 
                        placeholder="输入产品ID或钱包地址" 
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        style={{ marginRight: '8px' }}
                        prefix={<SearchOutlined />}
                    />
                    <Button.Group style={{ marginRight: '8px' }}>
                        <Button 
                            type={searchType === 'product' ? 'primary' : 'default'} 
                            onClick={() => setSearchType('product')}
                            icon={<ShoppingOutlined />}
                        >
                            产品
                        </Button>
                        <Button 
                            type={searchType === 'address' ? 'primary' : 'default'} 
                            onClick={() => setSearchType('address')}
                            icon={<WalletOutlined />}
                        >
                            钱包地址
                        </Button>
                    </Button.Group>
                    <Button 
                        type="primary" 
                        onClick={handleSearch}
                        icon={<FileSearchOutlined />}
                    >
                        搜索
                    </Button>
                </div>
            </Card>

            <Tabs defaultActiveKey="1">
                <TabPane tab="产品列表" key="1">
                    <Spin spinning={loading}>
                        <Table 
                            dataSource={products} 
                            columns={productColumns} 
                            pagination={false}
                            scroll={{ x: true }}
                        />
                    </Spin>
                </TabPane>
                <TabPane tab="我的账户" key="3">
                    <Card>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Statistic title="我的地址" value={account} />
                                <Divider />
                                <Statistic 
                                    title="QZK余额" 
                                    value={tokenInfo.balance} 
                                    precision={2} 
                                />
                            </Col>
                        </Row>
                    </Card>
                </TabPane>
            </Tabs>

            <Modal
                title="产品详细信息"
                visible={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        关闭
                    </Button>
                ]}
                width={800}
            >
                {selectedProduct ? (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="产品ID">{selectedProduct.key}</Descriptions.Item>
                        <Descriptions.Item label="名称">{selectedProduct.name}</Descriptions.Item>
                        <Descriptions.Item label="描述">{selectedProduct.description}</Descriptions.Item>
                        <Descriptions.Item label="类别">{selectedProduct.category}</Descriptions.Item>
                        <Descriptions.Item label="品牌">{selectedProduct.brand}</Descriptions.Item>
                        <Descriptions.Item label="价格">{selectedProduct.price} QZK</Descriptions.Item>
                        <Descriptions.Item label="所有者">
                            <Text copyable>{selectedProduct.owner}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="状态">
                            {selectedProduct.isSold ? 
                                <Tag color="red">已售出</Tag> : 
                                <Tag color="green">在售</Tag>
                            }
                            {selectedProduct.isReceived && 
                                <Tag color="purple">已确认收货</Tag>
                            }
                        </Descriptions.Item>
                        {selectedProduct.isSold && (
                            <Descriptions.Item label="买家">
                                <Text copyable>{selectedProduct.buyer}</Text>
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                ) : (
                    <Empty description="无产品信息" />
                )}
            </Modal>
        </div>
    );
};

export default BlockchainExplorer;