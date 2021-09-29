pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT


struct Fraction {
   string num;
   string den;
}

contract Bank {
  CreditRequest[] _requests;
  constructor() {
    _name = givenName;
    _symbol = givenSymbol;
  }

  function requestCreditLine(uint256 minAmount, uint256 maxAmount, uint256 epochsToPay, Fraction interestPerEpoch) public virtual {
    require(maxAmount > minAmount);
    
  }

  function lend(uint256 requestId) public virtual {
  }

  function repay(address lToken, int256 tokenId) public virtual {
  }
}
