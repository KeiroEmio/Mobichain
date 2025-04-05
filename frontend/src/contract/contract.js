import Web3 from 'web3';
import TokenABI from '../abi/remix/token.json';
import TransactionABI from '../abi/remix/secondHandMarket.json';
import deployedAddresses from '../address/deployedAddresses.json';

class ContractInstance {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.tokenContract = null;
        this.transactionContract = null;
    }

    async init() {
        if (window.ethereum) {
            try {
                const provider = window.ethereum;
                this.web3 = new Web3(provider);
                
                // 确保连接到 Sepolia 测试网
                const networkId = await this.web3.eth.net.getId();
                if (networkId !== 11155111) { 
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
                    });
                }

                // 请求用户授权
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await this.web3.eth.getAccounts();
                this.account = accounts[0];

                // 初始化代币合约
                this.tokenContract = new this.web3.eth.Contract(
                    TokenABI,
                    deployedAddresses.Token
                );

                // 初始化交易合约
                this.transactionContract = new this.web3.eth.Contract(
                    TransactionABI,
                    deployedAddresses.Transaction
                );

                return true;
            } catch (error) {
                console.error('合约初始化失败:', error);
                throw new Error('合约初始化失败');
            }
        } else {
            throw new Error('请安装MetaMask');
        }
    }

    getWeb3() {
        return this.web3;
    }

    getAccount() {
        return this.account;
    }

    getTokenContract() {
        return this.tokenContract;
    }

    getTransactionContract() {
        return this.transactionContract;
    }

    // 监听账户变化
    listenAccountChange(callback) {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                this.account = accounts[0];
                if (callback) callback(accounts[0]);
            });
        }
    }

    // 监听网络变化
    listenNetworkChange(callback) {
        if (window.ethereum) {
            window.ethereum.on('chainChanged', (chainId) => {
                if (callback) callback(chainId);
            });
        }
    }
}

// 创建单例实例
const contractInstance = new ContractInstance();

export default contractInstance;