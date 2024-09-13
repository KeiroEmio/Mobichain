const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

const web3 = new Web3('http://127.0.0.1:8545');
console.log("web3 version:", web3.version);

// 引入合约数据
const MyTokenData = require('../artifacts/contracts/ERC20.sol/MyToken.json');
const RegistrationContractData = require('../artifacts/contracts/RegistrationContract.sol/RegistrationContract.json');
const SecondHandMarketData = require('../artifacts/contracts/SecondHandMarket.sol/SecondHandMarket.json');

// 定义ABI和地址文件的路径
const abiDir = path.join(__dirname, '../abi');
const addressesFilePath = path.join(__dirname, '../deployedAddresses.json');

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    const deployerAccount = accounts[0];

    // 确保ABI目录存在
    if (!fs.existsSync(abiDir)) {
        fs.mkdirSync(abiDir);
    }

    // 部署 MyToken
    const MyTokenContract = new web3.eth.Contract(MyTokenData.abi);
    const MyTokenInstance = await MyTokenContract.deploy({
        data: MyTokenData.bytecode
    }).send({
        from: deployerAccount,
        gas: '5000000'
    });
    console.log('MyToken deployed to:', MyTokenInstance.options.address);
    fs.writeFileSync(path.join(abiDir, 'MyTokenAbi.json'), JSON.stringify(MyTokenData.abi));

    // 部署 RegistrationContract
    const RegistrationContract = new web3.eth.Contract(RegistrationContractData.abi);
    const RegistrationContractInstance = await RegistrationContract.deploy({
        data: RegistrationContractData.bytecode,
        arguments: [MyTokenInstance.options.address]
    }).send({
        from: deployerAccount,
        gas: '5000000'
    });
    console.log('RegistrationContract deployed to:', RegistrationContractInstance.options.address);
    fs.writeFileSync(path.join(abiDir, 'RegistrationContractAbi.json'), JSON.stringify(RegistrationContractData.abi));

    // 部署 SecondHandMarket
    const SecondHandMarketContract = new web3.eth.Contract(SecondHandMarketData.abi);
    const SecondHandMarketInstance = await SecondHandMarketContract.deploy({
        data: SecondHandMarketData.bytecode,
        arguments: [MyTokenInstance.options.address]
    }).send({
        from: deployerAccount,
        gas: '5000000'
    });
    console.log('SecondHandMarket deployed to:', SecondHandMarketInstance.options.address);
    fs.writeFileSync(path.join(abiDir, 'SecondHandMarketAbi.json'), JSON.stringify(SecondHandMarketData.abi));

    // 写入部署的地址到deployedAddresses.json
    const deployedAddresses = {
        MyToken: MyTokenInstance.options.address,
        RegistrationContract: RegistrationContractInstance.options.address,
        SecondHandMarket: SecondHandMarketInstance.options.address
    };
    fs.writeFileSync(addressesFilePath, JSON.stringify(deployedAddresses, null, 2));
};

deploy().catch(error => {
    console.error('An error occurred:', error);
});
