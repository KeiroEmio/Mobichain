# Second Hand Project

This project contains both frontend and backend components for a Second Hand Project.

## Installation and Usage

### 1. Setup and Clone the Repository

First, create a directory and clone the repository:

`mkdir secondhandproject && cd secondhandproject  `

`git clone https://github.com/learnfortime/BlockChain-SecondHandProject.git  `

`cd BlockChain-SecondHandProject  `

### 2. Frontend Installation

`Navigate to the frontend directory and install the required dependencies:  `

`cd fronted`

`npm install`

### 3.Start the Frontend

You can start the frontend application with the following command:

`npm start`

After starting, the frontend should be accessible via a web browser.

### 4. Backend Installation

Navigate to the backend directory, install the dependencies, and start the backend server:

`cd ..`

`cd sencondhandproject/nodejs-express-api`

`npm install`

`npm start`

The backend server should now be running and able to communicate with the frontend.

Note
Ensure you have Node.js and npm installed on your system to follow through with the installation and usage steps.

这个 `README.md` 文件提供了详细的步骤，从设置目录、克隆仓库、安装前后端依赖，到启动前后端服务.

技术栈：

基础上没有管理员的概念

1.用户和用户点对点发送消息 参考技术 ---- xmpl(去中心化的网络) 绑定钱包唯一地址进行信息传输，基于 xmpl 网络下的

2.登录方面： 可使用 web3auth 进行用户登录，不仅可以进行钱包登录也可以使用 web2 的一些邮箱登录(相当于在 metamask 之类的钱包上加了一层 web2 的登录，最终还是通过 web2 账户再次创建一个钱包而已)，如：谷歌、qq 邮箱等等，也是基于 web3auth 网络上的；

3.用户支付方面：基于不同链的，比如 eth、solana、ton 的链进行支付，从而达到一种全链的支付系统 参考技术 ---- layer zero

4.加密方面：对合约里面敏感的信息进行加密，在 solidity0.8.13 版本中引入 fhenix 技术 一种状态类型 uint8 =》 euint8 string=> estring 类型参数进行加密的传递和引用，可以输入对于的收获地址，或者别的类型，当然我们线下不连接物联网，只需要另外一个钱包地址确认收获就可以了

5.数据存储，可以考虑不存在本地的数据库里，直接存储在 ipfs 或者 通过预言机的形式进行链下存储；
