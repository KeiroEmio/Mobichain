const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const web3 = new Web3(process.env.SPEOLIA_URL);
const TokenData = require('../../artifacts/contracts/main/MarketToken.sol/MarketToken.json');

const abiDir = path.join(__dirname, '../../abi');
const addressesFilePath = path.join(__dirname, '../../deployedAddresses.json');

const deploy = async () => {
    const account = web3.eth.accounts.privateKeyToAccount('0x' + process.env.PRIVATE_KEY);
    web3.eth.accounts.wallet.add(account);

    if (!fs.existsSync(abiDir)) {
        fs.mkdirSync(abiDir);
    }
    
    // 100 million tokens
    const initialSupply = web3.utils.toWei('100000000', 'ether'); 
    const TokenContract = new web3.eth.Contract(TokenData.abi);
    const TokenInstance = await TokenContract.deploy({
        data: TokenData.bytecode,
        arguments: [initialSupply]
    }).send({
        from: account.address,
        gas: 3000000
    });
    console.log('Token Contract deployed to:', TokenInstance.options.address);

    fs.writeFileSync(path.join(abiDir, 'TokenAbi.json'), JSON.stringify(TokenData.abi));

    let deployedAddresses = fs.existsSync(addressesFilePath) ?
        JSON.parse(fs.readFileSync(addressesFilePath, 'utf8')) : {};

    deployedAddresses.Token = TokenInstance.options.address;
    fs.writeFileSync(addressesFilePath, JSON.stringify(deployedAddresses, null, 2));
    console.log('Updated deployed addresses:', deployedAddresses);
    
    return TokenInstance.options.address;
};

deploy().catch(error => {
    console.error('An error occurred:', error);
});