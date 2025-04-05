import React, { useState, useEffect } from 'react';
import { Card, Input, Button, message, Statistic, Row, Col, Table, Tabs } from 'antd';
import { WalletOutlined, SwapOutlined, FireOutlined, CrownOutlined } from '@ant-design/icons';
import Web3 from 'web3';
import TokenABI from '../../abi/MarketToken.sol/MarketToken.json';
import deployedAddresses from '../../address/deployedAddresses.json';
import LoadingIndicator from '../Helper/Waiting';

const { TabPane } = Tabs;

const TokenManagement = () => {
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState('');
    const [queryAddress, setQueryAddress] = useState('');
    const [queryBalance, setQueryBalance] = useState('0');
    const [tokenInfo, setTokenInfo] = useState({
        totalSupply: '0',
        balance: '0',
        name: '',
        symbol: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [transferForm, setTransferForm] = useState({
        to: '',
        amount: ''
    });

    const [approveForm, setApproveForm] = useState({
        spender: '',
        amount: ''
    });

    const handleQueryBalance = async () => {
        setIsLoading(true);
        try {
            const balance = await contract.methods.balanceOf(queryAddress).call();
            // 只更新查询结果，不影响顶部显示的当前账户余额
            setQueryBalance(web3.utils.fromWei(balance, 'ether'));
            message.success('查询成功');
        } catch (error) {
            message.error('查询失败');
            setQueryBalance('0');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const accounts = await web3Instance.eth.getAccounts();
                    setAccount(accounts[0]);
                    setWeb3(web3Instance);

                    const contractAddress = deployedAddresses.Token;
                    const tokenContract = new web3Instance.eth.Contract(
                        TokenABI.abi,
                        contractAddress
                    );
                    setContract(tokenContract);

                    // 获取代币信息和当前账户余额
                    const name = await tokenContract.methods.name().call();
                    const symbol = await tokenContract.methods.symbol().call();
                    const totalSupply = await tokenContract.methods.totalSupply().call();
                    const balance = await tokenContract.methods.balanceOf(accounts[0]).call();

                    setTokenInfo({
                        name,
                        symbol,
                        totalSupply: web3Instance.utils.fromWei(totalSupply, 'ether'),
                        balance: web3Instance.utils.fromWei(balance, 'ether')
                    });
                } catch (error) {
                    message.error('连接钱包失败');
                }
            } else {
                message.error('请安装MetaMask');
            }
        };

        init();
    }, []);

    const handleTransfer = async () => {
        try {
            setIsLoading(true);
            const { to, amount } = transferForm;
            const amountWei = web3.utils.toWei(amount, 'ether');
            await contract.methods.transfer(to, amountWei).send({ from: account });
            message.success('转账成功');
        } catch (error) {
            message.error('转账失败');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            setIsLoading(true);
            const { spender, amount } = approveForm;
            const amountWei = web3.utils.toWei(amount, 'ether');
            await contract.methods.approve(spender, amountWei).send({ from: account });
            message.success('授权成功');
        } catch (error) {
            message.error('授权失败');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <LoadingIndicator isOpen={isLoading} message="处理中..." />
            <Card title="代币管理面板" bordered={false}>
                <Row gutter={16}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="代币名称"
                                value={tokenInfo.name}
                                prefix={<CrownOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="代币符号"
                                value={tokenInfo.symbol}
                                prefix={<WalletOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="总供应量"
                                value={tokenInfo.totalSupply}
                                prefix={<FireOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="当前余额"
                                value={tokenInfo.balance}
                                prefix={<SwapOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                <Tabs defaultActiveKey="1" style={{ marginTop: '24px' }}>
                    <TabPane tab="转账" key="1">
                        <Card>
                            <Input
                                placeholder="接收地址"
                                style={{ marginBottom: '16px' }}
                                onChange={(e) => setTransferForm({ ...transferForm, to: e.target.value })}
                            />
                            <Input
                                placeholder="转账金额"
                                style={{ marginBottom: '16px' }}
                                onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                            />
                            <Button type="primary" onClick={handleTransfer} block>
                                确认转账
                            </Button>
                        </Card>
                    </TabPane>
                    <TabPane tab="授权" key="2">
                        <Card>
                            <Input
                                placeholder="授权地址"
                                style={{ marginBottom: '16px' }}
                                onChange={(e) => setApproveForm({ ...approveForm, spender: e.target.value })}
                            />
                            <Input
                                placeholder="授权金额"
                                style={{ marginBottom: '16px' }}
                                onChange={(e) => setApproveForm({ ...approveForm, amount: e.target.value })}
                            />
                            <Button type="primary" onClick={handleApprove} block>
                                确认授权
                            </Button>
                        </Card>
                    </TabPane>
                    <TabPane tab="余额查询" key="3">
                        <Card>
                            <Input
                                placeholder="输入要查询的地址"
                                style={{ marginBottom: '16px' }}
                                onChange={(e) => setQueryAddress(e.target.value)}
                            />
                            <Button type="primary" onClick={handleQueryBalance} block style={{ marginBottom: '16px' }}>
                                查询余额
                            </Button>
                            <Statistic
                                title="查询地址余额"
                                value={queryBalance}
                                prefix={<WalletOutlined />}
                                suffix="QZK"
                            />
                        </Card>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default TokenManagement;