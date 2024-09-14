import { Router } from 'express';


const router = Router();
router.post('/',  (req, res) => {
	let title = req.body.title || '';
	data = req.body.data || ''
	res.render('layouts/report.ejs', {title, data, config});
});
export default router;
