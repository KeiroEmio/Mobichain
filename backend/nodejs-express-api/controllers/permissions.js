import { Router } from 'express';
import { body } from 'express-validator';
import validateFormData from '../helpers/validate_form.js';
import DB from '../models/db.js';


const router = Router();




/**
 * Route to list permissions records
 * @GET /permissions/index/{fieldname}/{fieldvalue}
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
			let searchFields = DB.Permissions.searchFields();
			where[DB.op.or] = searchFields;
			replacements.search = `%${search}%`;
		}
		
		if(queryFilters.length){
			where[DB.op.and] = queryFilters;
		}
		query.raw = true;
		query.where = where;
		query.replacements = replacements;
		query.order = DB.getOrderBy(req, 'permission_id', 'desc');
		query.attributes = DB.Permissions.listFields();
		let page = parseInt(req.query.page) || 1;
		let limit = parseInt(req.query.limit) || 10;
		let result = await DB.Permissions.paginate(query, page, limit);
		return res.ok(result);
	}
	catch(err) {
		return res.serverError(err);
	}
});


/**
 * Route to view Permissions record
 * @GET /permissions/view/{recid}
 */
router.get('/view/:recid', async (req, res) => {
	try{
		const recid = req.params.recid || null;
		const query = {}
		const where = {}
		where['permission_id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.Permissions.viewFields();
		let record = await DB.Permissions.findOne(query);
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
 * Route to insert Permissions record
 * @POST /permissions/add
 */
router.post('/add/', 
	[
		body('permission').not().isEmpty(),
		body('role_id').optional({nullable: true, checkFalsy: true}),
	], validateFormData
, async function (req, res) {
	try{
		let modeldata = req.getValidFormData();
		
		//save Permissions record
		let record = await DB.Permissions.create(modeldata);
		//await record.reload(); //reload the record from database
		const recid =  record['permission_id'];
		
		return res.ok(record);
	} catch(err){
		return res.serverError(err);
	}
});


/**
 * Route to get  Permissions record for edit
 * @GET /permissions/edit/{recid}
 */
router.get('/edit/:recid', async (req, res) => {
	try{
		const recid = req.params.recid;
		const query = {};
		const where = {};
		where['permission_id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.Permissions.editFields();
		let record = await DB.Permissions.findOne(query);
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
 * Route to update  Permissions record
 * @POST /permissions/edit/{recid}
 */
router.post('/edit/:recid', 
	[
		body('permission').optional({nullable: true}).not().isEmpty(),
		body('role_id').optional({nullable: true, checkFalsy: true}),
	], validateFormData
, async (req, res) => {
	try{
		const recid = req.params.recid;
		let modeldata = req.getValidFormData({ includeOptionals: true });
		const query = {};
		const where = {};
		where['permission_id'] = recid;
		query.raw = true;
		query.where = where;
		query.attributes = DB.Permissions.editFields();
		let record = await DB.Permissions.findOne(query);
		if(!record){
			return res.notFound();
		}
		await DB.Permissions.update(modeldata, {where: where});
		return res.ok(modeldata);
	}
	catch(err){
		return res.serverError(err);
	}
});


/**
 * Route to delete Permissions record by table primary key
 * Multi delete supported by recid separated by comma(,)
 * @GET /permissions/delete/{recid}
 */
router.get('/delete/:recid', async (req, res) => {
	try{
		const recid = (req.params.recid || '').split(',');
		const query = {};
		const where = {};
		where['permission_id'] = recid;
		query.raw = true;
		query.where = where;
		let records = await DB.Permissions.findAll(query);
		records.forEach(async (record) => { 
			//perform action on each record before delete
		});
		await DB.Permissions.destroy(query);
		return res.ok(recid);
	}
	catch(err){
		return res.serverError(err);
	}
});
export default router;
