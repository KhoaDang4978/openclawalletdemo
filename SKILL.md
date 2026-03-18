\---

name: bao-agent-wallet

version: 1.0.0

description: Autonomous wallet skill for AI agents — ERC-8004 identity, x402 micropayments, TEE governance, cross-chain liquidity stubs.

capabilities:

&#x20; - identity-registration

&#x20; - micropayments

&#x20; - permission-governance

&#x20; - liquidity-optimization

permissions:

&#x20; network: true

env:

&#x20; PRIVATE\_KEY: "Your Base Sepolia private key (never commit this)"

\---



\# Bao Agent Wallet



An autonomous wallet skill that turns your OpenClaw agent into a self-sovereign financial agent on Base Sepolia.



\## Features



\### 1. ERC-8004 Identity Registration

Registers the agent as an on-chain NFT with a unique identity card pinned to IPFS.

\- Registry: `0x7177a6867296406881E20d6647232314736Dd09A` (testnet)



\### 2. x402 Micropayments

Automatically pays any HTTP 402 endpoint using USDC on Base Sepolia with a hard fee cap enforced before every payment.



\### 3. TEE Permission Governance

Every spend is checked against a rule engine that simulates Trusted Execution Environment enforcement. Transactions above the cap are hard-denied with a TEE DENIED log.



\### 4. Cross-Chain Liquidity Optimization (Stub)

Scores available liquidity routes and selects the cheapest Base-native path. Full bridge integration coming in v2.



\---



\## Triggers



\- "register identity as \[name]"

\- "pay for \[service] API"

\- "try to spend \[amount] USDC"

\- "check liquidity for \[amount]"



\## Tools



| Tool | Description |

|---|---|

| `registerIdentity(name)` | Mint agent NFT + pin identity card to IPFS |

| `payForApi(url)` | Pay a 402-gated endpoint with fee cap check |

| `enforceRule(action, amount)` | TEE-style governance — deny if amount > 0.01 ETH |

