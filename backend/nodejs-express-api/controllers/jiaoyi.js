import express from 'express';
import Android from '../models/android.js';
import iPhone from '../models/iphone.js';
import User from '../models/user.js';
import AndroidTransaction from '../models/android_transactions.js';
import IphoneTransaction from '../models/iphone_transactions.js';
import { sequelize } from '../models/basemodel.js';
import DB from '../models/db.js'
import TransactionAbi from '../../../hardhat/abi/TransactionAbi.json'  assert { type: 'json' };
import deployedAddresses from '../../../hardhat/deployedAddresses.json'  assert { type: 'json' };
import dotenv from "dotenv";
import Web3 from 'web3';
import { ethers } from 'ethers';
dotenv.config();

const web3 = new Web3(process.env.SPEOLIA_URL);
const contractAddress = deployedAddresses.Transaction;
const TransactionContract = new web3.eth.Contract(TransactionAbi, contractAddress);

const router = express.Router();

router.post('/android', async (req, res) => {
    const { price, buyerAddress, owner, androidId, brand, model, signature, meteMaskAddress } = req.body;
    console.log('req.body:', req.body);
    const transaction = await sequelize.transaction();

    const message = JSON.stringify({
        price: price,
        owner: owner,
        androidId: androidId,
        brand: brand,
        model: model,
        buyerAddress: buyerAddress
    })

    console.log('message,signature,meteMaskAddress:', message, signature, meteMaskAddress)

    //签名验证
    const signerAddress = ethers.utils.verifyMessage(message, signature);
    console.log('signerAddress:', signerAddress)
    if (signerAddress.toLowerCase() === meteMaskAddress.toLowerCase()) {
        try {

            if (buyerAddress === owner) {
                return res.status(405).json({ message: "不能购买自己的商品,请看看别的~" });
            }

            const buyer = await User.findOne({ where: { address: buyerAddress } });
            const seller = await User.findOne({ where: { address: owner } });

            if (!buyer || !seller) {
                return res.status(405).json({ message: "Buyer or seller not found." });
            }

            const transactionPrice = parseFloat(price);
            if (isNaN(transactionPrice)) {
                return res.status(400).json({ message: "无效的price格式化" });
            }

            const buyerToken = parseFloat(buyer.token);
            const sellerToken = parseFloat(seller.token);
            if (isNaN(buyerToken) || buyerToken < transactionPrice) {
                return res.status(400).json({ message: "Buyer does not have enough funds." });
            }

            const android = await Android.findOne({ where: { id: androidId, issold: 0 } });
            if (!android) {
                return res.status(405).json({ message: "Android not found or already sold." });
            }

            const blockchainData = {
                deviceId: android.id,
                deviceType: 'android',
                brand,
                model,
                buyerId: buyer.id,
                sellerId: seller.id,
                transactionAmount: web3.utils.toWei(transactionPrice.toString(), 'ether'),
                transactionTime: new Date()
            };


            const txHash = await sendToBlockchain(blockchainData);

            if (txHash) {
                buyer.token = (buyerToken - transactionPrice).toFixed(2);
                seller.token = (sellerToken + transactionPrice).toFixed(2);
                android.issold = 1;
                android.owner = buyerAddress;

                await buyer.save({ transaction });
                await seller.save({ transaction });
                await android.save({ transaction });

                await transaction.commit();

            } else {
                return res.status(405).json({ message: "Transaction failed,txHash is null" })
            }
            res.status(200).json({ message: "Transaction successful", txHash: txHash });
        } catch (error) {
            await transaction.rollback();
            res.status(500).json({ message: "Transaction failed.", error: error.message });
        }
    }
});


router.post('/iphone', async (req, res) => {
    const { price, buyerAddress, owner, iphoneId, brand, model, signature, meteMaskAddress } = req.body;  // 接收 brand 和 model
    console.log('req.body:', req.body);
    const message = JSON.stringify({
        price: price,
        owner: owner,
        iphoneId: iphoneId,
        brand: brand,
        model: model,
        buyerAddress: buyerAddress
    })

    console.log('message,signature,meteMaskAddress:', message, signature, meteMaskAddress)
    //签名验证
    const signerAddress = ethers.utils.verifyMessage(message, signature);
    console.log('signerAddress:', signerAddress)
    if (signerAddress.toLowerCase() === meteMaskAddress.toLowerCase()) {
        //数据库序列化操作
        const transaction = await sequelize.transaction();

        try {
            if (buyerAddress === owner) {
                return res.status(405).json({ message: "不能购买自己的商品,请看看别的~" });
            }

            const buyer = await User.findOne({ where: { address: buyerAddress } });
            const seller = await User.findOne({ where: { address: owner } });

            if (!buyer || !seller) {
                return res.status(405).json({ message: "Buyer or seller not found." });
            }

            const transactionPrice = parseFloat(price);
            if (isNaN(transactionPrice)) {
                return res.status(400).json({ message: "无效的price格式化" });
            }

            const buyerToken = parseFloat(buyer.token);
            const sellerToken = parseFloat(seller.token);
            if (isNaN(buyerToken) || buyerToken < transactionPrice) {
                return res.status(400).json({ message: "Buyer does not have enough funds." });
            }

            const iphone = await iPhone.findOne({ where: { id: iphoneId, issold: 0 } });
            if (!iphone) {
                return res.status(405).json({ message: "iPhone not found or already sold." });
            }

            const blockchainData = {
                deviceId: iphone.id,  // 使用 deviceId 替代 iphoneId，为了通用性
                deviceType: 'iphone',
                brand,  // 将 brand 传递给区块链
                model,  // 将 model 传递给区块链
                buyerId: buyer.id,
                sellerId: seller.id,
                transactionAmount: web3.utils.toWei(transactionPrice.toString(), 'ether'),
                transactionTime: new Date(),
            };

            console.log('blockchainData:', blockchainData);
            const txHash = await sendToBlockchain(blockchainData, 'iphone');  // 传递 deviceType 为 'iphone'

            if (txHash) {
                buyer.token = (buyerToken - transactionPrice).toFixed(2);
                seller.token = (sellerToken + transactionPrice).toFixed(2);
                iphone.issold = 1;
                iphone.owner = buyerAddress;

                await buyer.save({ transaction });
                await seller.save({ transaction });
                await iphone.save({ transaction });

                await transaction.commit();
            } else {
                return res.status(405).json({ message: "Transaction failed,txHash is null" })
            }
            res.status(200).json({ message: "Transaction successful", txHash: txHash });
        } catch (error) {
            await transaction.rollback();
            res.status(500).json({ message: "Transaction failed.", error: error.message });
        }
    } else {
        res.send({ verified: false, error: 'Signature does not match expected address' });
        return
    }




});

