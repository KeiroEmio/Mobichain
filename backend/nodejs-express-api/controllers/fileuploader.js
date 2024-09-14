/**
 * Upload controller module
 * @category  Controller / Route
*/
import { Router } from 'express';
import config from '../config.js';
import uploader from '../helpers/uploader.js';
import { fileUploadMiddleware } from '../helpers/upload_middleware.js';

const router = Router();

router.post('/upload/:fieldname', fileUploadMiddleware(), async (req, res, next) => {
	if (req?.files.length) {
		const uploadedFiles = req.files;
		const publicDir = config.app.publicDir;
		let uploadedPaths = uploadedFiles.map(file => {
			let filePath = file.path.replaceAll("\\", "/");
			filePath = filePath.replaceAll(`${publicDir}/`, "");
			return filePath;
		});
		const allPaths = uploadedPaths.toString();
		return res.ok(allPaths);
	}
	else {
		return res.badRequest('No file uploaded.')
	}
});

/**
 * remove temporary uploaded file when deleted by client
 * @category  Controller / Route
*/
router.post('/remove_temp_file', function (req, res, next) {
	let file = req.body.temp_file;
	if (file) {
		uploader.removeTempFile(file);
		return res.ok("File deleted");
	}
	return res.badRequest("Invalid temp file")
});
export default router;