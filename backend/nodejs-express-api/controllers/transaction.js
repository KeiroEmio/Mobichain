import { Router } from 'express';
import { body } from 'express-validator';
import validateFormData from '../helpers/validate_form.js';
import DB from '../models/db.js';


const router = Router();




/**
 * Route to list transaction records
 * @GET /transaction/index/{fieldname}/{fieldvalue}
 */
router.get(['/', '/index/:fieldname?/:fieldvalue?'], async (req, res) => {  
	try{
		const query = {};
		let queryFilters = [];
		let where = {};
		let replacements = {};
		let fieldName = req.params.fieldname;
		let fieldValue = req.params.fieldvalue;
		
		if (fieldName){
			queryFilters.push(DB.filterBy(fieldName, fieldValue));
		}
		let search = req.query.search;
		if(search){
			let searchFields = DB.Transaction.searchFields();
			where[DB.op.or] = searchFields;
			replacements.search = `%${search}%`;
		}
		
		if(queryFilters.length){
			where[DB.op.and] = queryFilters;
		}
		query.raw = true;
		query.where = where;
		query.replacements = replacements;
		query.order = DB.getOrderBy(req, 'tid', 'desc');
		query.attributes = DB.Transaction.listFields();
		let page = parseInt(req.query.page) || 1;
		let limit = parseInt(req.query.limit) || 10;
		let result = await DB.Transaction.paginate(query, page, limit);
		return res.ok(result);
	}
	catch(err) {
		return res.serverError(err);
	}
});


/**
 * Route to view Transaction record
 * @GET /transaction/view/{recid}
 */
router.get('/view/:recid', async (req, res) => {
	try{
		const recid = req.params.recid || null;
		const query = {}
		const where = {}
		where['tid'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.Transaction.viewFields();
		let record = await DB.Transaction.findOne(query);
		if(!record){
			return res.notFound();
		}
		return res.ok(record);
	}
	catch(err){
		return res.serverError(err);
	}
});


/**
 * Route to insert Transaction record
 * @POST /transaction/add
 */
router.post('/add/', 
	[
		body('tid').not().isEmpty().isNumeric(),
		body('timestamp').optional({nullable: true, checkFalsy: true}),
		body('transactioncontent').optional({nullable: true, checkFalsy: true}),
	], validateFormData
, async function (req, res) {
	try{
		let modeldata = req.getValidFormData();
		
		//save Transaction record
		let record = await DB.Transaction.create(modeldata);
		//await record.reload(); //reload the record from database
		const recid =  record['tid'];
		
		return res.ok(record);
	} catch(err){
		return res.serverError(err);
	}
});


/**
 * Route to get  Transaction record for edit
 * @GET /transaction/edit/{recid}
 */
router.get('/edit/:recid', async (req, res) => {
	try{
		const recid = req.params.recid;
		const query = {};
		const where = {};
		where['tid'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.Transaction.editFields();
		let record = await DB.Transaction.findOne(query);
		if(!record){
			return res.notFound();
		}
		return res.ok(record);
	}
	catch(err){
		return res.serverError(err);
	}
});


/**
 * Route to update  Transaction record
 * @POST /transaction/edit/{recid}
 */
router.post('/edit/:recid', 
	[
		body('tid').optional({nullable: true}).not().isEmpty().isNumeric(),
		body('timestamp').optional({nullable: true, checkFalsy: true}),
		body('transactioncontent').optional({nullable: true, checkFalsy: true}),
	], validateFormData
, async (req, res) => {
	try{
		const recid = req.params.recid;
		let modeldata = req.getValidFormData({ includeOptionals: true });
		const query = {};
		const where = {};
		where['tid'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.Transaction.editFields();
		let record = await DB.Transaction.findOne(query);
		if(!record){
			return res.notFound();
		}
		await DB.Transaction.update(modeldata, {where: where});
		return res.ok(modeldata);
	}
	catch(err){
		return res.serverError(err);
	}
});


/**
 * Route to delete Transaction record by table primary key
 * Multi delete supported by recid separated by comma(,)
 * @GET /transaction/delete/{recid}
 */
router.get('/delete/:recid', async (req, res) => {
	try{
		const recid = (req.params.recid || '').split(',');
		const query = {};
		const where = {};
		where['tid'] = recid;
		query.raw = true;
		query.where = where;
		let records = await DB.Transaction.findAll(query);
		records.forEach(async (record) => { 
			//perform action on each record before delete
		});
		await DB.Transaction.destroy(query);
		return res.ok(recid);
	}
	catch(err){
		return res.serverError(err);
	}
});
export default router;
