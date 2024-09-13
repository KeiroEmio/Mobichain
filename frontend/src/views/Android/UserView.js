import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Row, Col, message, Spin, Tabs, Input, Select } from 'antd';
import { AppleOutlined, AndroidOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useApi from '../../Hooks/useApi';

const ItemsGrid = () => {
    const { Search } = Input;
    const { Option } = Select;
    const navigate = useNavigate();
    const [androidItems, setAndroidItems] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    // 添加新状态来存储 iPhone 数据
    const [appleItems, setAppleItems] = useState([]);
    const [applePage, setApplePage] = useState(1);
    const [appleLoading, setAppleLoading] = useState(false);
    const [appleHasMore, setAppleHasMore] = useState(true);
    const [brands, setBrands] = useState([]);
    const [filters, setFilters] = useState({
        searchTerm: '',
        priceRange: '',
        brand: ''
    });
    const [currentKey, setCurrentKey] = useState('1');

    const api = useApi();
    const handSubmitAndroidApi = '/api/android/search'
    const handSubmitIphoneApi = '/api/iphone/search'

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                let url = currentKey === '1' ? '/api/iphone/brands' : '/api/android/brands';
                const response = await api.post(url);
                setBrands(response.data.brands);
                console.log(`${currentKey === '1' ? 'iPhone' : 'Android'} brands response:`, response);
            } catch (error) {
                console.error('请求brands错误:', error);
                message.error('获取品牌信息失败');
            }
        };
        fetchBrands();
    }, []);

    //Android全部请求
    const loadAndroidItems = () => {
        if (loading || !hasMore) return;

        setLoading(true);
        api.get(`/api/android`)
            .then(response => {
                setPage(prevPage => prevPage + 1);
                if (response.data.records.length === 0) {
                    setHasMore(false);
                } else {
                    console.log('androidResponse:', response)
                    setAndroidItems(prevItems => {
                        const ids = new Set(prevItems.map(i => i.id));
                        const newItems = response.data.records.filter(i => !ids.has(i.id));

                        return [...prevItems, ...newItems];
                    });
                }
            })
            .catch(error => {
                message.error(`Error fetching items: ${error.message}`);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    //Apple全部搜索请求
    const loadAppleItems = useCallback(() => {
        if (appleLoading || !appleHasMore) return;

        setAppleLoading(true);
        api.get(`/api/iphone`)
            .then(response => {
                setApplePage(prevPage => prevPage + 1);
                if (response.data.records.length === 0) {
                    setAppleHasMore(false);
                } else {
                    setAppleItems(prevItems => {
                        const ids = new Set(prevItems.map(i => i.id));
                        const newItems = response.data.records.filter(i => !ids.has(i.id));
                        return [...prevItems, ...newItems];
                    });
                }
            })
            .catch(error => {
                message.error(`Error fetching Apple items: ${error.message}`);
            })
            .finally(() => {
                setAppleLoading(false);
            });
    });

    useEffect(() => {
        loadAppleItems();
        loadAndroidItems();
    }, []);

    const handleClick = rowData => {
        try {
            console.log('rowData:', rowData, currentKey);
            navigate(`/user/android/view/${rowData.id}`, { state: { rowData, currentKey } });
        } catch {
            console.error('导入错误')
        }

    };

    const prepareFiltersForRequest = () => {
        let { searchTerm, priceRange, brand } = filters;

        // 确保 searchTerm 如果为空，设置为 null
        if (!searchTerm) {
            searchTerm = null;
        }

        // 创建请求的 filters 对象
        return {
            searchTerm,
            priceRange,
            brand
        };
    }
    const handleFilterChange = (key, value) => {
        // 更新过滤器状态
        setFilters(prevFilters => ({
            ...prevFilters,
            [key]: value
        }));
    };

    const handSubmit = async () => {
        console.log('filters:', filters);
        console.log('currentKey:', currentKey);
        const requestFilters = prepareFiltersForRequest();
        let response;

        if (currentKey === '1') {  // Apple设备
            console.log('Sending Filters:', requestFilters);
            response = await api.post(handSubmitIphoneApi, requestFilters);
            if (response && response.status === 200) {
                setAppleItems(response.data.data);
                console.log('Apple Items Updated:', response.data.data);
            }
        } else if (currentKey === '2') {  // Android设备
            console.log('Sending Filters:', requestFilters);
            response = await api.post(handSubmitAndroidApi, requestFilters);
            if (response && response.status === 200) {
                setAndroidItems(response.data.records);
                console.log('data:', response.data)
                console.log('Android Items Updated:', response.data.records);
            }
        }

        if (response && response.status === 200) {
            console.log('Success:', response.data.data);
        } else {
            console.error('Error submitting data');
        }
    };

    const handleTabChange = async (activeKey) => {
        setCurrentKey(activeKey);
        try {
            let response;
            if (activeKey === '1') {
                response = await api.post('/api/iphone/brands');
                setBrands(response.data.brands);
                console.log('iPhone brands response:', response);
            } else if (activeKey === '2') {
                response = await api.post('/api/android/brands');
                setBrands(response.data.brands);
                console.log('Android brands response:', response);
                console.log('brands', brands)
            }
        } catch (error) {
            console.error('请求brands错误:', error);
        }
    };



    const SearchAndFilter = () => (
        <div style={{ marginBottom: 16 }}>
            <Select value={filters.priceRange} style={{ width: 180, marginRight: 16 }} onChange={value => handleFilterChange('priceRange', value)}>
                <Option value="">所有价格</Option>
                <Option value="0~199">0 ~ 199</Option>
                <Option value="200~499">200 ~ 499</Option>
                <Option value="500~999">500 ~ 999</Option>
                <Option value="1000~10000">1000 以上</Option>
            </Select>
            <Select
                value={filters.brand}
                style={{ width: 180 }}
                onChange={value => handleFilterChange('brand', value)}
            >
                <Option value="">所有品牌</Option>
                {brands.map((brand, index) => (
                    <Option key={index} value={brand}>{brand}</Option>
                ))}
            </Select>
            <Search
                value={filters.searchTerm}
                placeholder="请输入搜索关键词"
                onSearch={handSubmit} // 使用onSearch属性触发handSubmit
                onChange={e => handleFilterChange('searchTerm', e.target.value)}
                style={{ width: 200, marginRight: 16 }}
            />
        </div>
    );

    return (
        <Tabs defaultActiveKey="1" onChange={handleTabChange} items={[
            {
                key: '1',
                label: <span><AppleOutlined /> Apple</span>,
                children: (
                    <>
                        <SearchAndFilter />
                        <Row gutter={[16, 16]} style={{ margin: 0, maxHeight: 'calc(80vh - 100px)', overflowY: 'auto' }}>
                            {appleItems.map((item, index) => (
                                <Col key={item.id} span={6} onClick={() => handleClick(item)} style={{ marginBottom: 16 }}>
                                    <Card
                                        hoverable
                                        style={{ width: '100%' }}
                                        cover={<img alt={item.model} src={`/asserts/images/${item.imagepath}`} style={{ height: '200px', objectFit: 'cover' }} />}
                                    >
                                        <Card.Meta
                                            title={`${item.brand} | ${item.model}`}
                                            description={`${item.price} ${item.owner}`}
                                            style={{ textAlign: 'center' }}
                                        />
                                    </Card>
                                </Col>
                            ))}
                            {appleLoading && (
                                <Col span={24} style={{ textAlign: 'center' }}>
                                    <Spin size="large" />
                                </Col>
                            )}
                        </Row>
                    </>
                )

            },
            {
                key: '2',
                label: <span><AndroidOutlined /> Android</span>,
                children: (
                    <>
                        <SearchAndFilter />
                        <Row gutter={[16, 16]} style={{ margin: 0, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                            {androidItems.map((item, index) => (
                                <Col key={item.id} span={6} onClick={() => handleClick(item)} style={{ marginBottom: 16 }}>
                                    <Card
                                        hoverable
                                        style={{ width: '100%' }}
                                        cover={<img alt={item.model} src={`/asserts/images/${item.imagePath}`} style={{ height: '200px', objectFit: 'cover' }} />}
                                    >
                                        <Card.Meta
                                            title={`${item.brand} | ${item.model}`}
                                            description={`${item.price} ${item.owner}`}
                                            style={{ textAlign: 'center' }}
                                        />
                                    </Card>
                                </Col>
                            ))}
                            {loading && (
                                <Col span={24} style={{ textAlign: 'center' }}>
                                    <Spin size="large" />
                                </Col>
                            )}
                        </Row>
                    </>
                )
            }
        ]} />
    );
};

export default ItemsGrid;
