import { Router } from 'express';
import jwt from 'jsonwebtoken';
import ejs from 'ejs';
import { body } from 'express-validator';
import config from '../config.js';
import utils from '../helpers/utils.js';
import mailer from '../helpers/mailer.js';
import validateFormData from '../helpers/validate_form.js';
import DB from '../models/db.js';
import RegistrationContractAbi from '../../../hardhat/abi/RegistrationContractAbi.json'  assert { type: 'json' };
import deployedAddresses from '../../../hardhat/deployedAddresses.json'  assert { type: 'json' };
import dotenv from "dotenv";
import Web3 from 'web3';
import generateUUID from "../helpers/getnonce_uuid.js"
import { uploadSingle, handleUploadError } from '../helpers/uploadImage.js';
dotenv.config();

const router = Router();

const web3 = new Web3(process.env.RPC_URL);
const contractAddress = deployedAddresses.RegistrationContract;
const registrationContract = new web3.eth.Contract(RegistrationContractAbi, contractAddress);
let nonceStore = {};
/**
 * Route to login user using credential
 * @POST /auth/login
 */
/**
 * 用户登录的路由，验证签名是否有效
 * @POST /auth/login
 */
router.post('/login', [
    body('publicKey').trim().not().isEmpty(), // 用户的公钥
    body('signature').not().isEmpty(), // 用户的签名
], validateFormData, async (req, res, next) => {
    try {
        const { publicKey, signature } = req.body;
        const nonce = nonceStore[req.ip];
        console.log(nonce + " nonce login before")
        console.log(publicKey, signature)
        // 验证签名
        const isSignatureValid = verifySignature(signature, nonce, publicKey);
        if (!isSignatureValid) {
            return res.status(401).json({ message: "Invalid signature" });
        }

        console.log("isSignatureValid:", isSignatureValid)
        // 根据公钥获取用户信息（假设数据库中有用户的公钥）
        const address = publicKey
        const user = await DB.User.findOne({ where: { address } });

        if (!user) {
            const defaultUser = await DB.User.create({
                email: `${address.substring(0, 6)}@default.com`,
                password: utils.passwordHash(address.slice(-6)),
                address: address,
                email_verified_at: new Date(),
                photo: "",
                token: 0.00,
                user_role_id: 2
            });

            console.log("Created default user:", defaultUser);
            const loginData = await getUserLoginData(defaultUser);
            return res.status(200).json(loginData);
        }
        // console.log("user:",user)
        const loginData = await getUserLoginData(user);
        console.log("loginData:", loginData)
        return res.status(200).json(loginData);
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

/**  添加邮箱登录路由
*  @param {string} email 
*  @param {string} password 
*/
router.post('/email-login', [
    body('email').not().isEmpty().isEmail(),
    body('password').not().isEmpty(),
], validateFormData, async (req, res) => {
    try {
        const { email, password } = req.body;

        // 查找用户
        const user = await DB.User.findOne({
            where: { email }
        });

        // 检查用户是否存在
        if (!user) {
            return res.status(405).json({ message: "邮箱或密码错误" });
        }
        const validateEmail = async (email) => {
            // 基本格式验证
            if (!emailValidator.validate(email)) {
                return false;
            }
            return true;
        };
        // 验证密码
        const isValidPassword = utils.passwordVerify(password, user.password, 'bcrypt');
        if (!isValidPassword) {
            return res.status(401).json({ message: "邮箱或密码错误" });
        }

        const loginData = await getUserLoginData(user);
        console.log("Email login successful:", loginData);

        return res.status(200).json(loginData);
    } catch (err) {
        console.error("Email login error:", err);
        return res.status(500).json({ message: '服务器错误' });
    }
});
/**
 * 验证签名
 * @param {string} signature - 签名字符串
 * @param {string} nonce - 签名时的数据（原始消息）
 * @param {string} publicKey - 预期的签名者地址
 * @returns {boolean} 是否验证成功
 */
function verifySignature(signature, nonce, publicKey) {
    try {
        // 直接使用 recover 方法恢复签名者的地址
        const recoveredAddress = web3.eth.accounts.recover(nonce, signature);

        console.log('Recovered Address:', recoveredAddress);
        console.log('Provided Address:', publicKey);

        // 比较恢复的地址与传入的公钥地址
        return recoveredAddress.toLowerCase() === publicKey.toLowerCase();
    } catch (error) {
        console.error('签名验证失败:', error);
        return false;
    }
}

// @POST /auth/nonce
router.post('/nonce', [], [], async (req, res, next) => {
    try {
        nonceStore[req.ip] = generateUUID();
        console.log("nonce:", nonceStore[req.ip])
        return res.status(200).json([nonceStore[req.ip]]);
    } catch (err) {
        return res.status(500).json({ message: 'Server error,' + err });
    }
});


/**
 * Route to register new user
 * @POST /auth/register
 */
router.post('/register', [
    body('password').not().isEmpty(),
    body('confirm_password', 'Passwords do not match').custom((value, { req }) => value === req.body.password),
    body('email').not().isEmpty().isEmail(),
    body('photo'),
], validateFormData, async function (req, res) {
    try {
        let modeldata = req.getValidFormData();
        modeldata.user_role_id = 2;
        modeldata.password = utils.passwordHash(modeldata.password);
        modeldata.email_verified_at = new Date();
        modeldata.token = 0;
        modeldata.address = null;

        let emailCount = await DB.User.count({ where: { 'email': modeldata.email } });
        if (emailCount > 0) {
            return res.status(405).json({ message: `${modeldata.email} 已经存在` });
        }

        const record = await DB.User.create(modeldata);
        const loginData = await getUserLoginData(record);
        return res.status(200).json(loginData);
    }
    catch (err) {
        return res.status(500).json({ message: '注册失败：' + err.message });
    }
});
// router.post('/register', [
// 	body('password').not().isEmpty(),
// 	body('confirm_password', 'Passwords do not match').custom((value, { req }) => value === req.body.password),
// 	body('email').not().isEmpty().isEmail(),
// ], validateFormData, async function (req, res) {
// 	try {
// 		console.log('req:', req.body)
// 		let modeldata = req.getValidFormData();
// 		modeldata.user_role_id = 2;
// 		modeldata.password = utils.passwordHash(modeldata.password);
// 		modeldata.email_verified_at = new Date();  // 添加当前时间为email验证时间
// 		modeldata.token = 0

// 		// 检查邮箱是否已存在
// 		let emailCount = await DB.User.count({ where: { 'email': modeldata.email } });
// 		if (emailCount > 0) {
// 			return res.badRequest(`${modeldata.email} already exist.`);
// 		}

// 		// 这里，你需要有一个发起交易的账户地址和私钥
// 		const account = web3.eth.accounts.privateKeyToAccount(process.env.GANACHE_PRIVATE);
// 		const gasPrice = await web3.eth.getGasPrice();
// 		const data = registrationContract.methods.register(modeldata.email, modeldata.password).encodeABI();

// 		console.log('gasPrice:', gasPrice)
// 		const tx = {
// 			from: account.address,
// 			to: contractAddress,
// 			gas: 5000000,
// 			gasPrice: gasPrice,
// 			data: data,
// 		};

// 		const signedTx = await account.signTransaction(tx);
// 		const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

// 		// 获取事件日志中的地址数据
// 		let newUserAddress = '';
// 		if (txReceipt.logs.length > 0) {
// 			const event = txReceipt.logs.find(log => log.topics[0] === web3.utils.sha3('UserRegistered(address,string)'));
// 			if (event) {
// 				newUserAddress = web3.eth.abi.decodeParameter('address', event.topics[1]);
// 			}
// 		}

// 		if (!newUserAddress) {
// 			throw new Error('UserRegistered event not found or could not decode address.');
// 		}

// 		modeldata.address = newUserAddress;

// 		// 使用返回的地址创建用户记录
// 		const record = await DB.User.create(modeldata);
// 		const user = record;
// 		const recid = record['id'];

// 		let loginData = await getUserLoginData(user);
// 		return res.ok(loginData);
// 	}
// 	catch (err) {
// 		return res.serverError(err);
// 	}
// });


// router.post('/register', [
// 	body('password').not().isEmpty(),
// 	body('confirm_password', 'Passwords do not match').custom((value, { req }) => value === req.body.password),
// 	body('email').not().isEmpty().isEmail(),
// ], validateFormData, async function (req, res) {
// 	try {
// 		console.log('req:', req.body)
// 		let modeldata = req.getValidFormData();
// 		modeldata.user_role_id = 2;
// 		modeldata.password = utils.passwordHash(modeldata.password);
// 		modeldata.email_verified_at = new Date();  // 添加当前时间为email验证时间
// 		modeldata.token = 0

// 		// 检查邮箱是否已存在
// 		let emailCount = await DB.User.count({ where: { 'email': modeldata.email } });
// 		if (emailCount > 0) {
// 			return res.badRequest(`${modeldata.email} already exist.`);
// 		}

// 		// 这里，你需要有一个发起交易的账户地址和私钥
// 		const account = web3.eth.accounts.privateKeyToAccount(process.env.GANACHE_PRIVATE);
// 		const gasPrice = await web3.eth.getGasPrice();
// 		const data = registrationContract.methods.register(modeldata.email, modeldata.password).encodeABI();

// 		console.log('gasPrice:', gasPrice)
// 		const tx = {
// 			from: account.address,
// 			to: contractAddress,
// 			gas: 5000000,
// 			gasPrice: gasPrice,
// 			data: data,
// 		};

// 		const signedTx = await account.signTransaction(tx);
// 		const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

// 		// 获取事件日志中的地址数据
// 		let newUserAddress = '';
// 		if (txReceipt.logs.length > 0) {
// 			const event = txReceipt.logs.find(log => log.topics[0] === web3.utils.sha3('UserRegistered(address,string)'));
// 			if (event) {
// 				newUserAddress = web3.eth.abi.decodeParameter('address', event.topics[1]);
// 			}
// 		}

// 		if (!newUserAddress) {
// 			throw new Error('UserRegistered event not found or could not decode address.');
// 		}

// 		modeldata.address = newUserAddress;

// 		// 使用返回的地址创建用户记录
// 		const record = await DB.User.create(modeldata);
// 		const user = record;
// 		const recid = record['id'];

// 		let loginData = await getUserLoginData(user);
// 		return res.ok(loginData);
// 	}
// 	catch (err) {
// 		return res.serverError(err);
// 	}
// });





/**
 * Route to send password reset link to user email
 * @POST /auth/forgotpassword
 */
router.post('/forgotpassword', [
    body('email').not().isEmpty().isEmail(),
], validateFormData, async (req, res) => {
    try {
        const modeldata = req.getValidFormData();
        const email = modeldata.email;
        const user = await DB.User.findOne({ where: { 'email': email } });
        if (!user) {
            return res.notFound("Email not registered");
        }
        await sendPasswordResetLink(user);


        return res.ok("We have emailed your password reset link!");
    }
    catch (err) {
        return res.serverError(err);
    }
});


/**
 * Route to reset user password
 * @POST /auth/resetpassword
 */
router.post('/resetpassword', [
    body('password').not().isEmpty().custom((val, { req, loc, path }) => {
        if (val !== req.body.confirm_password) {
            throw new Error("Passwords confirmation does not match");
        } else {
            return val;
        }
    }),
], validateFormData, async (req, res) => {
    try {
        const token = req.body.token;
        const userid = getUserIDFromJwt(token);
        const password = req.body.password;
        const where = { id: userid }
        const record = await DB.User.findOne({ where: where });
        if (!record) {
            return res.notFound("User not found");
        }
        const newPassword = utils.passwordHash(password);
        const modeldata = { password: newPassword }
        await DB.User.update(modeldata, { where: where });


        return res.ok("Password changed");
    }
    catch (err) {
        return res.serverError(err);
    }
});

/**
 * Route to upload phone
 * @POST /auth/upload-photo
 */
router.post('/avatar',
    uploadSingle('photo'),
    handleUploadError,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: '没有上传文件' });
            }

            const photoPath = req.file.path.replace(/\\/g, '/');
            console.log('photoPath:', photoPath)
            // consoloe.log('photoPath:', photoPath)
            return res.status(200).json({
                message: '上传成功',
                photo: photoPath
            });
        } catch (error) {
            console.error('Error uploading photo:', error);
            return res.status(500).json({ message: '上传失败：' + error.message });
        }
    }
);