router.get('/transactions', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'created_at';
        const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';
        const search = req.query.search;

        // Build search conditions specific to each model
        const androidSearchCondition = search ? {
            [DB.op.or]: [
                { 'tx_hash': { [DB.op.like]: `%${search}%` } },
                { 'android_id': { [DB.op.like]: `%${search}%` } }
            ]
        } : {};

        const iphoneSearchCondition = search ? {
            [DB.op.or]: [
                { 'tx_hash': { [DB.op.like]: `%${search}%` } },
                { 'iphone_id': { [DB.op.like]: `%${search}%` } }
            ]
        } : {};

        // Fetch data from both tables with specific search conditions
        const [androidResults, iphoneResults] = await Promise.all([
            AndroidTransaction.findAll({
                where: androidSearchCondition,
                order: [[sortBy, sortOrder]],
            }),
            IphoneTransaction.findAll({
                where: iphoneSearchCondition,
                order: [[sortBy, sortOrder]],
            })
        ]);

        // Combine data from both tables
        let combinedTransactions = [...androidResults, ...iphoneResults];

        // Remove duplicates
        combinedTransactions = combinedTransactions.filter((transaction, index, self) =>
            index === self.findIndex((t) => (
                t.id === transaction.id
            ))
        );

        // Sort the combined data
        combinedTransactions.sort((a, b) => {
            if (sortOrder === 'DESC') {
                return new Date(b[sortBy]) - new Date(a[sortBy]);
            } else {
                return new Date(a[sortBy]) - new Date(b[sortBy]);
            }
        });

        // Total record count
        const totalRecords = combinedTransactions.length;

        // Paginate the sorted and combined data
        const paginatedTransactions = combinedTransactions.slice((page - 1) * pageSize, page * pageSize);

        // Return the paginated, sorted, and filtered results
        res.json({
            page: page,
            pageSize: pageSize,
            totalRecords: totalRecords,
            transactions: paginatedTransactions,
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: error.message });
    }
});




async function sendToBlockchain(data) {
    const transactionTime = data.transactionTime;

    // 从环境变量获取私钥并创建账户对象
    const account = web3.eth.accounts.privateKeyToAccount('0x' + process.env.PRIVATE_KEY);

    // 获取当前的 Gas 费用设置
    const gasPrice = await web3.eth.getGasPrice();
    const block = await web3.eth.getBlock("latest");
    const baseFeePerGas = block.baseFeePerGas;
    console.log('gasPrice:', gasPrice)
    // console.log('block:', block)
    console.log('baseFeePerGas:', baseFeePerGas)
    const transactionObject = {
        from: account.address,
        to: TransactionContract.options.address,
        data: TransactionContract.methods.logTransaction(
            data.deviceId,
            data.deviceType,
            data.brand,
            data.model,
            data.buyerId,
            data.sellerId,
            data.transactionAmount,
            Math.floor(transactionTime.getTime() / 1000)
        ).encodeABI(),
        gas: 500000,
        maxPriorityFeePerGas: web3.utils.toWei('2', 'wei'),
        maxFeePerGas: web3.utils.toWei((parseInt(baseFeePerGas) * 2).toString(), 'wei'),
        chainId: await web3.eth.getChainId()
    };

    try {
        const signedTx = await web3.eth.accounts.signTransaction(transactionObject, account.privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log('Transaction successful with hash:', receipt.transactionHash);
        if (data.deviceType === 'android') {
            await AndroidTransaction.create({
                android_id: data.deviceId,
                tx_hash: receipt.transactionHash,
                created_at: transactionTime
            });
        } else if (data.deviceType === 'iphone') {
            await IphoneTransaction.create({
                iphone_id: data.deviceId,
                tx_hash: receipt.transactionHash,
                created_at: transactionTime
            });
        }
        return receipt.transactionHash;
    } catch (error) {
        console.error("Failed to send data to the blockchain:", error);
        throw error;
    }
}





export default router;
