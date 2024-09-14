import { Router } from 'express';


const router = Router();
router.get(['/', '/index'], async function (req, res)
{
    res.render('pages/index/welcome.html');
});
export default router;
