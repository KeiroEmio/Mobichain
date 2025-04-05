// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataLogger {
    event DataLogged(
        uint indexed transactionId,
        uint indexed productId,
        uint buyerId,
        uint sellerId,
        string deviceType,
        string brand,
        string model,
        uint transactionAmount,
        uint transactionTime
    );

    struct TransactionData {
        uint productId;
        uint buyerId;
        uint sellerId;
        string deviceType;
        string brand;
        string model;
        uint transactionAmount;
        uint transactionTime;
    }

    mapping(uint => TransactionData) public transactions;

    uint public transactionCount;

    function logTransaction(
        uint _productId,
        string memory _deviceType,
        string memory _brand,
        string memory _model,
        uint _buyerId,
        uint _sellerId,
        uint _transactionAmount,
        uint _transactionTime
    ) public {
        transactionCount++;

        transactions[transactionCount] = TransactionData(
            _productId,
            _buyerId,
            _sellerId,
            _deviceType,
            _brand,
            _model,
            _transactionAmount,
            _transactionTime
        );

        emit DataLogged(
            transactionCount,
            _productId,
            _buyerId,
            _sellerId,
            _deviceType,
            _brand,
            _model,
            _transactionAmount,
            _transactionTime
        );
    }

    function getTransaction(
        uint _transactionId
    ) public view returns (TransactionData memory) {
        return transactions[_transactionId];
    }
}
