// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MyToken is ERC20 {
    constructor() ERC20("ZZToken", "ZZTk") {
        _mint(msg.sender, 100000 * 10 ** uint(decimals()));
    }
}
