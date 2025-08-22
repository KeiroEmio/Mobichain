import React, { useState, useEffect, useRef } from 'react';
import { Table, Input, Pagination } from 'antd';
import useApi from '../../Hooks/useApi';
import usePagination from '../../Hooks/usePagination';

const AndroidList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    // const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    // const [totalRecords, setTotalRecords] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const api = useApi();

    const {
        currentPage,
        totalRecords,
        pageSize,
        setTotalRecords,
        handlePageChange,
    } = usePagination(10);

    useEffect(() => {
        fetchData();
    }, [currentPage, searchTerm]);

     const fetchData = async () => {
        setLoading(true);
        try {
            const queryString = `search=${encodeURIComponent(searchTerm)}&page=${currentPage}&limit=${pageSize}`;
            const response = await api.get(`/api/android/get?${queryString}`);
            setData(response.data.data);
            setTotalRecords(response.data.totalRecords);
        } catch (error) {
            console.error('Error fetching Android records:', error);
        } finally {
            setLoading(false);
        }
    };


    const columns = [
        {
            title: '图片',
            dataIndex: 'imagePath',
            key: 'imagePath',
            render: (text, record) => {
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
                pageSize={pageSize}
                onChange={handlePageChange}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            />
        </div>
    );
};

export default AndroidList;
