import { Router } from 'express';
import { body } from 'express-validator';
import utils from '../helpers/utils.js';
import uploader from '../helpers/uploader.js';
import Rbac from '../helpers/rbac.js';
import validateFormData from '../helpers/validate_form.js';
import DB from '../models/db.js';
const router = Router();
/**
 * Route to view user account record
 * @GET /account
 */
router.get(['/', '/index'], async (req, res) => {
	try {
		let recid = req.user.id;
		let query = {};
		let where = {};
		let allowedRoles = ["admin", "user"];
		let userRole = req.userRoleName;
		if (!allowedRoles.includes(userRole)) {
			where['id'] = req.user.id; //filter only current records
		}
		where['id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.User.accountviewFields();
		let record = await DB.User.findOne(query);
		if (!record) {
			return res.notFound();
		}
		return res.ok(record);
	}
	catch (err) {
		return res.serverError(err);
	}
});
/**
 * Route to get  User record for edit
 * @GET /user/edit/{recid}
 */
router.get(['/edit'], async (req, res) => {
	try {
		const recid = req.user.id;
		const query = {};
		const where = {};
		let allowedRoles = ["admin"];
		let userRole = req.userRoleName;
		if (!allowedRoles.includes(userRole)) {
			where['id'] = req.user.id; //filter only current records
		}
		where['id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.User.accounteditFields();
		let record = await DB.User.findOne(query);
		if (!record) {
			return res.notFound();
		}
		return res.ok(record);
	}
	catch (err) {
		return res.serverError(err);
	}
});
/**
 * Route to update  User record
 * @POST /user/edit/{recid}
 */
router.post(['/edit'],
	[
		body('address').optional({ nullable: true, checkFalsy: true }),
		body('photo').optional({ nullable: true, checkFalsy: true }),
		body('token').optional({ nullable: true, checkFalsy: true }).isNumeric(),
		body('user_role_id').optional({ nullable: true, checkFalsy: true }),
	], validateFormData
	, async (req, res) => {
		try {
			const recid = req.user.id;
			let modeldata = req.getValidFormData({ includeOptionals: true });
			// move uploaded file from temp directory to destination directory
			if (modeldata.photo !== undefined) {
				const fileInfo = uploader.moveUploadedFiles(modeldata.photo, 'photo');
				modeldata.photo = fileInfo.filepath;
			}
			const query = {};
			const where = {};
			let allowedRoles = ["admin"];
			let userRole = req.userRoleName;
			if (!allowedRoles.includes(userRole)) {
				where['id'] = req.user.id; //filter only current records
			}
			where['id'] = recid;
			query.raw = true;
			query.where = where;
			query.attributes = DB.User.accounteditFields();
			let record = await DB.User.findOne(query);
			if (!record) {
				return res.notFound();
			}
			await DB.User.update(modeldata, { where: where });
			return res.ok(modeldata);
		}
		catch (err) {
			return res.serverError(err);
		}
	});
router.get('/currentuserdata', async function (req, res) {
	const user = req.user;
	const userRole = user.user_role_id;
	const rbac = new Rbac(userRole);
	const pages = await rbac.getUserPages();
	const roles = await rbac.getRoleName();
	return res.ok({ user, pages, roles });
});
/**
 * Route to change user password
 * @POST /account
 */
router.post('/changepassword',
	[
		body('oldpassword').not().isEmpty(),
		body('newpassword').not().isEmpty(),
		body('confirmpassword').not().isEmpty().custom((value, { req }) => (value === req.body.newpassword))
	], validateFormData, async function (req, res) {
		console.log('req,', req)
		try {
			let oldPassword = req.body.oldpassword;
			let newPassword = req.body.newpassword;
			let userId = req.user.id;
			let query = {};
			let where = {
				id: userId,
			};
			query.raw = true;
			query.where = where;
			query.attributes = ['password'];
			let user = await DB.User.findOne(query);
			let currentPasswordHash = user.password;
			if (!utils.passwordVerify(oldPassword, currentPasswordHash)) {
				return res.badRequest("Current password is incorrect");
			}
			let modeldata = {
				password: utils.passwordHash(newPassword)
			}
			await DB.User.update(modeldata, { where: where });
			return res.ok("Password change completed");
		}
		catch (err) {
			return res.serverError(err);
		}
	});
export default router;
