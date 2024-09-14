import passport from 'passport';
import Rbac from './rbac.js';
import passportLogin from './passport-auth.js';
const publicPages = ['auth', 'components_data', 'fileuploader', 's3uploader', ];
async function passportJwtLogin (req, res, next) {
    passportLogin();
    passport.authenticate('jwt', async (err, user, info) => {
        req.login(user, { session: false }, async (error) => { });
        return next();
    }
    )(req, res, next);
}
async function authMiddleware(req, res, next) {
    try {
        if (req.user) {
			const userRoleId = req.user.user_role_id;
            const rbac = new Rbac(userRoleId);
            await rbac.getUserPages();
            const pageAccess = rbac.getPageAccess(req.path);
            const roleName = await rbac.getRoleName();
			req.pageAccess = pageAccess;
			req.userRoleId = userRoleId;
            req.userRoleName = roleName;
            switch(roleName) {
				case 'admin':
					req.isAdmin = true;
					break;
				case 'user':
					req.isUser = true;
					break;
				default:
					req.isGuest = true;
			}
        }
		const arrPath = req.path.split("/").filter(Boolean);
		const page = arrPath[0];
		const action = arrPath[1] || "index";
		const pagePath = `${page}/${action}`;
		const isPublicPage = publicPages.includes(pagePath) || publicPages.includes(page);
		if (isPublicPage || req.pageAccess == Rbac.AUTHORIZED) {
            return next();
        }
		else if (req.pageAccess == Rbac.FORBIDDEN) {
			return res.forbidden();
		}
		else if (req.pageAccess == Rbac.UNKNOWN_ROLE) {
			return res.forbidden("Unknown Role");
		}
        return res.unauthorized();
    }
    catch (err) {
        return res.serverError(err);
    }
}
export { passportJwtLogin, authMiddleware };
