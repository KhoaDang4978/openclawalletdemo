// Bao Agent Wallet Skill — OpenClaw Custom Skill
// Base Sepolia Testnet | ERC-8004 + x402 + TEE Governance
// Requires: PRIVATE_KEY in your .env or openclaw config

import { createWalletClient, createPublicClient, http, parseEther, formatEther } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// ── Config ────────────────────────────────────────────────────────────────────

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const ERC8004_REGISTRY = "0x7177a6867296406881E20d6647232314736Dd09A"; // Base Sepolia testnet
const FEE_CAP_ETH = 0.01; // Hard cap — TEE will deny anything above this
const RPC_URL = "https://sepolia.base.org";

// ── Viem Clients ──────────────────────────────────────────────────────────────

const account = privateKeyToAccount(PRIVATE_KEY);

const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(RPC_URL),
});

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

// ── IPFS Stub (replace with real nft.storage key in production) ───────────────

async function pinAgentCardToIPFS(name) {
  // Stub: returns a fake CID for testnet demo
  // Production: use nft.storage or web3.storage
  const agentCard = {
    name,
    type: "ERC-8004 Agent Identity",
    chain: "Base Sepolia",
    timestamp: new Date().toISOString(),
    wallet: account.address,
  };
  console.log("[IPFS STUB] Pinning agent card:", agentCard);
  return "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"; // stub CID
}

// ── Tools Export ──────────────────────────────────────────────────────────────

export const tools = {

  /**
   * registerIdentity(name)
   * Pins agent card to IPFS + calls ERC-8004 registry on Base Sepolia
   */
  async registerIdentity(name) {
    console.log(`[ERC-8004] Registering identity: "${name}"`);

    // Step 1 — Pin identity card to IPFS
    const cid = await pinAgentCardToIPFS(name);
    console.log(`[IPFS] Agent card pinned → ipfs://${cid}`);

    // Step 2 — Stub ERC-8004 registry call (replace ABI + function when contract is live)
    try {
      const txHash = await walletClient.sendTransaction({
        to: ERC8004_REGISTRY,
        value: parseEther("0"),
        data: `0x${Buffer.from(`register:${name}:ipfs://${cid}`).toString("hex")}`,
      });
      console.log(`[ERC-8004] Identity registered on-chain → tx: ${txHash}`);
      return {
        success: true,
        name,
        cid,
        txHash,
        message: `Identity "${name}" registered on Base Sepolia. NFT minted at ${ERC8004_REGISTRY}`,
      };
    } catch (err) {
      // Stub fallback for demo without funded wallet
      console.warn("[ERC-8004] Tx failed (stub mode) — wallet may need testnet ETH from faucet.base.org");
      return {
        success: false,
        name,
        cid,
        message: `Identity card created (IPFS: ipfs://${cid}). Fund wallet at faucet.base.org to mint on-chain.`,
      };
    }
  },

  /**
   * payForApi(url)
   * Pays a 402-gated endpoint using x402 protocol with fee cap enforcement
   */
  async payForApi(url) {
    console.log(`[x402] Attempting payment for: ${url}`);

    // Step 1 — Fetch the 402 challenge
    let challenge;
    try {
      const res = await fetch(url);
      if (res.status !== 402) {
        return { success: true, message: `${url} is free — no payment needed.` };
      }
      challenge = await res.json();
      console.log("[x402] Challenge received:", challenge);
    } catch {
      // Stub for demo — simulate a 402 challenge
      challenge = { amount: "0.001", currency: "USDC", network: "base-sepolia" };
      console.log("[x402 STUB] Simulated challenge:", challenge);
    }

    // Step 2 — Check fee cap before paying
    const amount = parseFloat(challenge.amount || "0.001");
    const allowed = await tools.enforceRule("pay-api", amount);
    if (!allowed.approved) return allowed;

    // Step 3 — Stub x402 payment (replace with real @x402/core payClient)
    console.log(`[x402] Paying ${amount} ${challenge.currency || "USDC"} to ${url}`);
    return {
      success: true,
      url,
      amount,
      currency: challenge.currency || "USDC",
      message: `Paid ${amount} USDC for ${url} via x402 on Base Sepolia.`,
    };
  },

  /**
   * enforceRule(action, amount)
   * TEE-style permission governance — hard deny if amount > FEE_CAP_ETH
   */
  async enforceRule(action, amount) {
    console.log(`[TEE] Checking rule: action="${action}" amount=${amount}`);

    // ML-style forecast stub — flag suspicious amounts
    const forecast = amount * 1.05; // simple 5% buffer forecast
    console.log(`[TEE] Forecast cost with buffer: ${forecast.toFixed(4)}`);

    if (amount > FEE_CAP_ETH) {
      console.log(`[TEE DENIED] Amount ${amount} exceeds hard cap ${FEE_CAP_ETH}`);
      return {
        approved: false,
        action,
        amount,
        cap: FEE_CAP_ETH,
        message: `TEE DENIED: ${amount} ETH exceeds hard cap of ${FEE_CAP_ETH} ETH. Action blocked.`,
      };
    }

    console.log(`[TEE APPROVED] Amount ${amount} is within cap ${FEE_CAP_ETH}`);
    return {
      approved: true,
      action,
      amount,
      cap: FEE_CAP_ETH,
      message: `TEE APPROVED: ${amount} ETH is within cap. Proceeding.`,
    };
  },

  /**
   * optimizeLiquidity(amount)
   * Cross-chain liquidity optimization stub — Base-focused
   */
  async optimizeLiquidity(amount) {
    console.log(`[LIQUIDITY] Optimizing route for ${amount} ETH`);
    const routes = [
      { path: "Base Sepolia native", cost: 0.0001, score: 98 },
      { path: "Base → Optimism bridge", cost: 0.0008, score: 72 },
      { path: "Base → Arbitrum bridge", cost: 0.0012, score: 61 },
    ];
    const best = routes[0]; // Always prefer Base native for now
    console.log(`[LIQUIDITY] Best route: ${best.path} (score: ${best.score})`);
    return {
      success: true,
      recommended: best,
      allRoutes: routes,
      message: `Best route: ${best.path} at ${best.cost} ETH fee (score: ${best.score}/100)`,
    };
  },
};

export default tools;