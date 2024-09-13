// 引入chai库和Hardhat的ethers对象
const { expect } = require("chai");
const { ethers } = require("hardhat");
const deployedAddress = require("../deployedAddresses.json")
describe("MyToken Test", function () {
  let token;
  let owner;
  let addr1;

  // 在每个测试用例之前执行
  beforeEach(async function () {
    // 获取签名者，第一个签名者通常是部署合约的账户
    [owner, addr1] = await ethers.getSigners();

    // 假设MyToken合约已经部署，并且你有它的地址和ABI
    const TokenAddress = deployedAddress.MyToken; // 使用实际的合约地址替换此值
    const MyTokenData = require("../artifacts/contracts/ERC20.sol/MyToken.json");

    // 使用Hardhat的ethers对象来创建合约实例
    token = new ethers.Contract(TokenAddress, MyTokenData.abi, owner);
    console.log("token:", token);
  });

  it("Should have correct total supply", async function () {
    // 例如，调用合约的totalSupply函数
    const totalSupply = await token.totalSupply();
    // 假设合约的初始总供应量为10000
    expect(await totalSupply.toString()).to.equal("10000");
  });

  // 你可以添加更多的测试用例...
});
