import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Router } from 'express';
import fileUpload from 'express-fileupload';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dest = __dirname + "../../../../fronted/public/asserts/images/";

router.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));

router.post('/upload', async function (req, res) {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        console.log('req.files:', req.files)
        const file = req.files.formData;
        console.log('file:', file)
        if (!file) {
            return res.status(400).send('No file uploaded under the key \'file\'.');
        }

        file.mv(dest + file.name, function (err) {
            if (err) {
                return res.status(500).send(err);
            }
            res.json({ ok: true, message: 'File uploaded successfully' });
        });
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ ok: false, error: 'Server error' });
    }
});

export default router;
