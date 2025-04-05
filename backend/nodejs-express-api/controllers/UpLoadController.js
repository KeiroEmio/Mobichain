import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Router } from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dest = path.join(__dirname, '..', 'assets', 'uploads', 'goods');
// const destAvatar = path.join(__dirname, '..', 'assets', 'uploads', 'avatar');
const destProducts = path.join(__dirname, '..', 'assets', 'uploads', 'products');
if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
}

router.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));

router.post('/goods', async function (req, res) {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        const file = req.files.formData;
        if (!file) {
            return res.status(400).send('No file uploaded under the key \'file\'.');
        }

        const filePath = path.join(dest, file.name);
        console.log('Uploading file to:', filePath);

        file.mv(filePath, function (err) {
            if (err) {
                console.error('Error moving file:', err);
                return res.status(500).send(err);
            }
            res.json({ 
                ok: true, 
                message: 'File uploaded successfully',
                path: `/uploads/goods/${file.name}` // 返回相对路径
            });
        });
    } catch (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ ok: false, error: 'Server error' });
    }
});

router.post('/products', async function (req, res) {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        const file = req.files.formData;
        if (!file) {
            return res.status(400).send('No file uploaded under the key \'formData\'.');
        }

        const filePath = path.join(destProducts, file.name);
        console.log('Uploading product image to:', filePath);

        file.mv(filePath, function (err) {
            if (err) {
                console.error('Error moving file:', err);
                return res.status(500).send(err);
            }
            res.json({ 
                ok: true, 
                message: 'Product image uploaded successfully',
                path: `/uploads/products/${file.name}`
            });
        });
    } catch (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ ok: false, error: 'Server error' });
    }
});

export default router;