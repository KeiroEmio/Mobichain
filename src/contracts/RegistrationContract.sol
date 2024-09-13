// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SecondHandMarket.sol";

contract RegistrationContract {
    struct User {
        string email;
        string password;
        address ethAddress;
    }

    address public tokenAddress;
    mapping(string => bool) public isEmailRegistered;
    mapping(address => User) public users;

    event UserRegistered(address indexed ethAddress, string email);
    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
    }

    function register(
        string memory _email,
        string memory _password
    ) public returns (address) {
        require(!isEmailRegistered[_email], "Email already registered");

        bytes32 salt = keccak256(abi.encodePacked(_email, block.timestamp));
        address ethAddress = createAccount(salt);

        users[ethAddress] = User(_email, _password, ethAddress);
        isEmailRegistered[_email] = true;

        emit UserRegistered(ethAddress, _email);
        return ethAddress;
    }

    function createAccount(bytes32 _salt) internal returns (address) {
        // 编码构造函数参数
        bytes memory bytecode = type(SecondHandMarket).creationCode;
        bytes memory bytecodeWithArgs = abi.encodePacked(
            bytecode,
            abi.encode(tokenAddress)
        );

        address accountAddress;

        assembly {
            accountAddress := create2(
                0,
                add(bytecodeWithArgs, 0x20),
                mload(bytecodeWithArgs),
                _salt
            )
            if iszero(extcodesize(accountAddress)) {
                revert(0, 0)
            }
        }

        return accountAddress;
    }
}
