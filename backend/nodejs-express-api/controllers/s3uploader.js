/**
 * Upload controller module
 * @category  Controller / Route
*/
import { Router } from 'express';
import { s3UploadMiddleware } from '../helpers/upload_middleware.js';

const router = Router();
router.post('/upload/:fieldname', s3UploadMiddleware(), async (req, res, next) => {
	if (req.files) {
		const uploadedFiles = req.files;
		let uploadedPaths = uploadedFiles.map(file => file.location).toString();
		return res.ok(uploadedPaths);
	}
	else {
		return res.badRequest('No file uploaded.')
	}
});

/**
 * remove temporary uploaded file when deleted by client
 * @category  Controller / Route
*/
router.post('/remove_temp_file', function (req, res) {
	// not implemented
	return res.badRequest("Operation not implemented")
});

export default router;