import dotenv from 'dotenv';
dotenv.config();

// 打印环境变量
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY);
console.log("PRIVATE_KEY2:", process.env.PRIVATE_KEY2);
console.log("RPC_URL:", process.env.RPC_URL);
console.log("ATLAS_URL:", process.env.ATLAS_URL);
console.log("CONTRACT_ADDRESS:", process.env.CONTRACT_ADDRESS);
console.log("ERC20_ABI:", process.env.ERC20_ABI);
console.log("SPEOLIA_URL:", process.env.SPEOLIA_URL)
console.log("BASE_URL:", process.env.BASE_URL)

// 检查并打印是否成功加载环境变量
if (process.env.PRIVATE_KEY) {
    console.log("Environment variables are loaded correctly.");
} else {
    console.log("Failed to load environment variables.");
}
