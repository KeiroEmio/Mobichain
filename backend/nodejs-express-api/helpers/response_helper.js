/**
 * 统一的响应处理助手
 */

// 发送成功响应
export const sendValid = (res, data = null, message = 'Success') => {
    return res.status(200).json({
        ok: true,
        message,
        data
    });
};

// 发送错误响应
export const sendError = (res, error, status = 500) => {
    const message = error.message || '服务器内部错误';
    return res.status(status).json({
        ok: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
};

// 记录未找到响应
export const recordNotFound = (res, message = '记录未找到') => {
    return res.status(404).json({
        ok: false,
        message
    });
};

// 发送未授权响应
export const unauthorized = (res, message = '未授权访问') => {
    return res.status(401).json({
        ok: false,
        message
    });
};

// 发送参数验证错误响应
export const validationError = (res, errors) => {
    return res.status(422).json({
        ok: false,
        message: '参数验证失败',
        errors
    });
};

// 发送禁止访问响应
export const forbidden = (res, message = '禁止访问') => {
    return res.status(403).json({
        ok: false,
        message
    });
};