# Minibanking

## Setup guide
1. Clone the repository:
   ```bash
   git clone https://github.com/AlexeySHA256/minibanking-test-task && cd minibanking-test-task
   ```
2. Checkout to backend and add .env:
   ```bash
   cd backend
   cp .example.env .env
   ```
3. Build and launch backend:
   ```bash
   docker compose up -d --build
   ```
4. Run seed (optional):
   ```bash
   docker compose exec backend npm run seed
   ```
6. In another terminal checkout to repositor-root/frontend and add .env.local:
   ```bash
   cd frontend
   cp .example.env .env.local
   ```
7. Install dependencies:
   ```bash
   npm ci
   ```
8. Launch frontend:
   ```bash
   npm run dev
   ```

## Selected user management approach is /auth/register endpoint

## Double-entry ledger design:
For each financial transaction always created two additional ledger entries which showcase how the assets move from one account to another.
For example in case of transfer from one to another accounts there would be two new ledger entries:
one subtracts the transaction amount from sender's account and another adds amount to recipient.
Consistency between ledger entries and accounts balances is controlled by the application logic,
ledger entries are created in a single transaction together with updating accounts balances therefore if something goes wrong - balances would stay consistent with ledgers.
