const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// 配置Web3实例
const web3 = new Web3(process.env.SPEOLIA_URL);
console.log('SPEOLIA_URL:', process.env.SPEOLIA_URL);
console.log("web3 version:", web3.version);

// 导入合约的artifact
const ERC20Data = require('../artifacts/contracts/ERC20.sol/MyToken.json');

// 定义ABI和部署地址的路径
const abiDir = path.join(__dirname, '../abi');
const addressesFilePath = path.join(__dirname, '../deployedAddresses.json');

// 异步部署函数
const deploy = async () => {
    // 从节点获取账户
    const account = web3.eth.accounts.privateKeyToAccount('0x' + process.env.PRIVATE_KEY);
    web3.eth.accounts.wallet.add(account);

    // 确保ABI目录存在
    if (!fs.existsSync(abiDir)) {
        fs.mkdirSync(abiDir);
    }

    // 部署ERC20合约
    const ERC20 = new web3.eth.Contract(ERC20Data.abi);
    const ERC20Instance = await ERC20.deploy({
        data: ERC20Data.bytecode
    }).send({
        from: account.address,
        gas: 5000000
    });
    console.log('ERC20 Contract deployed to:', ERC20Instance.options.address);


    // 写入ABI文件
    fs.writeFileSync(path.join(abiDir, 'ERC20Abi.json'), JSON.stringify(ERC20Data.abi));

    // 读取或初始化已部署地址文件
    let deployedAddresses = fs.existsSync(addressesFilePath) ?
        JSON.parse(fs.readFileSync(addressesFilePath, 'utf8')) : {};

    // 更新已部署地址文件
    deployedAddresses.ERC20 = ERC20Instance.options.address;
    fs.writeFileSync(addressesFilePath, JSON.stringify(deployedAddresses, null, 2));
    console.log('Updated deployed addresses:', deployedAddresses);
};

// 执行部署并处理可能的错误
deploy().catch(error => {
    console.error('An error occurred:', error);
});