/**
 * Send password reset link to user email 
*/
async function sendPasswordResetLink(user) {
    let token = generateUserToken(user);
    let resetlink = `${config.app.frontendUrl}/#/index/resetpassword?token=${token}`;
    let username = user.email;
    let email = user.email;
    let mailtitle = 'Password Reset';


    let viewData = { username, email, resetlink, config };
    let mailbody = await ejs.renderFile("views/pages/index/password_reset_email_template.ejs", viewData);

    let mailResult = await mailer.sendMail(email, mailtitle, mailbody);
    if (!mailResult.messageId) {
        throw new Error(mailResult.error);
    }
    return true;
}


/**
 * Return user login data
 * generate a signed jwt for the user
 * @param {object} user - current user
 */
async function getUserLoginData(user) {
    const expiresIn = config.auth.jwtDuration + 'm' //in minutes;
    const userid = user.id;
    const user_role_id = user.user_role_id
    const token = jwt.sign({ sub: userid }, config.auth.apiTokenSecret, { expiresIn });
    return { token, user_role_id }; //return user object and token
}


/**
 * Generate user auth token
 * @param {object} user - current user
 */
function generateUserToken(user) {
    const expiresIn = '10m' //in minutes;
    const userid = user.id;
    const token = jwt.sign({ sub: userid }, config.auth.userTokenSecret, { expiresIn });
    return token;
}


/**
 * Get userid from jwt token
 * @param {string} token
 */
function getUserIDFromJwt(token) {
    try {
        let decoded = jwt.verify(token, config.auth.userTokenSecret);
        return decoded.sub
    }
    catch (err) {
        throw new Error(err);
    }
}
export default router;
