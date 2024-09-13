import React, { useState, useEffect, useRef } from 'react';
import { Table, Input, Pagination } from 'antd';
import useApi from '../../Hooks/useApi';

const AndroidList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const api = useApi();

    useEffect(() => {
        fetchData();
    }, [currentPage, searchTerm]);

    const fetchData = async () => {
        setLoading(true);
        console.log('searchTerm:', searchTerm)
        try {
            const queryString = `search=${encodeURIComponent(searchTerm)}&page=${currentPage}&limit=10`;
            const response = await api.get(`/api/android/get?${queryString}`);
            setData(response.data.data);
            console.log('response.data.data:', response.data.data)
            setTotalRecords(response.data.totalRecords);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching Android records:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = value => {
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page for new search
    };

    const handlePageChange = page => {
        console.log('page:', page)
        // setSearchTerm('')
        setCurrentPage(page);
    };

    const columns = [
        {
            title: '图片',
            dataIndex: 'imagePath',
            key: 'imagePath',
            render: (text, record) => {
                // 打印每条记录的 imagePath
                console.log(`imagePath for ${record.brand}:`, record.imagePath);
                // 返回渲染的图片元素
                return (
                    <img src={`/asserts/images/${record.imagePath}`} alt="Product" style={{ height: '200px', objectFit: 'cover' }} />
                );
            }
        },
        { title: '品牌', dataIndex: 'brand', key: 'brand' },
        { title: '模型', dataIndex: 'model', key: 'model' },
        { title: '价格', dataIndex: 'price', key: 'price' },
        { title: '卖家', dataIndex: 'owner', key: 'owner' },
        { title: '上架时间', dataIndex: 'createdAt', key: 'createdAt' },
    ];


    return (
        <div>
            <Input.Search
                placeholder="搜索关于手机内容..."
                onSearch={handleSearch}
                style={{ margin: '0 0 20px 0', width: 300 }}
                enterButton
            />
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={false}
            />
            <Pagination
                current={currentPage}
                total={totalRecords}
                onChange={handlePageChange}
                pageSize={10}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            />
        </div>
    );
};

export default AndroidList;
