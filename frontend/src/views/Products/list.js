import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Spin, Select, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import useApi from '../../Hooks/useApi';
import useAuth from '../../Hooks/useAuth';
import useSearch from '../../Hooks/useSearch';

const { Search } = Input;
const { Option } = Select;

const ProductList = () => {
    const navigate = useNavigate();
    const api = useApi();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const { filters, handleFilterChange, resetFilters } = useSearch();
    const searchInputRef = useRef(null);
    const [reload, setReload] = useState(false);
    useEffect(() => {
        loadProducts();
    }, [reload]);

    const loadProducts = async () => {
        try {
            const address = JSON.parse(localStorage.getItem("userData")).address;
            setLoading(true);
            const response = await api.get(`/api/products/list?address=${address}`);
            if (response && response.data) {

                const productData = response.data.data.rows || [];
                setProducts(productData);
                setAllProducts(productData);

                // 提取所有品牌和类别
                const uniqueBrands = [...new Set(productData.map(item => item.brand).filter(Boolean))];
                const uniqueCategories = [...new Set(productData.map(item => item.category).filter(Boolean))];

                setBrands(uniqueBrands);
                setCategories(uniqueCategories);
            }
        } catch (error) {
            console.error('加载商品失败:', error);
            setProducts([]);
            setAllProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = (item) => {
        navigate(`/user/products/view/${item.id}`, { state: { rowData: item } });
    };

    const handleSearchClick = async () => {
        const searchValue = searchInputRef.current.input.value;

        await handleFilterChange('searchTerm', searchValue);

        const address = JSON.parse(localStorage.getItem("userData")).address;
        let queryParams = `address=${address}`;

        if (searchValue) queryParams += `&search=${searchValue}`;

        try {
            setLoading(true);
            const response = await api.get(`/api/products/list?${queryParams}`);

            if (response && response.data) {
                const productData = response.data.data.rows || [];
                setProducts(productData);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('搜索商品失败:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setReload(!reload);
    };

    const SearchAndFilter = () => (
        <div style={{ marginBottom: 16 }}>
            <Input
                ref={searchInputRef}
                placeholder="请输入搜索关键词"
                style={{ width: 400, marginRight: 16 }}
                onPressEnter={handleSearchClick}
                allowClear
            />

            <Button type="primary" onClick={handleSearchClick} style={{ marginRight: 8 }}>
                搜索
            </Button>

            <Button onClick={handleReset}>
                重置
            </Button>
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
                                    description={`${item.price} QZK | ${item.brand || '无品牌'} | ${item.category || '无类别'}`}
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