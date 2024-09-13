// 引入 ethers 库
const { ethers } = require('ethers');
const myTokenAbi = require('../../abi/MyTokenAbi.json');

// 设置提供者为 Ganache
const provider = new ethers.providers.JsonRpcProvider('HTTP://127.0.0.1:8545');
const signer = provider.getSigner();

// 从deployedAddresses.json文件获取合约地址
const deployedAddress = require('../../deployedAddresses.json');
const myTokenContractAddress = deployedAddress.MyToken;

// 创建合约实例
const myTokenContract = new ethers.Contract(myTokenContractAddress, myTokenAbi, signer);

// 主函数
async function getBalance(address) {
    try {
        // 确保地址是有效的
        if (!ethers.utils.isAddress(address)) {
            console.log("Invalid address.");
            return;
        }

        // 调用 balanceOf 方法查询代币余额
        const balance = await myTokenContract.balanceOf(address);

        // 打印余额，这里使用 ethers 的工具将余额格式化为更易读的格式
        console.log(`Balance of ${address}: ${ethers.utils.formatEther(balance)} tokens`);
    } catch (error) {
        console.error(`Error fetching balance: ${error}`);
    }
}

// 获取命令行中输入的地址
const addressInput = process.argv[2]; // 第二个参数为地址

// 调用 getBalance 函数
if (addressInput) {
    getBalance(addressInput);
} else {
    console.log("Please provide an address.");
}