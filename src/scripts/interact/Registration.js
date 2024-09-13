const { ethers } = require('ethers');
const registrationAbi = require('../../abi/RegistrationContractAbi.json');

// 使用Ganache的RPC URL 需要改成HTTP://127.0.0.1:8545，而不是localhost，因为存在一些问题
const provider = new ethers.providers.JsonRpcProvider('HTTP://127.0.0.1:8545');
const signer = provider.getSigner();

// 使用deployedAddresses.json中的Ganache部署地址
const deployedAddress = require('../../deployedAddresses.json');
const registrationContractAddress = deployedAddress.RegistrationContract;

// 创建合约实例
const registrationContract = new ethers.Contract(registrationContractAddress, registrationAbi, signer);

async function main() {
    const email = "user@example.com";
    const password = "password123";

    try {
        // 调用合约的register方法
        const tx = await registrationContract.register(email, password);
        // 等待交易被挖出
        const receipt = await tx.wait();
        // 从事件中获取新创建的账户地址
        const newUserAddress = receipt.events.find(event => event.event === "UserRegistered").args.ethAddress;

        console.log(`New user registered with address: ${newUserAddress}`);
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();
