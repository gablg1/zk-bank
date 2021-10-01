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
  uint256 principl;
  uint256 borrowIndex;
  uint256 initialEpoch;
}

contract Bank is ERC20 {
  using WadRayMath for uint256;
  using SafeMath for uint256;

  mapping (address => Loan) _loans;
  uint256 _secondsPerEpoch;
  uint256 _lastAccrualBlock;
  uint256 _wad_borrowIndex;

  // The term of the loan is fixed per instance of the Bank contract
  uint256 _epochsToPay;

  // Interest Rate Calculation:
  // utilization = totalBorrowed / (availableCash + totalBorrowed)
  // Protocol per epoch Interest rate IRp = interestRateAlpha + utilization * interestRateBeta

  uint256 _availableCash;
  uint256 _totalBorrowBalance;
  uint256 _wad_interestRateAlpha;
  uint256 _wad_interestRateBeta;

  constructor() {
    _availableCash = 0;
    _totalBorrowBalance = 0;
    _wad_interestRateAlpha = WadRayMath.wad().mul(5).div(100); // 5%
    _wad_interestRateBeta = WadRayMath.wad().mul(40).div(100); // 40%

    _epochsToPay = 30 days;
    _lastAccrualBlock =  getBlockNumber();
    _wad_borrowIndex = WadRayMath.wad();
    _secondsPerEpoch = 15;
  }


  function delinquencyData(address borrower) public view returns (DelinquencyData) {
    uint256 amount;

  }

  function accrueInterest() public virtual {
    (_lastAccrualBlock, _wad_borrowIndex, _totalBorrowBalance) = interestAccrualResults();
  }

  function interestAccrualResults() public view returns (uint256, uint256, uint256) {
    uint256 currentBlock = getBlockNumber();
    uint256 epochsElapsed = currentBlock.sub(_lastAccrualBlock);

    // Calculate new borrow index
    // newBorrowIndex = oldBorrowIndex * (1 + r)^(epochsElapsed)
    // newBorrowBalance = oldBorrowBalance * (1 + r)^(epochsElapsed)
    uint256 interestFactor = WadRayAlpha.wad().plus(currentInterest()).wadExp(epochsElapsed)

    return (currentBlock, _wad_borrowIndex.wadMul(interestFactor), _totalBorrowBalance.wadMul(interestFactor));
  }

  function borrow(address borrower, uint256 amount) public virtual {
    require(_loans[borrower].principal == 0, "Can only borrow once at a time");
    require(_creditScorer.credit(borrower) > amount, "Not enough credit to borrow this amount");
    require(_availableCash > amount, "Not enough cash in the bank");

    accrueInterest();

    _loans[borrower] = Loan(amount, _wad_borrowIndex, getBlockNumber());
    _availableCash = _availableCash.sub(amount);
    _totalBorrowed = _totalBorrowed.add(amount);

    (bool borrowSuccess, ) = borrower.call{value: amount}("");
    require(borrowSuccess, "Transfer to borrower failed.");
  }

  function lend(address lender) public payable {
    accrueInterest();

    require(msg.value > 0, "Must send value > 0");

    _mint(lender, msg.value.wadDiv(exchangeRate()));
    _availableCash = _availableCash.add(msg.value);

  }

  function withdraw(address lender, uint256 amount) public virtual {
    accrueInterest();

    require(amount <= valueOfLoan(lender), "Lender does not have enough balance to withdraw");
    require(amount <= _availableCash, "Not enough available cash to withdraw");

    _availableCash = _availableCash.sub(amount);
    (bool withdrawSuccess, ) = lender.call{value: amount}("");
    require(withdrawSuccess, "Transfer to lender failed.");

  }

  function valueOfLoan(address lender) public returns (uint256) {
    return balanceOf(lender).wadMul(exchangeRate());
  }

  function exchangeRate() public returns (uint256) {
    if (totalSupply() == 0) {
      return WadRayMath.wad();
    }

    ( , uint256 borrowIndex, uint256 borrowBalance) = interestAccrualResults();
    return _availableCash.add(borrowBalance).div(totalSupply());
  }


  function repay(address lToken, int256 tokenId) public virtual {

  }

  function currentInterest() public view returns Fraction {
    return _wad_interestRateAlpha.sum(utilization().wadMul(_wad_interestRateBeta));
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
