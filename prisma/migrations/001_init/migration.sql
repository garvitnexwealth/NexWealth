CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  name TEXT,
  display_currency TEXT NOT NULL DEFAULT 'INR',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platforms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sub_account_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type INT NOT NULL,
  base_currency TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS sub_account_types_type_currency_idx
  ON sub_account_types (type, base_currency);

CREATE TABLE IF NOT EXISTS platform_sub_accounts (
  id SERIAL PRIMARY KEY,
  platform_id INT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  sub_account_type_id INT NOT NULL REFERENCES sub_account_types(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (platform_id, sub_account_type_id)
);

CREATE TABLE IF NOT EXISTS stocks_list (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type INT NOT NULL,
  symbol TEXT,
  symbol2 TEXT,
  sector TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS stocks_list_type_idx ON stocks_list (type);

CREATE TABLE IF NOT EXISTS user_platform_accounts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform_id INT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  sub_account_type_id INT NOT NULL REFERENCES sub_account_types(id) ON DELETE CASCADE,
  currency TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, platform_id, sub_account_type_id)
);

CREATE INDEX IF NOT EXISTS user_platform_accounts_lookup_idx
  ON user_platform_accounts (user_id, platform_id, sub_account_type_id);

CREATE TABLE IF NOT EXISTS liabilities (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  liability_type INT NOT NULL,
  lender TEXT,
  principal NUMERIC(18,2),
  interest_rate NUMERIC(10,4),
  tenure_months INT,
  emi NUMERIC(18,2),
  status INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS liabilities_user_status_idx ON liabilities (user_id, status);

CREATE TABLE IF NOT EXISTS liability_snapshots (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  liability_id INT NOT NULL REFERENCES liabilities(id) ON DELETE CASCADE,
  as_of_date DATE NOT NULL,
  outstanding NUMERIC(18,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, liability_id, as_of_date)
);

CREATE INDEX IF NOT EXISTS liability_snapshots_user_date_idx ON liability_snapshots (user_id, as_of_date DESC);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform_account_id INT NOT NULL REFERENCES user_platform_accounts(id) ON DELETE CASCADE,
  stock_id INT REFERENCES stocks_list(id),
  related_liability_id INT REFERENCES liabilities(id),
  txn_action INT NOT NULL,
  txn_date TIMESTAMP NOT NULL,
  quantity NUMERIC(18,6),
  unit_price NUMERIC(18,4),
  amount NUMERIC(18,2) NOT NULL,
  currency TEXT NOT NULL,
  fees NUMERIC(18,2) NOT NULL DEFAULT 0,
  notes TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS transactions_user_date_idx ON transactions (user_id, txn_date DESC);
CREATE INDEX IF NOT EXISTS transactions_platform_idx ON transactions (platform_account_id);
CREATE INDEX IF NOT EXISTS transactions_stock_idx ON transactions (stock_id);
CREATE INDEX IF NOT EXISTS transactions_liability_idx ON transactions (related_liability_id);

CREATE TABLE IF NOT EXISTS stock_prices (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stock_id INT NOT NULL REFERENCES stocks_list(id) ON DELETE CASCADE,
  price NUMERIC(18,4) NOT NULL,
  currency TEXT NOT NULL,
  as_of_date DATE NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, stock_id, as_of_date)
);

CREATE TABLE IF NOT EXISTS holding_snapshots (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform_account_id INT REFERENCES user_platform_accounts(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  asset_category INT NOT NULL,
  value NUMERIC(18,2) NOT NULL,
  currency TEXT NOT NULL,
  as_of_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS holding_snapshots_user_date_idx ON holding_snapshots (user_id, as_of_date DESC);

CREATE TABLE IF NOT EXISTS real_estate_valuations (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_name TEXT NOT NULL,
  as_of_date DATE NOT NULL,
  value NUMERIC(18,2) NOT NULL,
  currency TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, property_name, as_of_date)
);

CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC(18,2) NOT NULL,
  target_date DATE NOT NULL,
  priority INT NOT NULL DEFAULT 3,
  asset_category INT NOT NULL,
  status INT NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS goals_user_priority_idx ON goals (user_id, priority);

CREATE TABLE IF NOT EXISTS goal_transaction_links (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id INT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  transaction_id INT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, goal_id, transaction_id)
);

CREATE TABLE IF NOT EXISTS target_allocations (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_category INT NOT NULL,
  target_percent NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, asset_category)
);

CREATE TABLE IF NOT EXISTS fx_rates (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  as_of_date DATE NOT NULL,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC(18,6) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, as_of_date, from_currency, to_currency)
);

CREATE INDEX IF NOT EXISTS fx_rates_user_date_idx ON fx_rates (user_id, as_of_date DESC);
