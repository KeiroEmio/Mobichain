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
    uint256 public nextProductId = 0;

    struct Product {
        uint256 id;
        string name;
        string description;
        string category;
        string brand;
        uint256 price;
        address owner;
        bool isSold;
        bool isReceived;
        address buyer;
    }

    mapping(uint256 => Product) public products;
    uint256 public productCount;

    event ProductSold(
        uint256 id,
        address indexed buyer,
        address indexed seller,
        string name,
        string description,
        string category,
        string brand,
        uint256 price
    );

    event ProductListed(Product);

    event ProductReceived(
        uint256 id,
        address indexed buyer,
        address indexed seller,
        uint256 timestamp
    );

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
        tokenAddress = _tokenAddress;
        productCount = 1;
    }

    function publishProduct(
        string memory _name,
        string memory _description,
        string memory _category,
        uint256 _price,
        string memory _brand,
        address owner
    ) public returns (Product memory) {
        require(bytes(_name).length > 0, "Product name cannot be empty");
        require(_price > 0, "Price must be greater than zero");
        require(owner != address(0), "Invalid owner address");

        Product memory newProduct = Product(
            productCount,
            _name,
            _description,
            _category,
            _brand,
            _price,
            owner,
            false,
            false,
            address(0)
        );
        products[productCount] = newProduct;
        emit ProductListed(newProduct);
        productCount++;
        return newProduct;
    }

    function buyProduct(uint256 _id, address _buyer) public {
        require(_id >= 0 && _id < productCount, "Invalid product ID");
        Product storage product = products[_id];
        require(!product.isSold, "Product is already sold");
        require(
            token.balanceOf(_buyer) >= product.price,
            "Insufficient balance"
        );
        require(token.approve(address(this), product.price), "Approve failed");
        require(
            token.transferFrom(_buyer, product.owner, product.price),
            "Transfer failed"
        );

        product.isSold = true;
        product.buyer = _buyer;
        emit ProductSold(
            _id,
            _buyer,
            product.owner,
            product.name,
            product.description,
            product.category,
            product.brand,
            product.price
        );
    }

    function confirmReceived(uint256 _id) public {
        require(_id >= 0 && _id < productCount, "Invalid product ID");
        Product storage product = products[_id];
        require(product.isSold, "Product is not sold yet");
        require(!product.isReceived, "Product is already received");
        require(product.buyer == msg.sender, "Only buyer can confirm receipt");

        product.isReceived = true;
        emit ProductReceived(
            _id,
            product.buyer,
            product.owner,
            block.timestamp
        );
    }

    function getProduct(uint256 index) public view returns (Product memory) {
        require(index < productCount, "Index out of bounds");
        return products[index];
    }

    function getTokenBalance(
        address _owner
    ) public view returns (uint256, address) {
        return (token.balanceOf(_owner), _owner);
    }

    function viewMsgSend() public view returns (address) {
        return msg.sender;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        return token.approve(spender, value);
    }
}
