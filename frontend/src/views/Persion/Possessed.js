import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Tabs, Tag, Tooltip, Button, Spin, Empty, Modal, Descriptions, Divider, message } from 'antd';
import { BlockOutlined, LinkOutlined, CopyOutlined, HistoryOutlined, ShoppingOutlined } from '@ant-design/icons';
import useApi from '../../Hooks/useApi';
import LoadingIndicator from '../Helper/Waiting';
import contractInstance from '../../contract/contract';

const { TabPane } = Tabs;

const Possessed = () => {
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [traceModalVisible, setTraceModalVisible] = useState(false);
  const [traceData, setTraceData] = useState(null);
  const api = useApi();

  useEffect(() => {
    const initWallet = async () => {
      try {
        await contractInstance.init();
        const accountAddr = contractInstance.getAccount();
        setAccount(accountAddr);

        if (accountAddr) {
          fetchPurchasedProducts(accountAddr);
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

  const fetchPurchasedProducts = async (address) => {
    try {
      setLoading(true);
      // 获取用户作为买家的已购买商品
      const response = await api.get(`/api/products/isold/${address}`);
      console.log("purchasedProducts:", response.data.data.data);
      if (response.data && response.data.data) {
        // 确保 purchasedProducts 是一个数组
        const productsData = Array.isArray(response.data.data.data) ? response.data.data.data : [];
        setPurchasedProducts(productsData);
      } else {
        // 如果没有数据，设置为空数组
        setPurchasedProducts([]);
      }
    } catch (error) {
      console.error("获取已购买商品失败:", error);
      message.error("获取已购买商品失败");
      // 出错时也设置为空数组
      setPurchasedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // 移除了 fetchPublishedProducts 函数
  const formatAddress = (address) => {
    if (!address || typeof address !== 'string') return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopyAddress = (text, e) => {
    if (e) {
      e.stopPropagation();
    }
    navigator.clipboard.writeText(text);
    message.success('地址已复制到剪贴板');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  const viewProductDetail = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

    const viewTraceability = async (product) => {
    try {
      setIsLoading(true);
      console.log("溯源数据:", product); // 调试用

      // 确保能正确访问嵌套的product对象
      const productData = product.product || {};
      const traceInfo = {
        creationBlock: productData.block_number || product.block_number,
        creationTime: productData.created_at || product.created_at,
        creator: productData.owner_address || product.owner_address || product.seller_address,
        transactions: [
          {
            type: '商品发布',
            time: productData.created_at || product.created_at,
            // 对于商品发布，from是卖方地址，to是合约地址
            from: productData.owner_address || productData.from || "0x0000000000000000000000000000000000000000",
            to: productData.to || "0x0000000000000000000000000000000000000000", // 合约地址
            txHash: productData.tx_hash || product.tx_hash,
            blockNumber: productData.block_number || product.block_number,
            price: `${productData.price || product.price} QZK`,
              //链上索引id
          productCount: productData.productCount
          }
        ]
      };

      // 如果是已售出商品，添加交易记录
      if (product.buyer_address) {
        traceInfo.transactions.push({
          type: '商品交易',
          time: product.transaction_time || product.updated_at,
          // 对于商品交易，from是卖方地址，to是买方地址
          from: product.seller_address,
          to: product.buyer_address,
          txHash: product.tx_hash,
          blockNumber: product.block_number,
          price: `${product.price} QZK`,
        });
      }

      setTraceData(traceInfo);
      setTraceModalVisible(true);
    } catch (error) {
      console.error("获取溯源信息失败:", error);
      message.error("获取溯源信息失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReceipt = async (product) => {
      setIsLoading(true);
      try {
        const contract = contractInstance.getTransactionContract();
        if (!contract) {
          throw new Error('合约实例未初始化');
        }
        const currentAccount = contractInstance.getAccount();
        const result = await contract.methods.confirmReceived(product.product.productCount)
          .send({ from: currentAccount });
          console.log("确认收货结果:", result);
        const response = await api.post("/api/products/confirmReceipt", 
          {
            tx_hash: product.tx_hash,
            receipt_tx: result.transactionHash,
          }
        );
        if (response.status === 200) {
          message.success("确认收货成功，商品所有权已在区块链上转移");
          fetchPurchasedProducts(account);
        } else {
          message.error("确认收货失败");
        }
      } catch (error) {
        console.error("确认收货失败:", error);
        message.error("确认收货失败: " + (error.message || "未知错误"));
      } finally {
        setIsLoading(false);
      }
  };

  const renderPurchasedProducts = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <Spin size="large" />
        </LoadingContainer>
      );
    }

    // 添加额外的检查，确保 purchasedProducts 是数组
    if (!Array.isArray(purchasedProducts) || purchasedProducts.length === 0) {
      return <Empty description="暂无已购买商品" />;
    }

    return (
      <ProductGrid>
        {purchasedProducts.map((item) => {
          const product = item.product || item;
          return (
            <ProductCard key={item.id} onClick={() => viewProductDetail(item)}>
              <ProductImage
                src={`http://localhost:8060/assets/uploads/products/${product.photo}`}
                alt={product.name}
              />
              <ProductInfo>
                <ProductName>{product.name}</ProductName>
                <ProductPrice>{product.price} QZK</ProductPrice>
                <ProductMeta>
                  <Tag color="blue">{product.category}</Tag>
                  <Tag color="purple">区块: {product.block_number}</Tag>
                </ProductMeta>
                <ButtonGroup>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      viewTraceability(item);
                    }}
                    icon={<HistoryOutlined />}
                  >
                    溯源
                  </ActionButton>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirmReceipt(item);
                    }}
                    disabled={item.is_received === 1}
                    type="primary"
                    icon={<ShoppingOutlined />}
                  >
                    {item.is_received === 1 ? "已确认" : "确认收货"}
                  </ActionButton>
                </ButtonGroup>
              </ProductInfo>
            </ProductCard>
          );
        })}
      </ProductGrid>
    );
  };

  // 移除了 renderPublishedProducts 函数

  return (
    <Container>
      <LoadingIndicator isOpen={isLoading} message="处理中..." />

      <PageHeader>
        <BlockOutlined style={{ fontSize: 24, marginRight: 8, color: '#1890ff' }} />
        <PageTitle>我的区块链资产</PageTitle>
        <WalletInfo>
          <span>钱包地址: </span>
          <Tooltip title={account}>
            <WalletTag color="green">
              {formatAddress(account)}
              <CopyOutlined
                style={{ marginLeft: 4, cursor: 'pointer' }}
                onClick={(e) => handleCopyAddress(account, e)}
              />
            </WalletTag>
          </Tooltip>
        </WalletInfo>
      </PageHeader>

      {/* 移除了 Tabs 组件，直接显示已购买商品 */}
      <ContentSection>
        <SectionTitle>
          <ShoppingOutlined style={{ marginRight: 8 }} />
          我购买的商品
        </SectionTitle>
        {renderPurchasedProducts()}
      </ContentSection>

      {/* 商品详情模态框 */}
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
          <ProductDetailContent>
            <ProductDetailImage
              src={`http://localhost:8060/assets/uploads/products/${selectedProduct.photo || (selectedProduct.product && selectedProduct.product.photo)}`}
              alt={selectedProduct.name || (selectedProduct.product && selectedProduct.product.name)}
            />

            <ProductDetailInfo>
              <h2>{selectedProduct.name || (selectedProduct.product && selectedProduct.product.name)}</h2>

              <Descriptions bordered column={1}>
                <Descriptions.Item label="价格">
                  {selectedProduct.price || (selectedProduct.product && selectedProduct.product.price)} QZK
                </Descriptions.Item>
                <Descriptions.Item label="类别">
                  {selectedProduct.category || (selectedProduct.product && selectedProduct.product.category)}
                </Descriptions.Item>
                <Descriptions.Item label="品牌">
                  {selectedProduct.brand || (selectedProduct.product && selectedProduct.product.brand)}
                </Descriptions.Item>
                <Descriptions.Item label="描述">
                  {selectedProduct.description || (selectedProduct.product && selectedProduct.product.description)}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {formatDateTime(selectedProduct.created_at || (selectedProduct.product && selectedProduct.product.created_at))}
                </Descriptions.Item>
                {selectedProduct.buyer_address && (
                  <Descriptions.Item label="交易时间">
                    {formatDateTime(selectedProduct.transaction_time)}
                  </Descriptions.Item>
                )}
              </Descriptions>

              <Divider orientation="left">区块链信息</Divider>

              <BlockchainInfo>
                {selectedProduct.seller_address && (
                  <BlockchainInfoItem>
                    <span>卖家地址:</span>
                    <Tooltip title={selectedProduct.seller_address}>
                      <BlockchainTag color="blue" onClick={() => window.open(`https://sepolia.etherscan.io/address/${selectedProduct.seller_address}`, '_blank')}>
                        {formatAddress(selectedProduct.seller_address)}
                        <LinkOutlined style={{ marginLeft: 4 }} />
                      </BlockchainTag>
                    </Tooltip>
                  </BlockchainInfoItem>
                )}

                {selectedProduct.buyer_address && (
                  <BlockchainInfoItem>
                    <span>买家地址:</span>
                    <Tooltip title={selectedProduct.buyer_address}>
                      <BlockchainTag color="green" onClick={() => window.open(`https://sepolia.etherscan.io/address/${selectedProduct.buyer_address}`, '_blank')}>
                        {formatAddress(selectedProduct.buyer_address)}
                        <LinkOutlined style={{ marginLeft: 4 }} />
                      </BlockchainTag>
                    </Tooltip>
                  </BlockchainInfoItem>
                )}

                <BlockchainInfoItem>
                  <span>交易哈希:</span>
                  <Tooltip title={selectedProduct.tx_hash}>
                    <BlockchainTag color="purple" onClick={() => window.open(`https://sepolia.etherscan.io/tx/${selectedProduct.tx_hash}`, '_blank')}>
                      {formatAddress(selectedProduct.tx_hash)}
                      <LinkOutlined style={{ marginLeft: 4 }} />
                    </BlockchainTag>
                  </Tooltip>
                </BlockchainInfoItem>

                <BlockchainInfoItem>
                  <span>区块高度:</span>
                  <Tooltip title={`区块 ${selectedProduct.block_number}`}>
                    <BlockchainTag color="cyan" onClick={() => window.open(`https://sepolia.etherscan.io/block/${selectedProduct.block_number}`, '_blank')}>
                      {selectedProduct.block_number}
                      <LinkOutlined style={{ marginLeft: 4 }} />
                    </BlockchainTag>
                  </Tooltip>
                </BlockchainInfoItem>

                <BlockchainInfoItem>
                  <span>区块哈希:</span>
                  <Tooltip title={selectedProduct.block_hash}>
                    <BlockchainTag color="geekblue" onClick={() => window.open(`https://sepolia.etherscan.io/block/${selectedProduct.block_hash}`, '_blank')}>
                      {formatAddress(selectedProduct.block_hash)}
                      <LinkOutlined style={{ marginLeft: 4 }} />
                    </BlockchainTag>
                  </Tooltip>
                </BlockchainInfoItem>
              </BlockchainInfo>

              <ButtonRow>
                <Button type="primary" onClick={handleCloseModal}>关闭</Button>
                <Button
                  type="default"
                  icon={<HistoryOutlined />}
                  onClick={() => {
                    handleCloseModal();
                    viewTraceability(selectedProduct);
                  }}
                >
                  查看溯源
                </Button>
              </ButtonRow>
            </ProductDetailInfo>
          </ProductDetailContent>
        )}
      </Modal>

      {/* 溯源信息模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <HistoryOutlined style={{ fontSize: '20px', color: '#1890ff', marginRight: '10px' }} />
            <span>区块链溯源信息</span>
          </div>
        }
        open={traceModalVisible}
        onCancel={() => setTraceModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setTraceModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {traceData && (
          <TraceContent>
            <TraceHeader>
              <h3>商品溯源记录</h3>
              <p>创建区块: {traceData.creationBlock}</p>
              <p>创建时间: {formatDateTime(traceData.creationTime)}</p>
              <p>创建者:
                <Tooltip title={traceData.creator}>
                  <BlockchainTag color="blue" onClick={() => window.open(`https://sepolia.etherscan.io/address/${traceData.creator}`, '_blank')}>
                    {formatAddress(traceData.creator)}
                    <LinkOutlined style={{ marginLeft: 4 }} />
                  </BlockchainTag>
                </Tooltip>
              </p>
              {/* 添加链上索引ID显示 */}
              {traceData.transactions[0].productCount && (
                <p>链上商品索引: 
                  <BlockchainTag color="orange" style={{ marginLeft: 8 }}>
                    {traceData.transactions[0].productCount}
                  </BlockchainTag>
                </p>
              )}
            </TraceHeader>

            <TraceTimeline>
              {traceData.transactions.map((tx, index) => (
                <TraceItem key={index}>
                  <TraceItemIcon>
                    {tx.type === '商品发布' ? <BlockOutlined /> : <ShoppingOutlined />}
                  </TraceItemIcon>
                  <TraceItemContent>
                    <TraceItemHeader>
                      <TraceItemType>{tx.type}</TraceItemType>
                      <TraceItemTime>{formatDateTime(tx.time)}</TraceItemTime>
                    </TraceItemHeader>
                    <TraceItemDetail>
                        <span>{tx.type === '商品发布' ? '合约地址:' : '买方地址:'}</span>
                        <Tooltip title={tx.to}>
                          <BlockchainTag color="green" onClick={() => window.open(`https://sepolia.etherscan.io/address/${tx.to}`, '_blank')}>
                            {formatAddress(tx.to)}
                            <LinkOutlined style={{ marginLeft: 4 }} />
                          </BlockchainTag>
                        </Tooltip>
                      </TraceItemDetail>
                    <TraceItemDetails>
                      <TraceItemDetail>
                        <span>{tx.type === '商品发布' ? '卖方地址:' : '卖方地址:'}</span>
                        <Tooltip title={tx.from}>
                          <BlockchainTag color="blue" onClick={() => window.open(`https://sepolia.etherscan.io/address/${tx.from}`, '_blank')}>
                            {formatAddress(tx.from)}
                            <LinkOutlined style={{ marginLeft: 4 }} />
                          </BlockchainTag>
                        </Tooltip>
                      </TraceItemDetail>
                  
                      <TraceItemDetail>
                        <span>交易哈希:</span>
                        <Tooltip title={tx.txHash}>
                          <BlockchainTag color="purple" onClick={() => window.open(`https://sepolia.etherscan.io/tx/${tx.txHash}`, '_blank')}>
                            {formatAddress(tx.txHash)}
                            <LinkOutlined style={{ marginLeft: 4 }} />
                          </BlockchainTag>
                        </Tooltip>
                      </TraceItemDetail>
                      <TraceItemDetail>
                        <span>区块高度:</span>
                        <Tooltip title={`区块 ${tx.blockNumber}`}>
                          <BlockchainTag color="cyan" onClick={() => window.open(`https://sepolia.etherscan.io/block/${tx.blockNumber}`, '_blank')}>
                            {tx.blockNumber}
                            <LinkOutlined style={{ marginLeft: 4 }} />
                          </BlockchainTag>
                        </Tooltip>
                      </TraceItemDetail>
                      {/* 添加价格显示 */}
                      <TraceItemDetail>
                        <span>价格:</span>
                        <BlockchainTag color="red">
                          {tx.price}
                        </BlockchainTag>
                      </TraceItemDetail>
                    </TraceItemDetails>
                  </TraceItemContent>
                </TraceItem>
              ))}
            </TraceTimeline>
          </TraceContent>
        )}
      </Modal>
    </Container>
  );
};

