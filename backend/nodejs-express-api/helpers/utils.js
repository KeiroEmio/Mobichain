import moment from "moment";
import config from '../config.js';
import fs from 'fs';
import axios from 'axios';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import https from 'https';
import basePath from "../basepath.js";

export default {
	basePath,
	writeToLog: function (content, prefix = '') {
		try {
			const todaysDate = new Date().toISOString().slice(0, 10);
			const logFile = fs.createWriteStream(`${basePath}/logs/${prefix}${todaysDate}.log`, { flags: 'a' });
			const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
			logFile.write(`${now} -> ${content}\n`);
		} catch (e) { }
	},
	startsWith: function (val, prefix) {
		return (val.toString().slice(0, prefix.toString().length)) == prefix
	},
	isDigits: function (val) {
		return /^\d+$/.test(val);
	},
	isNumeric(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	},

	formatValidationError: function (errors) {
		let errorMsgs = [];
		errors.forEach(item => errorMsgs.push(item.param + ": " + item.msg));
		return errorMsgs;
	},
	sanitizeInput(obj) {
		const self = this;
		Object.keys(obj).forEach(key => {
			if (Array.isArray(obj[key])) {
				obj[key].map(o => {
					if (typeof o === 'object') {
						self.sanitizeInput(o);
					}
				})
			} else if (typeof obj[key] === 'string') {
				obj[key] = obj[key].trim();
				if (obj[key] === '') {
					obj[key] = null;
				}
			} else if (typeof obj[key] === 'object') {
				self.sanitizeInput(obj[key]);
			}
		});
		return obj;
	},
	// generate random color example #fafa84
	randomColor: function () {
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	},

	// generate list ofrandom color example ["#fafa84", ...]
	arrRandomColor: function (len) {
		var colors = [];
		for (var i = 0; i < len; i++) {
			colors.push(this.randomColor());
			//colors.push(`hsla(${Math.random() * 360}, 100%, 50%, 1)`);
		}
		return colors;
	},

	// Generate a random hexadecimal string
	randomHex: function (limit = 16) {

		const randomString = crypto.randomBytes(limit).toString("hex");
		return randomString;
	},

	// Generate a random string from set of supplied data context example ekszlrc5apjx
	randomStr: function (limit, context) {
		var len = limit || 12;
		var context = 'abcdefghijklmnopqrstuvwxyz1234567890';
		var text = ''
		for (var i = 0; i < len; i++)
			text += context.charAt(Math.floor(Math.random() * context.length));

		return text;
	},

	// Generate a random string and characters from set of supplied data context 
	// example !XQjKcu2r$^C
	randomChars: function (limit, context) {
		var len = limit || 12;
		var context = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@//$%^&*_+-=';
		var text = ''
		for (var i = 0; i < len; i++)
			text += context.charAt(Math.floor(Math.random() * context.length));
		return text;

	},

	// Generate a random string of specific length example 783621
	randomNum(length = 6) {
		var randomNum = (Math.pow(10, length).toString().slice(length - 1) + Math.floor((Math.random() * Math.pow(10, length)) + 1).toString()).slice(-length);
		return randomNum;
	},

	// return uuid/v4
	uuid: function () {
		var dt = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (dt + Math.random() * 16) % 16 | 0;
			dt = Math.floor(dt / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
		return uuid;
	},

	// return string date in human readable format example 2, Dec 2018
	// exmaple Jun 9 2014
	humanDate: function (strdate) {
		return moment(strdate).format('ll')
	},

	// return string date in human readable format example 2, Dec 2018 02:30pm
	humanDatetime: function (strdate) {
		return moment(strdate).format('llll')   // Mon, Jun 9 2014 9:32 PM
	},

	// return string date in human readable format example 2, Dec 2018 02:30pm
	simpleDatetime: function (strdate) {
		return moment(strdate).format('MMM Do h:mm')   // Mon, Jun 9 2014 9:32 PM
	},

	// return string date in human readable format example 02:30pm
	humanTime: function (strdate) {
		return moment(strdate).format('LT')
	},

	// return string date in relative format support both date string and timestamp
	// example 31 minutes ago, 5 days from now
	relativeDate: function (strdate) {
		return moment(strdate).fromNow()
	},
	sqlToJsDate: function (sqlDate) {
		//sqlDate in SQL DATETIME format ("yyyy-mm-dd hh:mm:ss.ms")
		var sqlDateArr1 = sqlDate.split("-");
		//format of sqlDateArr1[] = ['yyyy','mm','dd hh:mm:ms']
		var sYear = sqlDateArr1[0];
		var sMonth = (Number(sqlDateArr1[1]) - 1).toString();
		var sqlDateArr2 = sqlDateArr1[2].split(" ");
		//format of sqlDateArr2[] = ['dd', 'hh:mm:ss.ms']
		var sDay = sqlDateArr2[0];
		var sqlDateArr3 = sqlDateArr2[1].split(":");
		//format of sqlDateArr3[] = ['hh','mm','ss.ms']
		var sHour = sqlDateArr3[0];
		var sMinute = sqlDateArr3[1];
		var sqlDateArr4 = sqlDateArr3[2].split(".");
		//format of sqlDateArr4[] = ['ss','ms']
		var sSecond = sqlDateArr4[0];
		var sMillisecond = sqlDateArr4[1];

		return new Date(sYear, sMonth, sDay, sHour, sMinute, sSecond, sMillisecond);
	},
	// truncate string example This is noderad Classic » This is noderad...
	strTruncate: function (str, length, join) {
		join = join || '...'
		var dots = str.length > length ? join : '';
		return str.substring(0, length) + dots;
	},

	toCurrency: function (amount, currency) {
		currency = currency || 'USD'
		return new Intl.NumberFormat("en-US", { style: "currency", currency: currency }).format(amount)
	},

	// convert string to lower case example This is NodeRad » this is noderad
	strLower: function (value) {
		value = value || '';
		return value.toLowerCase();
	},

	// convert string to upper case example This is NodeRad » THIS IS NODERAD
	strUpper: function (value) {
		value = value || '';
		return value.toUpperCase();
	},

	// convert the first char to upper and the rest to lower case example This is NodeRad » This is noderad
	strUcfirst: function (value) {
		value = value || '';
		return value.charAt(0).toUpperCase() + value.slice(1);
	},

	// Return a titlecased version of the string where words start with an uppercase character and 
	// the remaining characters are lowercase. 
	// example This is NodeRad » This is Noderad
	strTitle: function (value) {
		value = value || '';
		return value.replace(
			/\w\S*/g,
			function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			}
		);
	},

	// approxmiate a value to decimal point example 345.8993 » 345.90
	approximate: function (value, places) {
		places = places || 2;
		return value.toFixed(places)
	},

	toLocale: function (value) {
		return value.toLocaleString()
	},

	// return current date example 2018-02-12
	dateNow: function () {
		return moment().format('YYYY-MM-DD')
	},

	// return current date example 2019-01-01 11:31:23 PM
	dateTimeNow: function () {
		return moment().format('YYYY-MM-DD HH:mm:ss');
	},

	// return current date example 12:25:32
	timeNow: function () {
		return moment().format('HH:mm:ss')
	},

	// return current date example 12:25:32
	timestamp: function () {
		return Math.floor(new Date() / 1000);
	},

	// return the hash of a string
	passwordHash: function (passwordText, hashType) {
		hashType = hashType || 'bcrypt';
		if (hashType == 'bcrypt') {

			return bcrypt.hashSync(passwordText, 10);
		}
		else {
			return crypto.createHash(hashType).update(passwordText, 'utf8').digest('hex');
		}
	},
	passwordVerify: function (passwordText, passwordHash, hashType) {
		hashType = hashType || 'bcrypt';
		if (hashType == 'bcrypt') {
			return bcrypt.compareSync(passwordText, passwordHash);
		}
		else {
			let hash = crypto.createHash(hashType).update(passwordText, 'utf8').digest('hex');
			return passwordHash == hash;
		}
	},

	excelAutoWidth(worksheet, minimalWidth = 10) {
		worksheet.columns.forEach((column) => {
			let maxColumnLength = 0;
			column.eachCell({ includeEmpty: true }, (cell) => {
				maxColumnLength = Math.max(
					maxColumnLength,
					minimalWidth,
					cell.value ? cell.value.toString().length : 0
				);
			});
			column.width = maxColumnLength + 2;
		});
	},

	
};
