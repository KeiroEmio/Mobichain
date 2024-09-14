import { validationResult, matchedData } from 'express-validator';
async function validateFormData(req, res, next) {
    const validation = validationResult(req); // get validation errors if any
    if (!validation.isEmpty()) {
        let errorMsgs = [];
        validation.errors.forEach(error => {
            let fieldName = error.param;
            let message = error.msg.toString();
            errorMsgs.push(`${fieldName}: ${message}`);
        });
        return res.badRequest(errorMsgs);
    }

    req.getValidFormData = function (options = { includeOptionals: false }) {
        return matchedData(req, { locations: ['body'], ...options })
    }

    return next();
}
export default validateFormData;