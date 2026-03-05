# Event Ticketing DApp (Hybrid DApp) — Sepolia

## Overview
A decentralised event ticketing DApp where each ticket is an ERC-721 NFT. The contract runs on Ethereum Sepolia TestNet. The front-end is a lightweight React app using MetaMask + ethers.js.

## Prerequisites
- Node.js 18+ (recommended 20)
- MetaMask browser extension
- Sepolia test ETH (from a faucet)

## Setup (Root: Hardhat)
1. Copy env template:
   - `cp .env.example .env`
2. Install deps:
   - `npm install`
3. Compile:
   - `npm run compile`
4. Test:
   - `npm test`

## Deploy to Sepolia
1. Ensure `.env` has:
   - `SEPOLIA_RPC_URL=...`
   - `HARDHAT_PRIVATE_KEY=...` (test account only)
2. Deploy:
   - `npm run deploy:sepolia`
3. Copy deployed contract address for the client.

## Client (React)
1. Go to client:
   - `cd client`
2. Copy env template:
   - `cp .env.example .env`
   - Set `VITE_CONTRACT_ADDRESS=0x...`
3. Install & run:
   - `npm install`
   - `npm run dev`
4. Open:
   - http://localhost:3000

## Code Quality
- ESLint:
  - `npm run lint`
- Prettier:
  - `npm run format`

## Notes
- User creates events via `createEvent(...)`. For demo, we can call it in Hardhat console:
  - `npx hardhat console --network sepolia`
- Minting requires paying the event price.

© Muhammad Junaid Mir
