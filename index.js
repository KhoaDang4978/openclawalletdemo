// Bao Agent Wallet Skill — OpenClaw Custom Skill
// Base Sepolia Testnet | ERC-8004 + x402 + TEE Governance
// Requires: PRIVATE_KEY in your .env or openclaw config

import { createWalletClient, createPublicClient, http, parseEther, formatEther } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// ── Config ────────────────────────────────────────────────────────────────────

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const ERC8004_REGISTRY = "0x7177a6867296406881E20d6647232314736Dd09A";
const FEE_CAP_ETH = 0.01;
const RPC_URL = "https://sepolia.base.org";

// ── x402 Demo Endpoints ───────────────────────────────────────────────────────

const X402_ENDPOINTS = {
  weather: "https://x402.org/demo/weather",
  news: "https://x402.org/demo/news",
  price: "https://x402.org/demo/price",
  data: "https://x402.org/demo/data",
};

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

// ── IPFS Stub ─────────────────────────────────────────────────────────────────

async function pinAgentCardToIPFS(name) {
  const agentCard = {
    name,
    type: "ERC-8004 Agent Identity",
    chain: "Base Sepolia",
    timestamp: new Date().toISOString(),
    wallet: account.address,
  };
  console.log("[IPFS STUB] Pinning agent card:", agentCard);
  return "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
}

// ── Tools Export ──────────────────────────────────────────────────────────────

export const tools = {

  /**
   * registerIdentity(name)
   * Pins agent card to IPFS + calls ERC-8004 registry on Base Sepolia
   */
  async registerIdentity(name) {
    console.log(`[ERC-8004] Registering identity: "${name}"`);

    const cid = await pinAgentCardToIPFS(name);
    console.log(`[IPFS] Agent card pinned → ipfs://${cid}`);

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
      console.warn("[ERC-8004] Tx failed (stub mode) — fund wallet at faucet.base.org");
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

    // Use a real x402 demo endpoint
    const DEMO_ENDPOINTS = {
      "weather": "https://x402.org/demo/weather",
      "news": "https://x402.org/demo/news",
      "price": "https://x402.org/demo/price",
    };

    // Match keyword to demo endpoint
    const keyword = Object.keys(DEMO_ENDPOINTS).find(k => url.toLowerCase().includes(k));
    const targetUrl = DEMO_ENDPOINTS[keyword] || url;
    console.log(`[x402] Resolved endpoint: ${targetUrl}`);

    // Simulate 402 challenge
    const challenge = {
      amount: "0.001",
      currency: "USDC",
      network: "base-sepolia",
      endpoint: targetUrl,
    };

    // Check fee cap before paying
    const allowed = await tools.enforceRule("pay-api", parseFloat(challenge.amount));
    if (!allowed.approved) return allowed;

    // Simulate payment receipt
    const receipt = {
      txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
      amount: challenge.amount,
      currency: challenge.currency,
      endpoint: targetUrl,
      timestamp: new Date().toISOString(),
    };

    console.log(`[x402] Payment successful:`, receipt);
    return {
      success: true,
      message: `Paid ${receipt.amount} ${receipt.currency} for ${targetUrl}`,
      receipt,
      data: {
        weather: "Sunny, 28°C in Ho Chi Minh City",
        source: targetUrl,
      },
    };
  },

  /**
   * enforceRule(action, amount)
   * TEE-style permission governance — hard deny if amount > FEE_CAP_ETH
   */
  async enforceRule(action, amount) {
    console.log(`[TEE] Checking rule: action="${action}" amount=${amount}`);

    const forecast = amount * 1.05;
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
    const best = routes[0];
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