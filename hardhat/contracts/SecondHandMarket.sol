// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SecondHandMarket {
    IERC20 public token;
    address public tokenAddress;
    uint256 public nextPhoneId = 0;

    struct Phone {
        uint256 id;
        string brand;
        string model;
        uint256 price;
        address owner;
        bool isSold;
    }

    mapping(uint256 => Phone) public phones;
    uint256 public phoneCount;

    event PhoneSold(
        uint256 id,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );
    event PhoneSell(Phone);

    //构造函数，当前手机数量都是为0
    //引用erc20代币进行交易
    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
        tokenAddress = _tokenAddress;
        phoneCount = 0;
    }

    //卖手机，在网上交易
    function sellPhone(
        string memory _brand,
        string memory _model,
        uint256 _price,
        address owner
    ) public {
        phones[phoneCount] = Phone(
            phoneCount,
            _brand,
            _model,
            _price,
            owner,
            false
        );
        emit PhoneSell(phones[phoneCount]);
        phoneCount++;
    }

    //通过代币进行交易
    function buyPhone(uint256 _id, address _buyer) public {
        require(_id >= 0 && _id < phoneCount, "Invalid phone ID");

        Phone storage phone = phones[_id];
        require(!phone.isSold, "Phone is already sold");

        // 确保买家拥有足够的代币
        require(token.balanceOf(_buyer) >= phone.price, "Insufficient balance");

        // 调用代币合约的 approve 函数，授权合约能够转移相应数量的代币给卖家
        require(token.approve(address(this), phone.price), "Approve failed");

        // 从买家账户转移代币给卖家
        require(
            token.transferFrom(_buyer, phone.owner, phone.price),
            "Transfer failed"
        );

        // 标记手机已售出
        phone.isSold = true;

        emit PhoneSold(_id, _buyer, phone.owner, phone.price);
    }

    //通过索引获取手机信息
    function getPhone(uint256 index) public view returns (Phone memory) {
        require(index < phoneCount, "Index out of bounds");
        return phones[index];
    }

    //获取当前账户余额的getTokenBalance函数
    function getTokenBalance(
        address _owner
    ) public view returns (uint256, address) {
        return (token.balanceOf(_owner), _owner);
    }

    function viewMsgSend() public view returns (address) {
        return msg.sender;
    }

    //授权
    function approve(address spender, uint256 value) external returns (bool) {
        return token.approve(spender, value);
    }
}
