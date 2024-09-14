import { Router } from 'express';
import { body } from 'express-validator';
import uploader from '../helpers/uploader.js';
import validateFormData from '../helpers/validate_form.js';
import DB from '../models/db.js';
import { Sequelize } from '../models/basemodel.js';


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
			const searchFields = DB.Iphone.searchFields();
			where[Sequelize.Op.or] = searchFields.map(field => ({
				[field]: { [Sequelize.Op.like]: `%${trimmedSearch}%` }
			}));
		}

		const options = {
			where: where,
			attributes: DB.Iphone.listFields(),
			order: [['id', 'ASC']],
			limit: parseInt(limit, 10),
			offset: (parseInt(page, 10) - 1) * parseInt(limit, 10)
		};

		const result = await DB.Iphone.findAndCountAll(options);

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
 * Route to list iphone records
 * @GET /iphone/index/{fieldname}/{fieldvalue}
 */
router.get(['/', '/index/:fieldname?/:fieldvalue?'], async (req, res) => {
	try {
		const query = {};
		let queryFilters = [];
		let where = {};
		let replacements = {};
		let fieldName = req.params.fieldname;
		let fieldValue = req.params.fieldvalue;

		where.issold = 0;

		if (fieldName) {
			queryFilters.push(DB.filterBy(fieldName, fieldValue));
		}
		let search = req.query.search;
		if (search) {
			let searchFields = DB.Iphone.searchFields();
			where[DB.op.or] = searchFields;
			replacements.search = `%${search}%`;
		}

		if (queryFilters.length) {
			where[DB.op.and] = queryFilters;
		}
		query.raw = true;
		query.where = where;
		query.replacements = replacements;
		query.order = DB.getOrderBy(req, 'id', 'desc');
		query.attributes = DB.Iphone.listFields();
		let page = parseInt(req.query.page) || 1;
		let limit = parseInt(req.query.limit) || 10;
		let result = await DB.Iphone.paginate(query, page, limit);
		return res.ok(result);
	}
	catch (err) {
		return res.serverError(err);
	}
});


/**
 * Route to view Iphone record
 * @GET /iphone/view/{recid}
 */
router.get('/view/:recid', async (req, res) => {
	try {
		const recid = req.params.recid || null;
		const query = {}
		const where = {}
		where['id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.Iphone.viewFields();
		let record = await DB.Iphone.findOne(query);
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
 * Route to list iPhone records
 * @GET /android/search
 */
router.post('/search', async (req, res) => {
	try {
		console.log('req.body:', req.body);
		const { brand, priceRange, searchTerm } = req.body;
		const query = {
			raw: true,
			where: {},
			order: [['id', 'desc']],
			attributes: DB.Iphone.listFields()
		};

		// 处理品牌过滤
		if (brand) {
			query.where['brand'] = brand;
		}

		// 处理价格范围过滤
		if (priceRange) {
			const [minPrice, maxPrice] = priceRange.split('~').map(Number);
			if (!isNaN(minPrice) && !isNaN(maxPrice)) {
				query.where['price'] = {
					[DB.op.gte]: minPrice,
					[DB.op.lte]: maxPrice
				};
			} else {
				return res.status(400).json({ error: "Invalid price range format" });
			}
		}

		// 处理搜索关键词
		if (searchTerm) {
			const searchFields = DB.Iphone.searchFields();
			query.where[DB.op.or] = searchFields.map(field => ({
				[field]: { [DB.op.like]: `%${searchTerm}%` }
			}));
		}

		// 分页设置
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const offset = (page - 1) * limit;

		// 执行查询
		const result = await DB.Iphone.findAndCountAll({
			...query,
			limit,
			offset
		});

		return res.json({
			data: result.rows,
			total: result.count,
			page,
			limit
		});
	} catch (err) {
		console.error(err);
		return res.status(500).send('Internal Server Error');
	}
});





/**
 * Route to insert Iphone record
 * @POST /iphone/add
 */
router.post('/add/',
	[
		body('brand').not().isEmpty(),
		body('model').not().isEmpty(),
		body('price').not().isEmpty().isNumeric(),
		body('owner').not().isEmpty(),
		body('transactiontime').optional({ nullable: true, checkFalsy: true }),
		body('issold').not().isEmpty().isNumeric(),
		body('imagepath').optional({ nullable: true, checkFalsy: true }),
	], validateFormData
	, async function (req, res) {
		try {
			let modeldata = req.getValidFormData();

			// move uploaded file from temp directory to destination directory
			if (modeldata.imagepath !== undefined) {
				const fileInfo = uploader.moveUploadedFiles(modeldata.imagepath, 'imagepath');
				modeldata.imagepath = fileInfo.filepath;
			}

			//save Iphone record
			let record = await DB.Iphone.create(modeldata);
			//await record.reload(); //reload the record from database
			const recid = record['id'];

			return res.ok(record);
		} catch (err) {
			return res.serverError(err);
		}
	});

/**
* Route to  iphine brands records
* @POST /android/brands
*/
router.post('/brands', async (req, res) => {
	try {
		const brands = await DB.Iphone.findAll({
			attributes: [
				[Sequelize.fn('DISTINCT', Sequelize.col('brand')), 'brand']
			],
			where: {
				issold: 0 // 只选择未售出的品牌
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
 * Route to get  Iphone record for edit
 * @GET /iphone/edit/{recid}
 */
router.get('/edit/:recid', async (req, res) => {
	try {
		const recid = req.params.recid;
		const query = {};
		const where = {};
		where['id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.Iphone.editFields();
		let record = await DB.Iphone.findOne(query);
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
 * Route to update  Iphone record
 * @POST /iphone/edit/{recid}
 */
router.post('/edit/:recid',
	[
		body('brand').optional({ nullable: true }).not().isEmpty(),
		body('model').optional({ nullable: true }).not().isEmpty(),
		body('price').optional({ nullable: true }).not().isEmpty().isNumeric(),
		body('owner').optional({ nullable: true }).not().isEmpty(),
		body('transactiontime').optional({ nullable: true, checkFalsy: true }),
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
			query.attributes = DB.Iphone.editFields();
			let record = await DB.Iphone.findOne(query);
			if (!record) {
				return res.notFound();
			}
			await DB.Iphone.update(modeldata, { where: where });
			return res.ok(modeldata);
		}
		catch (err) {
			return res.serverError(err);
		}
	});


/**
 * Route to delete Iphone record by table primary key
 * Multi delete supported by recid separated by comma(,)
 * @GET /iphone/delete/{recid}
 */
router.get('/delete/:recid', async (req, res) => {
	try {
		const recid = (req.params.recid || '').split(',');
		const query = {};
		const where = {};
		where['id'] = recid;
		query.raw = true;
		query.where = where;
		let records = await DB.Iphone.findAll(query);
		records.forEach(async (record) => {
			//perform action on each record before delete
		});
		await DB.Iphone.destroy(query);
		return res.ok(recid);
	}
	catch (err) {
		return res.serverError(err);
	}
});

/**
 * Route to view Android record
 * @POST /iphone/confirmReceipt/{id}
 */

router.post('/confirmReceipt/:id', async (req, res) => {
	const { id } = req.params;
	console.log('id:', id)
	try {
		if (id) {
			const result = await DB.Iphone.update(
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
})
export default router;
