
import DB from '../models/db.js';

/**
* Role Based Access Control
* @category  RBAC Helper
*/

let excludePages = ['account', 'components_data', 'upload']; //pages to exclude from access authorization check

class Rbac{
	static AUTHORIZED = "authorized";
	static FORBIDDEN = "forbidden";
	static UNKNOWN_ROLE = "unknown_role";

	userPages = [];
	userRoleId = null;

	constructor(role){
		this.userRoleId = role;
	}

	async getUserPages(){
		if(this.userRoleId){
			try{
				const query = { 
					where: { role_id: this.userRoleId },
					attributes: ['permission']
				}
				const records = await DB.Permissions.findAll(query);
				this.userPages = records.map(e => e.permission);
			}
			catch (ex) {
				console.error(ex)
			}
		}
		return this.userPages;
	}

	async getRoleName(){
		let roleName = '';
		if(this.userRoleId){
			try{
				roleName = await DB.Roles.findValue('role_name', { role_id: this.userRoleId });
				roleName = (roleName || '').toLowerCase();
			}
			catch (ex) {
				console.error(ex);
			}
		}
		return roleName;
	}
	
	getPageAccess (path){
		path = path.replace(/^\/|\/$/g, ''); // trim slashes
		let arrPath = path.split("/");
		let page = arrPath[0];

		if (excludePages.includes(page)) {
			return Rbac.AUTHORIZED;
		}
		let action = (arrPath[1] ? arrPath[1] : "index");
		
		if(this.userRoleId){
			if(this.userPages.includes(`${page}/${action}`)){
				return Rbac.AUTHORIZED;
			}
			else {
				return Rbac.FORBIDDEN;
			}
		}
		else{
			return Rbac.UNKNOWN_ROLE;
		}
	}
}

export default Rbac;
