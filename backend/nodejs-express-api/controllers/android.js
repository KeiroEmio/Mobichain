import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import uploader from '../helpers/uploader.js';
import validateFormData from '../helpers/validate_form.js';
import DB from '../models/db.js';
import { Sequelize, sequelize } from '../models/basemodel.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../public/assets/images')); // 确保这个路径正确
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});

const upload = multer({ storage: storage });

const router = Router();

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
			const searchFields = DB.Android.searchFields();
			where[Sequelize.Op.or] = searchFields.map(field => ({
				[field]: { [Sequelize.Op.like]: `%${trimmedSearch}%` }
			}));
		}

		const options = {
			where: where,
			attributes: DB.Android.listFields(),
			order: [['id', 'ASC']],
			limit: parseInt(limit, 10),
			offset: (parseInt(page, 10) - 1) * parseInt(limit, 10)
		};

		const result = await DB.Android.findAndCountAll(options);

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
 * Route to list android records
 * @GET /android/index/{fieldname}/{fieldvalue}
 */
router.get(['/', '/index/:fieldname?/:fieldvalue?'], async (req, res) => {
	try {
		const query = {};
		let queryFilters = [];
		let where = {};
		let replacements = {};
		let fieldName = req.params.fieldname;
		let fieldValue = req.params.fieldvalue;
		console.log('req.params:', req.params)
		console.log('req.query.search:', req.query.search)

		// 添加限制条件，排除 issold 不为 0 的记录
		where.issold = 0;

		if (fieldName) {
			queryFilters.push(DB.filterBy(fieldName, fieldValue));
		}
		let search = req.query.search;
		if (search) {
			let searchFields = DB.Android.searchFields().map(field => ({
				[field]: DB.op.like
			}));
			where[DB.op.or] = searchFields.map(field => {
				const key = Object.keys(field)[0];
				return {
					[key]: { [DB.op.like]: `%${search}%` }
				};
			});
			replacements.search = `%${search}%`;
		}

		if (queryFilters.length) {
			where[DB.op.and] = queryFilters;
		}
		query.raw = true;
		query.where = where;
		query.replacements = replacements;
		query.order = DB.getOrderBy(req, 'id', 'desc');
		query.attributes = DB.Android.listFields();
		let page = parseInt(req.query.page) || 1;
		let limit = parseInt(req.query.limit) || 10;
		let result = await DB.Android.paginate(query, page, limit);
		return res.ok(result);
	}
	catch (err) {
		return res.serverError(err);
	}
});



/**
 * Route to  android brands records
 * @POST /android/brands
 */
