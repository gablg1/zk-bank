pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT


import "./WadRayMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CreditScorer.sol";



struct DelinquencyData {
  uint256 balance;
  uint256 sinceWhen;
}

struct Loan {
  uint256 principal;
  uint256 balance;
  uint256 wad_borrowIndex;
  uint256 initialEpoch;
}

contract Bank is ERC20, Ownable, Pausable {
  using WadRayMath for uint256;

  CreditScorer _creditScorer;

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
  uint256 _reserves;
  uint256 _wad_interestRateAlpha;
  uint256 _wad_interestRateBeta;

  constructor(string memory name, string memory symbol, address creditScorer) ERC20(name, symbol) {
    _creditScorer = CreditScorer(creditScorer);
    (_availableCash, _totalBorrowBalance, _reserves) = (0, 0, 0);
    _wad_interestRateAlpha = WadRayMath.wad() * 5 / 100; // 5%
    _wad_interestRateBeta = WadRayMath.wad() * 40 / 100; // 40%

    _secondsPerEpoch = 15;
    _epochsToPay  = 30 * 24 * 60 * 60;
    _lastAccrualBlock =  getBlockNumber();
    _wad_borrowIndex = WadRayMath.wad();
  }


  function delinquencyData(address) public pure returns (DelinquencyData memory) {
    revert("TODO");
  }

  function accrueInterest() public virtual {
    (_lastAccrualBlock, _wad_borrowIndex, _totalBorrowBalance) = interestAccrualResults();
  }

  function interestAccrualResults() public view returns (uint256, uint256, uint256) {
    uint256 currentBlock = getBlockNumber();
    uint256 epochsElapsed = currentBlock - _lastAccrualBlock;

    // Calculate new borrow index
    // newBorrowIndex = oldBorrowIndex * (1 + r)^(epochsElapsed)
    // newBorrowBalance = oldBorrowBalance * (1 + r)^(epochsElapsed)
    // r = alpha + beta * totalBorrowed / (totalBorrowed + availableCash)
    uint256 utilization = _totalBorrowBalance.wadDiv(_totalBorrowBalance + _availableCash);
    uint256 r = _wad_interestRateAlpha + utilization.wadMul(_wad_interestRateBeta);

    uint256 interestFactor = (WadRayMath.wad() + r).wadExp(epochsElapsed);

    return (currentBlock, _wad_borrowIndex.wadMul(interestFactor), _totalBorrowBalance.wadMul(interestFactor));
  }

  function borrow(address borrower, uint256 amount) public virtual whenNotPaused {
    accrueInterest();

    require(_loans[borrower].balance == 0, "Can only borrow once at a time");
    require(_creditScorer.credit(borrower) > amount, "Not enough credit to borrow this amount");
    require(_availableCash > amount, "Not enough cash in the bank");

    _loans[borrower] = Loan(amount, amount, _wad_borrowIndex, getBlockNumber());
    _availableCash -= amount;
    _totalBorrowBalance += amount;

    (bool borrowSuccess, ) = borrower.call{value: amount}("");
    require(borrowSuccess, "Transfer to borrower failed.");
  }

  function repay(address borrower) public payable whenNotPaused {
    accrueInterest();

    require(_loans[borrower].balance > 0, "Borrower does not have an outstanding loan");

    uint256 balanceOwed = _loans[borrower].balance.wadMul(_wad_borrowIndex).wadDiv(_loans[borrower].wad_borrowIndex);

    // Repaying the entire loan
    if (msg.value >= balanceOwed) {
      _loans[borrower] = Loan(0, 0, 0, 0);

      // Any excedent becomes a reserve
      _reserves += msg.value - balanceOwed;
      _availableCash += balanceOwed;
    // Repaying part of the loan
    } else {
      _loans[borrower].balance = balanceOwed - msg.value;
      _loans[borrower].wad_borrowIndex = _wad_borrowIndex;
      _availableCash += msg.value;
    }
  }

  function lend(address lender) public payable whenNotPaused {
    accrueInterest();

    require(msg.value > 0, "Must send value > 0");

    _mint(lender, msg.value.wadDiv(exchangeRate()));
    _availableCash += msg.value;
  }

  function withdraw(address lender, uint256 amount) public virtual whenNotPaused {
    accrueInterest();

    require(amount <= valueOfLoan(lender), "Lender does not have enough balance to withdraw");
    require(amount <= _availableCash, "Not enough available cash to withdraw");

    _burn(lender, amount.wadDiv(exchangeRate()));

    _availableCash -= amount;
    (bool withdrawSuccess, ) = lender.call{value: amount}("");
    require(withdrawSuccess, "Transfer to lender failed.");
  }

  function valueOfLoan(address lender) public view returns (uint256) {
    return balanceOf(lender).wadMul(exchangeRate());
  }

  // exchangeRate := ETH / bankToken
  function exchangeRate() public view returns (uint256) {
    if (totalSupply() == 0) {
      return WadRayMath.wad();
    }

    ( , , uint256 borrowBalance) = interestAccrualResults();
    return (_availableCash + borrowBalance).wadDiv(totalSupply());
  }

  function getBlockNumber() internal view returns (uint) {
      return block.number;
  }

}
