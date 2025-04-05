const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// 连接到本地节点
const web3 = new Web3('http://127.0.0.1:8545');
console.log("连接到以太坊网络...");

// 引入合约数据
const WTFApeData = require('../artifacts/contracts/ERC721/WTFApe.sol/WTFApe.json');
const NFTSwapData = require('../artifacts/contracts/NFTExchage.sol/NFTSwap.json');

// 定义路径
const abiDir = path.join(__dirname, '../abi');
const addressesFilePath = path.join(__dirname, '../deployedNFTAddresses.json');

const deploy = async () => {
    try {
        console.log("开始部署流程...");
        
        // 获取账户
        const accounts = await web3.eth.getAccounts();
        const deployerAccount = accounts[0];
        console.log("部署账户:", deployerAccount);
        
        // 获取网络ID
        const networkId = await web3.eth.net.getId();
        console.log("当前网络ID:", networkId);
        
        // 获取预估gas价格
        const gasPrice = await web3.eth.getGasPrice();
        console.log("当前gas价格:", gasPrice);

        // 确保ABI目录存在
        if (!fs.existsSync(abiDir)) {
            fs.mkdirSync(abiDir, { recursive: true });
        }

        // 部署 WTFApe NFT
        console.log("\n开始部署 WTFApe NFT 合约...");
        const WTFApeContract = new web3.eth.Contract(WTFApeData.abi);
        const WTFApeInstance = await WTFApeContract.deploy({
            data: WTFApeData.bytecode,
            arguments: ["WTFApe", "WTF"]
        }).send({
            from: deployerAccount,
            gas: await WTFApeContract.deploy({
                data: WTFApeData.bytecode,
                arguments: ["WTFApe", "WTF"]
            }).estimateGas(),
            gasPrice: gasPrice
        });
        console.log('WTFApe 合约已部署到:', WTFApeInstance.options.address);
        fs.writeFileSync(path.join(abiDir, 'WTFApeAbi.json'), JSON.stringify(WTFApeData.abi, null, 2));

        // 部署 NFTSwap
        console.log("\n开始部署 NFTSwap 合约...");
        const NFTSwapContract = new web3.eth.Contract(NFTSwapData.abi);
        const NFTSwapInstance = await NFTSwapContract.deploy({
            data: NFTSwapData.bytecode
        }).send({
            from: deployerAccount,
            gas: await NFTSwapContract.deploy({
                data: NFTSwapData.bytecode
            }).estimateGas(),
            gasPrice: gasPrice
        });
        console.log('NFTSwap 合约已部署到:', NFTSwapInstance.options.address);
        fs.writeFileSync(path.join(abiDir, 'NFTSwapAbi.json'), JSON.stringify(NFTSwapData.abi, null, 2));

        // 保存部署地址
        const deployedAddresses = {
            WTFApe: WTFApeInstance.options.address,
            NFTSwap: NFTSwapInstance.options.address,
            networkId: networkId,
            deployTime: new Date().toISOString()
        };
        fs.writeFileSync(addressesFilePath, JSON.stringify(deployedAddresses, null, 2));
        console.log("\n合约地址已保存到:", addressesFilePath);

        // 铸造测试NFT
        console.log("\n开始铸造测试 NFT...");
        const mintCount = 5;
        for(let i = 0; i < mintCount; i++) {
            try {
                await WTFApeInstance.methods.mint(deployerAccount, i).send({
                    from: deployerAccount,
                    gas: '200000',
                    gasPrice: gasPrice
                });
                console.log(`已铸造 NFT #${i} 给账户 ${deployerAccount}`);
            } catch (error) {
                console.error(`铸造 NFT #${i} 失败:`, error.message);
            }
        }

        // 验证部署
        console.log("\n验证部署结果...");
        const wtfApeOwner = await WTFApeInstance.methods.ownerOf(0).call();
        console.log("NFT #0 持有者:", wtfApeOwner);
        console.log("部署完成！");

    } catch (error) {
        console.error("部署过程中出错:", error);
        throw error;
    }
};

// 执行部署
deploy()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });