import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 配置 multer 存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'assets/uploads/avatar';
        // 确保目录存在
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('只允许上传图片文件'));
    }
};

const uploadConfig = {
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制 5MB
    },
    fileFilter: fileFilter
};

// 创建上传中间件
const uploadMiddleware = multer(uploadConfig);

// 导出单文件上传中间件
export const uploadSingle = (fieldName) => uploadMiddleware.single(fieldName);

// 导出多文件上传中间件
export const uploadMultiple = (fieldName, maxCount) => uploadMiddleware.array(fieldName, maxCount);

// 处理上传错误的中间件
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: '文件大小不能超过 5MB' });
        }
        return res.status(400).json({ message: '文件上传错误：' + err.message });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};

// 获取文件URL的辅助函数
export const getFileUrl = (filename) => {
    return `/uploads/images/${filename}`;
};

export default {
    uploadSingle,
    uploadMultiple,
    handleUploadError,
    getFileUrl
};