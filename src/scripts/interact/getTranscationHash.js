const Web3 = require('web3');

// 配置Web3实例
const web3 = new Web3('https://sepolia.infura.io/v3/016a451a08ec48d9b12facd9e0f418b1'); // 确保这是正确的URL

const transactionHash = '0x6B8ECD51CC81AD54D69Aa0504fa1b78Fd73F62fC';

// 异步函数来获取交易详情
const getTransactionDetails = async (hash) => {
    try {
        const transaction = await web3.eth.getTransaction(hash);
        console.log('Transaction Details:', transaction);
    } catch (error) {
        console.error('Error fetching transaction:', error);
    }
};

// 调用函数
getTransactionDetails(transactionHash);