// 样式组件
const Container = styled.div`
  padding: 24px;
  background-color: #f0f2f5;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  color: #1890ff;
`;

const WalletInfo = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
`;

const WalletTag = styled(Tag)`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  font-size: 14px;
`;

// 新增的样式组件，替代原来的Tabs
const ContentSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  font-size: 18px;
  margin-bottom: 20px;
  color: #1890ff;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

// 保留其他样式组件...
const ProductStatus = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  padding: 16px;
`;

const ProductName = styled.h3`
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
`;

const ProductPrice = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #f5222d;
  margin-bottom: 12px;
`;

const ProductMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ActionButton = styled(Button)`
  flex: 1;
  margin: 0 4px;
`;

const ProductDetailContent = styled.div`
  display: flex;
  gap: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ProductDetailImage = styled.img`
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 250px;
  }
`;

const ProductDetailInfo = styled.div`
  flex: 1;
`;

const BlockchainInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const BlockchainInfoItem = styled.div`
  display: flex;
  align-items: center;
  
  span {
    width: 100px;
    color: #666;
  }
`;

const BlockchainTag = styled(Tag)`
  cursor: pointer;
  display: inline-flex;
  align-items: center;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const TraceContent = styled.div`
  padding: 16px 0;
`;

const TraceHeader = styled.div`
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  
  h3 {
    margin-top: 0;
    color: #1890ff;
  }
`;

const TraceTimeline = styled.div`
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 16px;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #f0f0f0;
  }
`;

const TraceItem = styled.div`
  display: flex;
  margin-bottom: 24px;
  position: relative;
`;

const TraceItemIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  z-index: 1;
`;

const TraceItemContent = styled.div`
  flex: 1;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
`;

const TraceItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const TraceItemType = styled.span`
  font-weight: bold;
  color: #1890ff;
`;

const TraceItemTime = styled.span`
  color: #888;
`;

const TraceItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TraceItemDetail = styled.div`
  display: flex;
  align-items: center;
  
  span {
    width: 80px;
    color: #666;
  }
`;

export default Possessed;