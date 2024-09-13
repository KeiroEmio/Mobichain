// 引入 dotenv 配置
require('dotenv').config();

// 打印环境变量
function printEnvironmentVariables() {
    console.log('环境变量:');
    console.log('SEPOLIA_URL:', process.env.SPEOLIA_URL);
    console.log('PRIVATE_KEY:', process.env.PRIVATE_KEY);
    console.log('ETHERSCAN_API_KEY:', process.env.ETHERSCAN_API_KEY);
}

// 调用函数
printEnvironmentVariables();
