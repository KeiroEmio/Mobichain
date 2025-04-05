import React from 'react';
import styled from 'styled-components';
import { Card, Typography, Tag } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const ProductMessage = ({ productInfo, onClick }) => {
  if (!productInfo) return null;

  return (
    <ProductCard onClick={onClick}>
      <ProductImage 
        src={`http://localhost:8060/assets/uploads/products/${productInfo.photo}`} 
        alt={productInfo.name} 
      />
      <ProductInfo>
        <Title level={5}>{productInfo.name}</Title>
        <PriceTag color="red">{productInfo.price} QZK</PriceTag>
        <Text type="secondary">{productInfo.description?.substring(0, 50)}...</Text>
      </ProductInfo>
      <ShoppingOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
    </ProductCard>
  );
};

const ProductCard = styled(Card)`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-radius: 8px;
  margin: 5px 0;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
`;

const ProductInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const PriceTag = styled(Tag)`
  align-self: flex-start;
  margin: 5px 0;
`;

export default ProductMessage;