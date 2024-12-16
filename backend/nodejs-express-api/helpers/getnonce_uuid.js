// const { v4: uuidv4 } = require('uuid'); // 引入UUID库
import { v4 as uuidv4 } from 'uuid'; 

// 生成UUID v4
function generateUUID() {
    const nonce = uuidv4(); // 使用UUID v4生成随机nonce
    console.log('UUID v4:', nonce);
    return nonce;
}

export default generateUUID;