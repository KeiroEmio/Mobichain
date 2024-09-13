import React, { useEffect, useState } from 'react';
import { Table, Button, Pagination, message, Menu, Dropdown, Input, Modal, Form, InputNumber } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import useApi from '../../Hooks/useApi'; // Assuming useApi is your custom hook for API calls
import TokenModal from './TokenModal';
import Decimal from 'decimal.js'

const UserList = () => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isTokenModalVisible, setIsTokenModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const api = useApi();

    useEffect(() => {
        fetchUsers();
    }, [page, rowsPerPage, searchTerm]);

    const fetchUsers = async () => {
        try {
            const queryString = `search=${encodeURIComponent(searchTerm)}&page=${page}&limit=${rowsPerPage}`;
            const response = await api.get(`/api/user/get?${queryString}`);
            setData(response.data.data);
            setTotalRecords(response.data.totalRecords);
        } catch (error) {
            message.error('Failed to fetch users: ' + error.message);
        }
    };

    const handleSearch = value => {
        setSearchTerm(value);
        setPage(1);
    };

    const handleToken = (record) => {
        console.log('usss:', record)
        setSelectedUser(record);
        setIsTokenModalVisible(true);
    };

    const updateTokens = (newTokens) => {
        console.log('newTokens:', newTokens); // This should log the token change
        const newData = data.map(item =>
            item.id === selectedUser.id ? { ...item, token: Decimal(item.token).plus(new Decimal(newTokens)).toNumber() } : item
        );
        setData(newData);
        console.log('Data updated with new tokens:', newData); // This should show the updated data
    };

    const renderActionsMenu = (record) => (
        <Dropdown
            overlay={
                <Menu>
                    <Menu.Item key="add" onClick={() => handleToken(record)}>充值或减少token</Menu.Item>
                    <Menu.Item key="delete">删除</Menu.Item>
                </Menu>
            }
            trigger={['click']}
        >
            <Button icon={<MoreOutlined />} />
        </Dropdown>
    );

    const columns = [
        { title: '用户id', dataIndex: 'id', key: 'id', sorter: true },
        { title: '邮箱', dataIndex: 'email', key: 'email', sorter: true },
        { title: '地址', dataIndex: 'address', key: 'address' },
        { title: '创建时间', dataIndex: 'emailVerifiedAt', key: 'emailVerifiedAt' },
        { title: 'token', dataIndex: 'token', key: 'token' },
        { title: '操作', key: 'actions', render: (text, record) => renderActionsMenu(record) }
    ];

    return (
        <>
            <Input.Search
                placeholder="搜索用户..."
                onSearch={handleSearch}
                style={{ margin: '0 0 20px 0', width: 300 }}
                enterButton
            />
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                pagination={false}
            />
            <Pagination
                current={page}
                total={totalRecords}
                pageSize={rowsPerPage}
                onChange={newPage => setPage(newPage)}
                onShowSizeChange={(current, size) => setRowsPerPage(size)}
                showTotal={total => `Total ${total} items`}
            />
            <TokenModal
                visible={isTokenModalVisible}
                onClose={() => setIsTokenModalVisible(false)}
                onTokenChange={updateTokens}
                initialTokens={selectedUser ? selectedUser.token : 0}
                selectedUser={selectedUser}
            />
        </>
    );
};

export default UserList;
