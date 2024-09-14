import { Router } from 'express';
import { body } from 'express-validator';
import validateFormData from '../helpers/validate_form.js';
import DB from '../models/db.js';


const router = Router();




/**
 * Route to list roles records
 * @GET /roles/index/{fieldname}/{fieldvalue}
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
			let searchFields = DB.Roles.searchFields();
			where[DB.op.or] = searchFields;
			replacements.search = `%${search}%`;
		}
		
		if(queryFilters.length){
			where[DB.op.and] = queryFilters;
		}
		query.raw = true;
		query.where = where;
		query.replacements = replacements;
		query.order = DB.getOrderBy(req, 'role_id', 'desc');
		query.attributes = DB.Roles.listFields();
		let page = parseInt(req.query.page) || 1;
		let limit = parseInt(req.query.limit) || 10;
		let result = await DB.Roles.paginate(query, page, limit);
		return res.ok(result);
	}
	catch(err) {
		return res.serverError(err);
	}
});


/**
 * Route to view Roles record
 * @GET /roles/view/{recid}
 */
router.get('/view/:recid', async (req, res) => {
	try{
		const recid = req.params.recid || null;
		const query = {}
		const where = {}
		where['role_id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.Roles.viewFields();
		let record = await DB.Roles.findOne(query);
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
 * Route to insert Roles record
 * @POST /roles/add
 */
router.post('/add/', 
	[
		body('role_name').not().isEmpty(),
	], validateFormData
, async function (req, res) {
	try{
		let modeldata = req.getValidFormData();
		
		//save Roles record
		let record = await DB.Roles.create(modeldata);
		//await record.reload(); //reload the record from database
		const recid =  record['role_id'];
		
		return res.ok(record);
	} catch(err){
		return res.serverError(err);
	}
});


/**
 * Route to get  Roles record for edit
 * @GET /roles/edit/{recid}
 */
router.get('/edit/:recid', async (req, res) => {
	try{
		const recid = req.params.recid;
		const query = {};
		const where = {};
		where['role_id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.Roles.editFields();
		let record = await DB.Roles.findOne(query);
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
 * Route to update  Roles record
 * @POST /roles/edit/{recid}
 */
router.post('/edit/:recid', 
	[
		body('role_name').optional({nullable: true}).not().isEmpty(),
	], validateFormData
, async (req, res) => {
	try{
		const recid = req.params.recid;
		let modeldata = req.getValidFormData({ includeOptionals: true });
		const query = {};
		const where = {};
		where['role_id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.Roles.editFields();
		let record = await DB.Roles.findOne(query);
		if(!record){
			return res.notFound();
		}
		await DB.Roles.update(modeldata, {where: where});
		return res.ok(modeldata);
	}
	catch(err){
		return res.serverError(err);
	}
});


/**
 * Route to delete Roles record by table primary key
 * Multi delete supported by recid separated by comma(,)
 * @GET /roles/delete/{recid}
 */
router.get('/delete/:recid', async (req, res) => {
	try{
		const recid = (req.params.recid || '').split(',');
		const query = {};
		const where = {};
		where['role_id'] = recid;
		query.raw = true;
		query.where = where;
		let records = await DB.Roles.findAll(query);
		records.forEach(async (record) => { 
			//perform action on each record before delete
		});
		await DB.Roles.destroy(query);
		return res.ok(recid);
	}
	catch(err){
		return res.serverError(err);
	}
});
export default router;
