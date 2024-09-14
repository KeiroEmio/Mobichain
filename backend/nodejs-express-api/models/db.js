
import { Sequelize, sequelize } from './basemodel.js';

// Override timezone formatting
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
	return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss');
};

import Android from './android.js';
import ChatMessages from './chatmessages.js';
import Iphone from './iphone.js';
import Permissions from './permissions.js';
import Roles from './roles.js';
import Transaction from './transaction.js';
import User from './user.js';
import ImagePaths from './imagepaths.js'
import Message from './message.js';
import Order from './order.js'
import AndroidTransaction from './android_transactions.js'
import IphoneTransaction from './iphone_transactions.js';


const op = Sequelize.Op;
const raw = Sequelize.literal;

const filterBy = function (expression, value) {
	return sequelize.where(raw(expression), value);
}

// convinient functions for performing raw queries 
// return different value types

function rawQuery(queryText, options) {
	return sequelize.query(queryText, options);
}

async function rawQueryList(queryText, queryParams) {
	const records = await rawQuery(queryText, { replacements: queryParams, type: Sequelize.QueryTypes.SELECT });
	return records;
}

async function rawQueryOne(queryText, queryParams) {
	const records = await rawQueryList(queryText, queryParams);
	return records[0] || null;
}

async function rawQueryValue(queryText, queryParams) {
	const record = await rawQueryOne(queryText, queryParams);
	if (record) {
		return Object.values(record)[0];
	}
	return null;
}

function getOrderBy(req, sortField = null, sortType = 'desc') {
	const orderBy = req.query.orderby || sortField;
	const orderType = req.query.ordertype || sortType;
	if (orderBy) {
		let order = raw(`${orderBy} ${orderType}`);
		return [[order]];
	}
	return null;
}

export default {
	sequelize,
	op,
	filterBy,
	raw,
	rawQuery,
	rawQueryList,
	rawQueryOne,
	rawQueryValue,
	getOrderBy,
	Android,
	ChatMessages,
	Iphone,
	Permissions,
	Roles,
	Transaction,
	User,
	ImagePaths,
	Message,
	Order,
	AndroidTransaction,
	IphoneTransaction
}
