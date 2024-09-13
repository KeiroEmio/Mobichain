// 引入 ethers 库
const { ethers } = require('ethers');
const myTokenAbi = require('../../abi/MyTokenAbi.json');
require('dotenv').config();  // 确保能够读取 .env 文件中的环境变量

// 设置提供者为 Sepolia 网络
const provider = new ethers.providers.JsonRpcProvider(process.env.SPEOLIA_URL);

// 创建一个新的钱包实例，并连接到提供者
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// 从deployedAddresses.json文件获取合约地址
const deployedAddress = require('../../deployedAddresses.json');
const myTokenContractAddress = deployedAddress.MyToken;

// 创建合约实例，使用新的钱包实例作为签名者
const myTokenContract = new ethers.Contract(myTokenContractAddress, myTokenAbi, wallet);

async function transferToken(to, amount) {
    try {
        // 调用合约的 transfer 函数
        const txResponse = await myTokenContract.transfer(to, ethers.utils.parseUnits(amount.toString(), 18)); // 假设代币是18位小数
        await txResponse.wait(); // 等待交易确认

        console.log(`Tokens successfully transferred to ${to}`);
    } catch (error) {
        console.error(`Error during token transfer: ${error}`);
    }
}

// 命令行参数
const toAddress = process.argv[2];
const amount = process.argv[3];

// 执行转账
if (toAddress && amount) {
    transferToken(toAddress, amount);
} else {
    console.log("Usage: node transferToken.js <to_address> <amount>");
}
