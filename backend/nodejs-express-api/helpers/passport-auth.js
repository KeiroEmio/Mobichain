import passport from 'passport';
import PassportJwt from 'passport-jwt';
import DB from '../models/db.js';
import config from '../config.js';
export default function () {
	const JwtStrategy = PassportJwt.Strategy;
	const ExtractJwt = PassportJwt.ExtractJwt;
	const opts = {}
	opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
	opts.secretOrKey = config.auth.apiTokenSecret;
	passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
		try{
			let userId = jwt_payload.sub; //get user id from jwt
			if(userId){
				let user = await DB.User.findOne({
					where: { 
						id: userId 
					}, 
					attributes: { 
						exclude:['password', 'otp_code', 'otp_date', 'email_verified_at']
					} 
				});
				done(null, user);
			}
			else{
				done(null, null);
			}
		}
		catch(err){
			done(err, null);
		}
	}));
}
