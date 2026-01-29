# Buzdealz Backend - Wishlist Feature

This is the backend implementation for the Buzdealz "Wishlist with Deal Alerts" feature.

## Tech Stack
- **Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT (Cookies)
- **Validation**: Zod
- **Language**: TypeScript

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Ensure `.env` contains:
   ```env
   DATABASE_URL=postgres://user:pass@localhost:5432/buzdealz
   JWT_SECRET=your_secret_key
   PORT=8000
   ```
   *(Note: Adjust DATABASE_URL to your local Postgres instance)*

3. **Database Migration**
   ```bash
   npm run drizzle:push
   ```

4. **Seed Data**
   Populate the database with mock deals:
   ```bash
   npm run seed
   ```

5. **Run Server**
   ```bash
   npm run dev
   ```

## APIs

### Auth
- `POST /api/auth/register` - Register a new user

### Deals
- `GET /api/deals` - List all deals

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add to wishlist
  - Body: `{ "dealId": 1, "alertEnabled": true }`
  - Note: Only subscribers were `isSubscriber: true` can enable alerts.
- `DELETE /api/wishlist/:dealId` - Remove from wishlist

## Testing
You can test the APIs using Postman or cURL.
Ensure to include the `auth_token` cookie obtained from the `/register` endpoint for protected routes.
