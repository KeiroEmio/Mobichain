import mongoose from 'mongoose'; // 导入Mongoose库，用于MongoDB的交互
import dotenv from 'dotenv'; // 导入dotenv库，用于加载环境变量
import UsersMap from './models/usersMap.js'; // 导入UsersMap模型，更新为你的模型路径

dotenv.config(); // 从.env文件中加载环境变量

// 定义一个异步函数，用于删除集合中的重复用户
const removeDuplicateUsers = async () => {
    const usersMaps = await UsersMap.find(); // 查找所有的UsersMap文档

    for (const usersMap of usersMaps) {
        // 使用Set来帮助识别和存储唯一的用户ID
        const uniqueUsers = [];
        const userIds = new Set();

        for (const user of usersMap.users) {
            if (!userIds.has(user.id)) { // 如果用户ID尚未添加到Set中
                uniqueUsers.push(user); // 添加用户到uniqueUsers数组
                userIds.add(user.id); // 将用户ID添加到Set中
            }
        }

        // 如果uniqueUsers数组长度与原users数组不同，说明存在重复
        if (uniqueUsers.length !== usersMap.users.length) {
            usersMap.users = uniqueUsers; // 更新UsersMap文档的用户数组
            await usersMap.save(); // 保存更新到数据库
            console.log(`Duplicates removed for UsersMap with owner: ${usersMap.owner}`); // 打印日志
        }
    }

    console.log('Duplicate removal complete'); // 打印重复删除完成的日志
};

// 定义一个异步函数，用于在'users.id'上创建唯一索引
const createUniqueIndex = async () => {
    await UsersMap.collection.createIndex({ 'users.id': 1 }, { unique: true, sparse: true }); // 创建索引
    console.log('Unique index created on users.id'); // 打印索引创建成功的日志
};

// 使用Mongoose连接到MongoDB数据库
mongoose
    .connect(process.env.ATLAS_URL, {
        useNewUrlParser: true, // 用于保持与旧版本的兼容性
        useUnifiedTopology: true, // 用于保持与旧版本的兼容性
    })
    .then(async () => {
        console.log("DB Connection Successful"); // 打印数据库连接成功的日志

        await removeDuplicateUsers(); // 调用删除重复用户的函数

        await createUniqueIndex(); // 调用创建唯一索引的函数

        mongoose.connection.close(); // 关闭数据库连接
    })
    .catch((err) => { // 捕获并打印连接过程中的错误
        console.log(err.message);
    });