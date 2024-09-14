import { Router } from 'express';
import { body } from 'express-validator';
import validateFormData from '../helpers/validate_form.js';
import DB from '../models/db.js';


const router = Router();




/**
 * Route to list chatmessages records
 * @GET /chatmessages/index/{fieldname}/{fieldvalue}
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
			let searchFields = DB.ChatMessages.searchFields();
			where[DB.op.or] = searchFields;
			replacements.search = `%${search}%`;
		}
		
		if(queryFilters.length){
			where[DB.op.and] = queryFilters;
		}
		query.raw = true;
		query.where = where;
		query.replacements = replacements;
		query.order = DB.getOrderBy(req, 'msg_id', 'desc');
		query.attributes = DB.ChatMessages.listFields();
		let page = parseInt(req.query.page) || 1;
		let limit = parseInt(req.query.limit) || 10;
		let result = await DB.ChatMessages.paginate(query, page, limit);
		return res.ok(result);
	}
	catch(err) {
		return res.serverError(err);
	}
});


/**
 * Route to view ChatMessages record
 * @GET /chatmessages/view/{recid}
 */
router.get('/view/:recid', async (req, res) => {
	try{
		const recid = req.params.recid || null;
		const query = {}
		const where = {}
		where['msg_id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.ChatMessages.viewFields();
		let record = await DB.ChatMessages.findOne(query);
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
 * Route to insert ChatMessages record
 * @POST /chatmessages/add
 */
router.post('/add/', 
	[
		body('sender_address').optional({nullable: true, checkFalsy: true}),
		body('receiver_address').optional({nullable: true, checkFalsy: true}),
		body('message_text').optional({nullable: true, checkFalsy: true}),
	], validateFormData
, async function (req, res) {
	try{
		let modeldata = req.getValidFormData();
		
		//save ChatMessages record
		let record = await DB.ChatMessages.create(modeldata);
		//await record.reload(); //reload the record from database
		const recid =  record['msg_id'];
		
		return res.ok(record);
	} catch(err){
		return res.serverError(err);
	}
});


/**
 * Route to get  ChatMessages record for edit
 * @GET /chatmessages/edit/{recid}
 */
router.get('/edit/:recid', async (req, res) => {
	try{
		const recid = req.params.recid;
		const query = {};
		const where = {};
		where['msg_id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.ChatMessages.editFields();
		let record = await DB.ChatMessages.findOne(query);
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
 * Route to update  ChatMessages record
 * @POST /chatmessages/edit/{recid}
 */
router.post('/edit/:recid', 
	[
		body('sender_address').optional({nullable: true, checkFalsy: true}),
		body('receiver_address').optional({nullable: true, checkFalsy: true}),
		body('message_text').optional({nullable: true, checkFalsy: true}),
	], validateFormData
, async (req, res) => {
	try{
		const recid = req.params.recid;
		let modeldata = req.getValidFormData({ includeOptionals: true });
		const query = {};
		const where = {};
		where['msg_id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.ChatMessages.editFields();
		let record = await DB.ChatMessages.findOne(query);
		if(!record){
			return res.notFound();
		}
		await DB.ChatMessages.update(modeldata, {where: where});
		return res.ok(modeldata);
	}
	catch(err){
		return res.serverError(err);
	}
});


/**
 * Route to delete ChatMessages record by table primary key
 * Multi delete supported by recid separated by comma(,)
 * @GET /chatmessages/delete/{recid}
 */
router.get('/delete/:recid', async (req, res) => {
	try{
		const recid = (req.params.recid || '').split(',');
		const query = {};
		const where = {};
		where['msg_id'] = recid;
		query.raw = true;
		query.where = where;
		let records = await DB.ChatMessages.findAll(query);
		records.forEach(async (record) => { 
			//perform action on each record before delete
		});
		await DB.ChatMessages.destroy(query);
		return res.ok(recid);
	}
	catch(err){
		return res.serverError(err);
	}
});
export default router;
