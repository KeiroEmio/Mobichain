
import config from '../config.js';
import uploader from './uploader.js';

function fileUploadMiddleware(fieldName, fileFormName = 'file') {
    return function (req, res, next) {
        let uploadField = fieldName || req.params.fieldname;
        const uploadSettings = config.upload[uploadField];
        if (!uploadSettings) {
            return res.badRequest(`No upload settings found for ${uploadField}`);
        }
        uploader.upload(uploadField, fileFormName)(req, res, () => {
            return next();
        });
    }
}

function s3UploadMiddleware(fieldName, fileFormName = 'file') {
    return function (req, res, next) {
        let uploadField = fieldName || req.params.fieldname;
        const uploadSettings = config.upload[uploadField];
        if (!uploadSettings) {
            return res.badRequest(`No upload settings found for ${uploadField}`);
        }
        uploader.s3upload(uploadField, fileFormName)(req, res, () => {
            return next();
        });
    }
}

export { fileUploadMiddleware, s3UploadMiddleware };