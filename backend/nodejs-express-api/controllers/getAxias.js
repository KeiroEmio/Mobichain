import { Router } from 'express';
import Web3 from 'web3';
import dotenv from "dotenv";
import TransactionAbi from '../../../src/abi/TransactionAbi.json'  assert { type: 'json' };
import deployedAddresses from '../../../src/deployedAddresses.json'  assert { type: 'json' };
dotenv.config();

const router = Router();

const web3 = new Web3(process.env.SPEOLIA_URL);
const contractAddress = deployedAddresses.Transaction;
const contract = new web3.eth.Contract(TransactionAbi, contractAddress);

router.post('/post', async (req, res) => {
    const { parameter } = req.body;

    console.log('parameter:', parameter)
    if (!parameter) {
        return res.status(400).json({ error: 'Parameter is required' });
    }

    try {
        const transaction = await web3.eth.getTransaction(parameter);
        const receipt = await web3.eth.getTransactionReceipt(parameter);
        if (transaction && receipt && receipt.logs.length) {
            const decodedLogs = receipt.logs.map(log => {
                if (log.topics[0] === web3.utils.keccak256("DataLogged(uint256,uint256,uint256,uint256,string,string,string,uint256,uint256)")) {
                    return web3.eth.abi.decodeLog([
                        { indexed: true, name: 'transactionId', type: 'uint256' },
                        { indexed: true, name: 'phoneId', type: 'uint256' },
                        { indexed: false, name: 'buyerId', type: 'uint256' },
                        { indexed: false, name: 'sellerId', type: 'uint256' },
                        { indexed: false, name: 'deviceType', type: 'string' },
                        { indexed: false, name: 'brand', type: 'string' },
                        { indexed: false, name: 'model', type: 'string' },
                        { indexed: false, name: 'transactionAmount', type: 'uint256' },
                        { indexed: false, name: 'transactionTime', type: 'uint256' }
                    ], log.data, log.topics.slice(1));
                }
                return null;
            }).filter(log => log !== null);

            // Correctly use replacer function during JSON serialization
            const responseData = { transaction: transaction, logs: decodedLogs };
            const responseJson = JSON.stringify(responseData, replacer);
            res.setHeader('Content-Type', 'application/json');
            res.send(responseJson);
        } else {
            res.status(404).json({ error: 'Transaction or logs not found' });
        }
    } catch (error) {
        console.error('Failed to fetch transaction data:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch data' });
    }
});

function replacer(key, value) {
    if (typeof value === 'bigint') {
        return value.toString(); // convert it to string
    } else {
        return value; // else, keep it as is
    }
}

export default router;
