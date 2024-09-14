import { Router } from 'express';
import { body } from 'express-validator';
import utils from '../helpers/utils.js';
import uploader from '../helpers/uploader.js';
import validateFormData from '../helpers/validate_form.js';
import Decimal from 'decimal.js';
import DB from '../models/db.js';


const router = Router();




/**
 * Route to list user records
 * @GET /user/index/{fieldname}/{fieldvalue}
 */
router.get(['/', '/index/:fieldname?/:fieldvalue?'], async (req, res) => {
	try {
		console.log('req.params:', req.params)
		const query = {};
		let queryFilters = [];
		let where = {};
		let replacements = {};
		let fieldName = req.params.fieldname;
		let fieldValue = req.params.fieldvalue;

		if (fieldName) {
			queryFilters.push(DB.filterBy(fieldName, fieldValue));
		}
		let search = req.query.search;
		if (search) {
			let searchFields = DB.User.searchFields();
			console.log('searchFields:', searchFields)
			where[DB.op.or] = searchFields;
			replacements.search = `%${search}%`;
		}
		let allowedRoles = ["admin", "user"];
		let userRole = req.userRoleName;
		if (!allowedRoles.includes(userRole)) {
			where['id'] = req.user.id; //filter only current records
		}

		if (queryFilters.length) {
			where[DB.op.and] = queryFilters;
		}
		query.raw = true;
		query.where = where;
		query.replacements = replacements;
		query.order = DB.getOrderBy(req, 'id', 'asc');
		query.attributes = DB.User.listFields();
		let page = parseInt(req.query.page) || 1;
		let limit = parseInt(req.query.limit) || 10;
		let result = await DB.User.paginate(query, page, limit);
		return res.ok(result);
	}
	catch (err) {
		return res.serverError(err);
	}
});

router.get('/get', async (req, res) => {
	try {
		console.log('query:', req.params);
		console.log('query:', req.query);
		console.log('query:', req.body);
		const { search, page = 1, limit = 10 } = req.query;
		// 使用正则表达式去除所有空格
		const trimmedSearch = search ? search.replace(/\s+/g, '') : null;
		console.log('Original search:', search);
		console.log('Trimmed search:', trimmedSearch, 'Page:', page, 'Limit:', limit);
		const where = {};

		if (trimmedSearch) {
			const searchFields = DB.User.searchFields();
			//DB.
			where[DB.op.or] = searchFields.map(field => ({
				[field]: { [DB.op.like]: `%${trimmedSearch}%` }
			}));
		}

		const options = {
			where: where,
			attributes: DB.User.listFields(),
			order: [['id', 'ASC']],
			limit: parseInt(limit, 10),
			offset: (parseInt(page, 10) - 1) * parseInt(limit, 10)
		};

		const result = await DB.User.findAndCountAll(options);

		res.status(200).json({
			data: result.rows,
			totalRecords: result.count,
			currentPage: parseInt(page, 10),
			totalPages: Math.ceil(result.count / parseInt(limit, 10))
		});
	} catch (err) {
		console.error("Error while searching Android records:", err);
		res.status(500).json({ message: 'Internal server error' });
	}
});

/**
 * Route to view User record
 * @GET /user/view/{recid}
 */
router.get('/view/:recid', async (req, res) => {
	try {
		const recid = req.params.recid || null;
		const query = {}
		const where = {}
		let allowedRoles = ["admin", "user"];
		let userRole = req.userRoleName;
		if (!allowedRoles.includes(userRole)) {
			where['id'] = req.user.id; //filter only current records
		}
		where['id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.User.viewFields();
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
 * Route to insert User record
 * @POST /user/add
 */
router.post('/add/',
	[
		body('email').not().isEmpty().isEmail(),
		body('password').not().isEmpty(),
		body('confirm_password', 'Passwords do not match').custom((value, { req }) => (value === req.body.password)),
	], validateFormData
	, async function (req, res) {
		try {
			let modeldata = req.getValidFormData();
			modeldata.password = utils.passwordHash(modeldata.password);

			// set default role for user
			const roleId = await DB.Roles.findValue('role_id', { role_name: 'User' });
			modeldata['user_role_id'] = roleId;

			// check if email already exist.
			let emailCount = await DB.User.count({ where: { 'email': modeldata.email } });
			if (emailCount > 0) {
				return res.badRequest(`${modeldata.email} already exist.`);
			}

			//save User record
			let record = await DB.User.create(modeldata);
			//await record.reload(); //reload the record from database
			const recid = record['id'];

			return res.ok(record);
		} catch (err) {
			return res.serverError(err);
		}
	});


/**
 * Route to get  User record for edit
 * @GET /user/edit/{recid}
 */
router.get('/edit/:recid', async (req, res) => {
	try {
		const recid = req.params.recid;
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
		query.attributes = DB.User.editFields();
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
router.post('/edit/:recid',
	[
		body('address').optional({ nullable: true, checkFalsy: true }),
		body('photo').optional({ nullable: true, checkFalsy: true }),
		body('token').optional({ nullable: true, checkFalsy: true }).isNumeric(),
		body('user_role_id').optional({ nullable: true, checkFalsy: true }),
	], validateFormData
	, async (req, res) => {
		try {
			const recid = req.params.recid;
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
			query.attributes = DB.User.editFields();
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


/**
 * Route to delete User record by table primary key
 * Multi delete supported by recid separated by comma(,)
 * @GET /user/delete/{recid}
 */
router.delete('/delete/:recid', async (req, res) => {
	try {
		console.log('req:', req.params)
		const recid = (req.params.recid || '').split(',');
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
		let records = await DB.User.findAll(query);
		records.forEach(async (record) => {
			//perform action on each record before delete
		});
		await DB.User.destroy(query);
		return res.ok(recid);
	}
	catch (err) {
		return res.serverError(err);
	}
});


/**
 * Route to edit User token by table primary key
 * Multi delete supported by recid separated by comma(,)
 * @POST /user/delete/{recid}
 */
router.post('/token/', async (req, res) => {
	const { userId, token } = req.body;
	console.log('userId, token:', userId, token);

	if (typeof userId !== 'number' || typeof token !== 'number') {
		return res.status(400).json({ message: 'Invalid input, user ID and token change must be numbers.' });
	}
	if (!/^\-?\d+(\.\d{1,2})?$/.test(token.toString())) {
		return res.status(400).json({ message: 'Token change must have up to two decimal places.' });
	}

	if (/^\-?\d+(\.\d{3,})$/.test(token.toString())) {
		return res.status(400).json({ message: 'Token change cannot have more than two decimal places.' });
	}

	try {
		const user = await DB.User.findByPk(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found.' });
		}

		const newTokenAmount = new Decimal(user.token).plus(new Decimal(token));
		if (newTokenAmount.lessThan(0)) {
			return res.status(400).json({ message: 'Token balance cannot go negative.' });
		}

		user.token = newTokenAmount.toNumber();
		await user.save();

		res.status(200).json({
			message: 'Token updated successfully.',
			token: user.token
		});
	} catch (error) {
		console.error('Failed to update token:', error);
		res.status(500).json({ message: 'Failed to update token.', error: error.message });
	}
});

export default router;