router.post('/brands', async (req, res) => {
	try {
		const brands = await DB.Android.findAll({
			attributes: [
				[Sequelize.fn('DISTINCT', Sequelize.col('brand')), 'brand']
			],
			where: {
				issold: 0
			},
			order: [
				['brand', 'ASC'] // 根据品牌名称进行排序
			],
			raw: true
		});

		return res.json({ brands: brands.map(brand => brand.brand) });
	} catch (err) {
		console.error('Error fetching brands:', err);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
});


/**
 * Route to list android records
 * @GET /android/search
 */
router.post('/search', async (req, res) => {
	try {
		const query = {};
		let where = {};
		let replacements = {};
		const { brand, priceRange } = req.body;
		console.log('req.body:', req.body)

		if (brand) {
			where['brand'] = brand;
		}

		if (priceRange) {
			const [minPrice, maxPrice] = priceRange.split('~').map(Number);
			where['price'] = {
				[DB.op.gte]: minPrice,
				[DB.op.lte]: maxPrice
			};
		}

		let search = req.query.search;
		if (search) {
			let searchFields = DB.Android.searchFields();
			where[DB.op.or] = searchFields.map(field => ({ [field]: { [DB.op.like]: `%${search}%` } }));
		}

		query.raw = true;
		query.where = where;
		query.replacements = replacements;
		query.order = DB.getOrderBy(req, 'id', 'desc');
		query.attributes = DB.Android.listFields();

		let page = parseInt(req.query.page) || 1;
		let limit = parseInt(req.query.limit) || 10;

		let result = await DB.Android.paginate(query, page, limit);
		return res.ok(result);
	} catch (err) {
		return res.serverError(err);
	}
});

router.post('/brands', async (req, rep) => {

})

/**
 * Route to view Android record
 * @GET /android/view/{recid}
 */
router.get('/view/:recid', async (req, res) => {
	try {
		const recid = req.params.recid || null;
		const query = {}
		const where = {}
		where['id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.Android.viewFields();
		let record = await DB.Android.findOne(query);
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
 * Route to insert Android record
 * @POST /android/add
 */
router.post('/add', upload.single('image'), [
	body('brand').not().isEmpty(),
	body('model').not().isEmpty(),
	body('price').not().isEmpty().isNumeric(),
	body('owner').not().isEmpty(),
	body('issold').not().isEmpty().isNumeric(),
	body('imagepath').optional({ nullable: true, checkFalsy: true }),
], async function (req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		let modeldata = req.body;
		// 如果文件上传成功，req.file.path 将包含新文件的路径
		if (req.file) {
			modeldata.imagepath = req.file.path;  // 将文件路径保存在数据库
		}

		// 保存到数据库
		let record = await DB.Android.create(modeldata);
		res.status(201).json(record);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});


/**
 * Route to get  Android record for edit
 * @GET /android/edit/{recid}
 */
router.get('/edit/:recid', async (req, res) => {
	try {
		const recid = req.params.recid;
		const query = {};
		const where = {};
		where['id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.Android.editFields();
		let record = await DB.Android.findOne(query);
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
 * Route to update  Android record
 * @POST /android/edit/{recid}
 */
router.post('/edit/:recid',
	[
		body('brand').optional({ nullable: true }).not().isEmpty(),
		body('model').optional({ nullable: true }).not().isEmpty(),
		body('price').optional({ nullable: true }).not().isEmpty().isNumeric(),
		body('owner').optional({ nullable: true }).not().isEmpty(),
		body('issold').optional({ nullable: true }).not().isEmpty().isNumeric(),
		body('imagepath').optional({ nullable: true, checkFalsy: true }),
	], validateFormData
	, async (req, res) => {
		try {
			const recid = req.params.recid;
			let modeldata = req.getValidFormData({ includeOptionals: true });

			// move uploaded file from temp directory to destination directory
			if (modeldata.imagepath !== undefined) {
				const fileInfo = uploader.moveUploadedFiles(modeldata.imagepath, 'imagepath');
				modeldata.imagepath = fileInfo.filepath;
			}
			const query = {};
			const where = {};
			where['id'] = recid;
			query.raw = true;
			query.where = where;
			query.attributes = DB.Android.editFields();
			let record = await DB.Android.findOne(query);
			if (!record) {
				return res.notFound();
			}
			await DB.Android.update(modeldata, { where: where });
			return res.ok(modeldata);
		}
		catch (err) {
			return res.serverError(err);
		}
	});


/**
 * Route to delete Android record by table primary key
 * Multi delete supported by recid separated by comma(,)
 * @GET /android/delete/{recid}
 */
router.get('/delete/:recid', async (req, res) => {
	try {
		const recid = (req.params.recid || '').split(',');
		const query = {};
		const where = {};
		where['id'] = recid;
		query.raw = true;
		query.where = where;
		let records = await DB.Android.findAll(query);
		records.forEach(async (record) => {
			//perform action on each record before delete
		});
		await DB.Android.destroy(query);
		return res.ok(recid);
	}
	catch (err) {
		return res.serverError(err);
	}
});

/**
 * Route to view Android record
 * @GET /android/view/{onwer}
 */
router.post('/view/:owner', async (req, res) => {
	try {
		const owner = req.params.owner || null;

		if (!owner) {
			return res.badRequest({ message: 'Owner is required' });
		}

		const query = {
			raw: true,
			where: {
				owner: owner,
				issold: 1 // 添加条件，确保 issold 为 0
			},
			attributes: DB.Android.viewFields() // 假设 Android 和 iPhone 的字段一致
		};

		const androidQuery = DB.Android.findAll(query);
		const iphoneQuery = DB.Iphone.findAll(query);

		// 并行执行两个查询
		const [androidRecords, iphoneRecords] = await Promise.all([androidQuery, iphoneQuery]);

		// 合并结果
		const records = [...androidRecords, ...iphoneRecords];

		if (records.length === 0) {
			return res.notFound();
		}

		return res.ok(records);
	} catch (err) {
		return res.serverError(err);
	}
});



router.post('/selling/:owner', async (req, res) => {
	try {
		const owner = req.params.owner || null;

		if (!owner) {
			return res.badRequest({ message: 'Owner is required' });
		}

		const query = {
			raw: true,
			where: {
				owner: owner,
				issold: 0
			},
			attributes: DB.Android.viewFields()
		};

		const androidQuery = DB.Android.findAll(query);
		const iphoneQuery = DB.Iphone.findAll(query);

		const [androidRecords, iphoneRecords] = await Promise.all([androidQuery, iphoneQuery]);

		const records = [...androidRecords, ...iphoneRecords];

		if (records.length === 0) {
			return res.notFound();
		}

		return res.ok(records);
	} catch (err) {
		return res.serverError(err);
	}
});


/**
 * Route to view Android record
 * @POST /android/confirmReceipt/{id}
 */

router.post('/confirmReceipt/:id', async (req, res) => {
	const { id } = req.params;
	console.log('id:', id)
	try {
		if (id) {
			const result = await DB.Android.update(
				{ confirmedReceipt: 1 },
				{ where: { id: id } }
			);

			if (result[0] > 0) {
				res.status(200).send({ message: `Successfully updated confirmReceipt for ID ${id}.` });
			} else {
				res.status(404).send({ message: `No record found with ID ${id} or no update needed.` });
			}
		} else {
			res.status(400).send({ message: 'Missing ID in the request.' });
		}
	} catch (error) {
		console.error('Error during the update process:', error);
		res.status(500).send({ message: 'Internal Server Error' });
	}
});
export default router;
