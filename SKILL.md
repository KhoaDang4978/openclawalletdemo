---
name: bao-agent-wallet
description: Autonomous wallet skill for AI agents — ERC-8004 identity, x402 micropayments, TEE governance, cross-chain liquidity stubs.
version: 1.0.0
---

# Bao Agent Wallet

An autonomous wallet skill that turns your OpenClaw agent into a self-sovereign financial agent on Base Sepolia.

## Features

### 1. ERC-8004 Identity Registration
Registers the agent as an on-chain NFT with a unique identity card pinned to IPFS.

### 2. x402 Micropayments
Automatically pays any HTTP 402 endpoint using USDC on Base Sepolia with a hard fee cap enforced before every payment.

### 3. TEE Permission Governance
Every spend is checked against a rule engine that simulates Trusted Execution Environment enforcement. Transactions above the cap are hard-denied.

### 4. Cross-Chain Liquidity Optimization
Scores available liquidity routes and selects the cheapest Base-native path.

## Triggers

- "register identity as [name]"
- "pay for [service] API"
- "try to spend [amount] USDC"
- "check liquidity for [amount]"
```
