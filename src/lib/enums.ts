export enum SubAccountTypeEnum {
  IND_STOCK = 1,
  US_STOCK = 2,
  CRYPTO = 3,
  MF = 4,
  BONDS = 5,
  SAVINGS = 6,
}

export enum StockMarketType {
  US = 1,
  IND = 2,
}

export enum TxnAction {
  BUY = 1,
  SELL = 2,
  DEPOSIT = 3,
  WITHDRAW = 4,
  EMI = 5,
  INTEREST_CREDIT = 6,
  VALUATION_UPDATE = 7,
  LIABILITY_PAYMENT = 8,
}

export enum LiabilityType {
  LOAN = 1,
  PERSONAL = 2,
  CREDIT_CARD = 3,
  OTHER = 4,
}

export enum LiabilityStatus {
  ACTIVE = 1,
  CLOSED = 2,
}

export enum AssetCategory {
  MF = 1,
  US_STOCKS = 2,
  IND_STOCKS = 3,
  METALS = 4,
  CRYPTO = 5,
  RETIRALS = 6,
  REAL_ESTATE = 7,
  CASH = 8,
  OTHER = 9,
}

export enum GoalStatus {
  ACTIVE = 1,
  ACHIEVED = 2,
  PAUSED = 3,
}
