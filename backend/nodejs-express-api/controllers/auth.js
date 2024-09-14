import { Router } from 'express';
import jwt from 'jsonwebtoken';
import ejs from 'ejs';
import { body } from 'express-validator';
import config from '../config.js';
import utils from '../helpers/utils.js';
import mailer from '../helpers/mailer.js';
import validateFormData from '../helpers/validate_form.js';
import DB from '../models/db.js';
import RegistrationContractAbi from '../../../src/abi/RegistrationContractAbi.json'  assert { type: 'json' };
import deployedAddresses from '../../../src/deployedAddresses.json'  assert { type: 'json' };
import dotenv from "dotenv";
import Web3 from 'web3';
dotenv.config();

const router = Router();

const web3 = new Web3(process.env.RPC_URL);
const contractAddress = deployedAddresses.RegistrationContract;
const registrationContract = new web3.eth.Contract(RegistrationContractAbi, contractAddress);
/**
 * Route to login user using credential
 * @POST /auth/login
 */
router.post('/login', [
	body('username').trim().not().isEmpty(),
	body('password').not().isEmpty(),
], validateFormData, async (req, res, next) => {
	try {
		let { username, password } = req.body;

		let user = await DB.User.findOne({ where: { [DB.op.or]: { email: username, email: username } } });
		if (!user) {
			return res.unauthorized("Username or password not correct");
		}
		if (!utils.passwordVerify(password, user.password)) {
			return res.unauthorized("Username or password not correct");
		}

		let loginData = await getUserLoginData(user);
		console.log('111', loginData);
		return res.ok(loginData);
	}
	catch (err) {
		return res.serverError(err);
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
], validateFormData, async function (req, res) {
	try {
		console.log('req:', req.body)
		let modeldata = req.getValidFormData();
		modeldata.user_role_id = 2;
		modeldata.password = utils.passwordHash(modeldata.password);
		modeldata.email_verified_at = new Date();  // 添加当前时间为email验证时间
		modeldata.token = 0

		// 检查邮箱是否已存在
		let emailCount = await DB.User.count({ where: { 'email': modeldata.email } });
		if (emailCount > 0) {
			return res.badRequest(`${modeldata.email} already exist.`);
		}

		// 这里，你需要有一个发起交易的账户地址和私钥
		const account = web3.eth.accounts.privateKeyToAccount(process.env.GANACHE_PRIVATE);
		const gasPrice = await web3.eth.getGasPrice();
		const data = registrationContract.methods.register(modeldata.email, modeldata.password).encodeABI();

		console.log('gasPrice:', gasPrice)
		const tx = {
			from: account.address,
			to: contractAddress,
			gas: 5000000,
			gasPrice: gasPrice,
			data: data,
		};

		const signedTx = await account.signTransaction(tx);
		const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

		// 获取事件日志中的地址数据
		let newUserAddress = '';
		if (txReceipt.logs.length > 0) {
			const event = txReceipt.logs.find(log => log.topics[0] === web3.utils.sha3('UserRegistered(address,string)'));
			if (event) {
				newUserAddress = web3.eth.abi.decodeParameter('address', event.topics[1]);
			}
		}

		if (!newUserAddress) {
			throw new Error('UserRegistered event not found or could not decode address.');
		}

		modeldata.address = newUserAddress;

		// 使用返回的地址创建用户记录
		const record = await DB.User.create(modeldata);
		const user = record;
		const recid = record['id'];

		let loginData = await getUserLoginData(user);
		return res.ok(loginData);
	}
	catch (err) {
		return res.serverError(err);
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
