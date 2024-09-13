import React, { useEffect, useState } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TableSortLabel, TextField, Button } from '@mui/material';
import useApi from '../../Hooks/useApi';

const TransactionsUI = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [orderDirection, setOrderDirection] = useState('desc');  // Default sorting order for "Created At"
    const [orderBy, setOrderBy] = useState('created_at');  // Default sorting column
    const [searchTerm, setSearchTerm] = useState('');  // State for the search input

    const api = useApi();

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/transaction/transactions?page=${page + 1}&limit=${rowsPerPage}&sortBy=${orderBy}&sortOrder=${orderDirection}&search=${searchTerm}`);
            setTransactions(response.data.transactions);
            setTotalRecords(response.data.totalRecords);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page, rowsPerPage, orderDirection, searchTerm]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRequestSort = () => {
        const isAsc = orderDirection === 'asc';
        setOrderDirection(isAsc ? 'desc' : 'asc');
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = async () => {
        setLoading(true); // Set loading to true to indicate loading state
        try {
            // Assuming 'searchTerm' is already updated in state from an input field
            const response = await api.get(`/api/transaction/transactions?page=1&limit=${rowsPerPage}&sortBy=${orderBy}&sortOrder=${orderDirection}&search=${searchTerm}`);
            setTransactions(response.data.transactions);
            setTotalRecords(response.data.totalRecords);
            setPage(0); // Reset to the first page after search
            setLoading(false); // Set loading to false after fetching data
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            setLoading(false); // Ensure loading is false on error
        }
    };

    return (
        <>
            <Typography variant="h4" gutterBottom>
                交易记录
            </Typography>
            <TextField
                label="Search"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                style={{ marginBottom: 20, marginRight: 10 }}
            />
            <Button variant="contained" color="primary" onClick={handleSearch}>
                搜索
            </Button>
            <Paper>
                <TableContainer>
                    <Table stickyHeader aria-label="transactions table">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Android ID / iPhone ID</TableCell>
                                <TableCell>Transaction Hash</TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={true}
                                        direction={orderDirection}
                                        onClick={handleRequestSort}
                                    >
                                        Created At
                                    </TableSortLabel>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>{transaction.id}</TableCell>
                                    <TableCell>{transaction.android_id || transaction.iphone_id}</TableCell>
                                    <TableCell>{transaction.tx_hash}</TableCell>
                                    <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={totalRecords}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 25, 100]}
                />
            </Paper>
        </>
    );
};

export default TransactionsUI;
