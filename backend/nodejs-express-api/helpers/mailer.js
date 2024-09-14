import nodemailer from 'nodemailer';
import config from '../config.js';

export default {
	sendMail: async function (recEmail, subject, msg) {
		let transporter = nodemailer.createTransport({
			host: config.mail.host,
			port: config.mail.port,
			secure: config.mail.secure,
			auth: {
				user: config.mail.username,
				pass: config.mail.password
			}
		});

		let sender = `"${config.mail.sendername}" <${config.mail.senderemail}>`
		let mailOptions = {
			from: sender,
			to: recEmail,
			subject: subject,
			html: msg
		};
		const info = await transporter.sendMail(mailOptions);
		return info;
	}
};