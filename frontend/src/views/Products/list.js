import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Select, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import useApi from '../../Hooks/useApi';
import useAuth from '../../Hooks/useAuth';

const { Search } = Input;
const { Option } = Select;

const ProductList = () => {
    const navigate = useNavigate();
    const api = useApi();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const auth = useAuth();
    const [filters, setFilters] = useState({
        searchTerm: '',
        priceRange: '',
        brand: ''
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const address = JSON.parse(localStorage.getItem("userData")).address;
            setLoading(true);
            const response = await api.get(`/api/products/list?address=${address}`);            if (response && response.data) {
                // console.log('加载的商品数据:', response.data.data);
                const productData = response.data.data.rows || [];
                setProducts(productData);

            }
        } catch (error) {
            console.error('加载商品失败:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = (item) => {
        navigate(`/user/products/view/${item.id}`, { state: { rowData: item } });
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSearch = async () => {
        console.log('搜索条件:', filters);
    };

    const SearchAndFilter = () => (
        <div style={{ marginBottom: 16 }}>
            <Select 
                value={filters.priceRange} 
                style={{ width: 180, marginRight: 16 }} 
                onChange={value => handleFilterChange('priceRange', value)}
            >
                <Option value="">所有价格</Option>
                <Option value="0~199">0 ~ 199</Option>
                <Option value="200~499">200 ~ 499</Option>
                <Option value="500~999">500 ~ 999</Option>
                <Option value="1000~10000">1000 以上</Option>
            </Select>
            <Search
                value={filters.searchTerm}
                placeholder="请输入搜索关键词"
                onSearch={handleSearch}
                onChange={e => handleFilterChange('searchTerm', e.target.value)}
                style={{ width: 200, marginRight: 16 }}
            />
        </div>
    );

    return (
        <>
            <SearchAndFilter />
            <Row gutter={[16, 16]} style={{ margin: 0, maxHeight: 'calc(80vh - 100px)', overflowY: 'auto' }}>
                {products && products.length > 0 ? (
                    products.map((item) => (
                        <Col key={item.id} span={6} onClick={() => handleClick(item)} style={{ marginBottom: 16 }}>
                            <Card
                                hoverable
                                style={{ width: '100%' }}
                                cover={
                                <img alt={item.name} 
                                src={`http://localhost:8060/assets/uploads/products/${item.photo}`}
                                style={{ height: '200px', objectFit: 'cover' }} />}
                            >
                                <Card.Meta
                                    title={`${item.name}`}
                                    description={`${item.price} ETH | ${item.brand}`}
                                    style={{ textAlign: 'center' }}
                                />
                            </Card>
                        </Col>
                    ))
                ) : (
                    !loading && (
                        <Col span={24} style={{ textAlign: 'center' }}>
                            暂无商品数据
                        </Col>
                    )
                )}
                {loading && (
                    <Col span={24} style={{ textAlign: 'center' }}>
                        <Spin size="large" />
                    </Col>
                )}
            </Row>
        </>
    );
};

export default ProductList;