import { Router } from 'express';
import DB from '../models/db.js';


const router = Router();


 /**
 * Route to get owner_option_list records
 * @GET /components_data/owner_option_list
 */
router.get('/owner_option_list', async (req, res) => {
	try{
		let sqltext = `SELECT address as value, address as label FROM user` ;
		
		let records = await DB.rawQueryList(sqltext);
		return res.ok(records);
	}
	catch(err){
		return res.serverError(err);
	}
});


 /**
 * Route to get role_id_option_list records
 * @GET /components_data/role_id_option_list
 */
router.get('/role_id_option_list', async (req, res) => {
	try{
		let sqltext = `SELECT role_id as value, role_name as label FROM roles` ;
		
		let records = await DB.rawQueryList(sqltext);
		return res.ok(records);
	}
	catch(err){
		return res.serverError(err);
	}
});


 /**
 * Route to check if field value already exist in a User table
 * @GET /components_data/user_email_exist/{fieldvalue}
 */
router.get('/user_email_exist/:fieldvalue', async (req, res) => {
	try{
		let val = req.params.fieldvalue
		let count = await DB.User.count({ where:{ 'email': val } });
		if(count > 0){
			return res.ok("true");
		}
		return res.ok("false");
	}
	catch(err){
		return res.serverError(err);
	}
});
export default router;
