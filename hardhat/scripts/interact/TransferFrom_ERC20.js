// 引入 ethers 库
const { ethers } = require('ethers');
const myTokenAbi = require('../../abi/MyTokenAbi.json');

// 设置提供者为 Ganache
const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
const signer = provider.getSigner();

// 从deployedAddresses.json文件获取合约地址
const deployedAddress = require('../../deployedAddresses.json');
const myTokenContractAddress = deployedAddress.MyToken;

// 创建合约实例
const myTokenContract = new ethers.Contract(myTokenContractAddress, myTokenAbi, signer);

async function transferFrom(from, to, amount) {
    try {
        // 调用合约的 transferFrom 函数
        const txResponse = await myTokenContract.transferFrom(
            from,
            to,
            ethers.utils.parseUnits(amount.toString(), 18) // 假设代币是18位小数
        );
        const receipt = await txResponse.wait(); // 等待交易确认
        console.log(`TransferFrom successful: ${receipt.transactionHash}`);
    } catch (error) {
        console.error(`Error during TransferFrom: ${error}`);
    }
}

// 命令行参数
const fromAddress = process.argv[2];
const toAddress = process.argv[3];
const amount = process.argv[4];

// 执行转账
if (fromAddress && toAddress && amount) {
    transferFrom(fromAddress, toAddress, amount);
} else {
    console.log("Usage: node transferFrom.js <from_address> <to_address> <amount>");
}
