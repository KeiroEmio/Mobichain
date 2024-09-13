import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingIndicator from '../Helper/Waiting';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography'
import useApi from '../../Hooks/useApi';

const SearchComponent = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [transactionData, setTransactionData] = useState(null);
    const [logs, setLogs] = useState([]);
    const [openLogsDialog, setOpenLogsDialog] = useState(false);
    const api = new useApi();
    const url_getAxias = '/api/postEtherscanData/post';
    const [showErrorDialog, setShowErrorDialog] = useState(false);

    const handleSearch = () => {
        setIsLoading(true);
        const reqParameter = {
            parameter: `${searchTerm}`
        };
        api.post(url_getAxias, reqParameter)
            .then(response => {
                setTransactionData(response.data.transaction);
                if (response.data.logs && Array.isArray(response.data.logs)) {
                    const filteredLogs = response.data.logs.map(log => ({
                        transactionId: log.transactionId || log[0],
                        phoneId: log.phoneId || log[1],
                        buyerId: log.buyerId || log[2],
                        sellerId: log.sellerId || log[3],
                        deviceType: log.deviceType || log[4],
                        brand: log.brand || log[5],
                        model: log.model || log[6],
                        transactionAmount: log.transactionAmount || log[7],
                        transactionTime: log.transactionTime || log[8]
                    }));
                    setLogs(filteredLogs);
                } else {
                    setLogs([]);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                if (error.response && error.response.status === 500) {
                    setShowErrorDialog(true); // 设置显示错误对话框
                }
                setLogs([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Box sx={{ padding: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={10}>
                    <TextField
                        label="Enter Hash/Block"
                        variant="outlined"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={2}>
                    <Button variant="contained" onClick={handleSearch} disabled={isLoading}>
                        链上搜索
                    </Button>
                </Grid>
            </Grid>
            <LoadingIndicator isOpen={isLoading} message="正在查询链上信息..." />
            <Grid container spacing={2} sx={{ marginTop: 2 }}>
                <Grid item xs={6}>
                    <Button
                        variant="contained"
                        onClick={() => setOpenLogsDialog(true)}
                        disabled={isLoading || logs.length === 0}
                        sx={{
                            backgroundColor: '#9c27b0', // 修改按钮颜色
                            color: '#fff', // 设置字体颜色为白色
                            marginRight: '5px' // 右侧间距5px
                        }}
                    >
                        交易事件
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    <Button
                        variant="contained"
                        href={`https://sepolia.etherscan.io/tx/${searchTerm}`}
                        target="_blank"
                        disabled={isLoading || logs.length === 0}
                        sx={{
                            backgroundColor: '#607d8b', // 修改按钮颜色
                            color: '#fff', // 设置字体颜色为白色
                            marginLeft: '-400px' // 左侧负边距为10px, 将按钮向左移动
                        }}
                    >
                        链上链接
                    </Button>
                </Grid>
            </Grid>

            <Dialog open={openLogsDialog} onClose={() => setOpenLogsDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Logs Details</DialogTitle>
                <DialogContent>
                    {logs.map((log, index) => (
                        <Box key={index} sx={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                            {Object.entries(log).map(([key, value]) => (
                                <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                                    <strong style={{ marginRight: '5px', flexShrink: 0 }}>{key}:</strong>
                                    <span style={{ textAlign: 'center', flex: 1 }}>{value}</span>
                                </Box>
                            ))}
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLogsDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
            {transactionData && (
                <Box sx={{ marginTop: 2, width: '100%', textAlign: 'center', backgroundColor: '#e0f7fa', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', padding: 2 }}>
                    <h2>Transaction Details:</h2>
                    {Object.entries(transactionData).map(([key, value]) => (
                        <Box key={key} sx={{ padding: '10px', borderBottom: '1px solid #bbb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                                <strong style={{ marginRight: '5px', flexShrink: 0 }}>{key}:</strong>
                                <span style={{ textAlign: 'center', flex: 1 }}>{value}</span>
                            </div>
                        </Box>
                    ))}
                </Box>
            )}
            <Dialog open={showErrorDialog} onClose={() => setShowErrorDialog(false)}>
                <DialogTitle>错误提示</DialogTitle>
                <DialogContent>
                    <Typography>哈希未匹配，请检查自己的哈希~</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowErrorDialog(false)}>关闭</Button>
                </DialogActions>
            </Dialog>
        </Box>

    );

};

export default SearchComponent;
