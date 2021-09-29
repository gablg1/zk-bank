pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT


import "./ExponentialNoError.sol";


struct Fraction {
   string num;
   string den;
}

struct DelinquencyData {
  uint256 balance;
  uint256 sinceWhen;
}

struct Loan {
  uint256 initialPrincipal;
  uint256 balance;
  uint256 borrowIndex;
  uint256 initialEpoch;
  uint256 epochsToPay;
}

contract Bank {
  using WadRayMath for uint256;

  mapping (address => Loan) _loans;
  uint256 _availableCash;
  uint256 _totalBorrowed;
  uint256 _wad_baseInterestRate;
  uint256 _epochsToPay;
  uint256 _lastAccrualBlock;
  uint256 _wad_borrowIndex;

  constructor() {
    _availableCash = 0;
    _totalBorrowed = 0;
    _baseAPR = WadRayMath.wad().mul(5).div(100);
    _epochsToPay = 30 days;
    _lastAccrualBlock =  getBlockNumber();
    _wad_borrowIndex = WadRayMath.wad();
  }


  function delinquencyData(address borrower) public view returns (DelinquencyData) {
    uint256 amount;

  }

  function accrueInterest() public virtual {
    uint256 currentBlock = getBlockNumber();
    uint256 epochsElapsed = sub(currentBlock, _lastAccrualBlock);

    uint256 _wad_interestRate;

    // Calculate new borrow index
    // newBorrowIndex = oldBorrowIndex * (1 + r)^(epochsElapsed)
    _wad_borrowIndex = _wad_borrowIndex.wadMul(_wad_interestRate.wadExp(epochsElapsed));



  }


  function borrow(address borrower, uint256 amount) public virtual {
    require(_principal[borrower] == 0, "Can only borrow once at a time");
    require(_creditScorer.credit(borrower) > amount, "Not enough credit to borrow this amount");

    _loans[borrower] = Loan(amount, 0, getBlockNumber(), _epochsToPay);
  }

  function lend(uint256 amount) public virtual {
  }


  function repay(address lToken, int256 tokenId) public virtual {
  }

  function currentAPR() public view returns Fraction {
    return sumFrac(_baseInterestRate, mulFrac(utilization(), Fraction(120, 100)))
  }

  function availableCash() public view returns uint256 {
    return _availableCash;
  }

  function totalBorrowed() public view returns uint256 {
    return _totalBorrowed;
  }

  function utilization() public view returns Fraction {
    uint256 total = totalBorrowed();
    return divFrac(total, sumFrac(total, availableCash()))
  }

  function getBlockNumber() internal view returns (uint) {
      return block.number;
  }

}
