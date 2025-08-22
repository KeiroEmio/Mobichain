import React from 'react';
import { Tabs } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import ProductList from '../Products/list';

const ItemsGrid = () => {
    const handleTabChange = (activeKey) => {
        console.log('当前选中的tab:', activeKey);
    };

    return (
        <Tabs 
            defaultActiveKey="1" 
            onChange={handleTabChange} 
            items={[
                {
                    key: '1',
                    label: <span><ShoppingOutlined /> 二手商品</span>,
                    children: <ProductList />
                }
            ]} 
        />
    );
};

export default ItemsGrid;