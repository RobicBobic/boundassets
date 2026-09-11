import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import "./App.css";

/* ---------------------------------------------------------------------- */
/*  Content                                                                */
/* ---------------------------------------------------------------------- */

const NAV_LINKS = [
  { id: "how", label: "How it works" },
  { id: "modules", label: "Modules" },
  { id: "flagship", label: "Flagship" },
  { id: "architecture", label: "Architecture" },
  { id: "staking", label: "Staking" },
  { id: "faq", label: "FAQ" },
];

const STEPS = [
  {
    n: "1",
    title: "Pick token and stock",
    body: "The token already exists, on Pons, pools.trade, anywhere. Choose the Stock Token to stand behind it.",
  },
  {
    n: "2",
    title: "Attach",
    body: "One transaction deploys the set: vault, staking pool, stream. Configuration is immutable from that block.",
  },
  {
    n: "3",
    title: "Route revenue",
    body: "Point creator fees at the vault. A public, rate-limited crank converts them into the stock on-market.",
  },
  {
    n: "4",
    title: "Holders stake and earn",
    body: "Stream share scales with time staked, so nobody snipes a payout they didn't wait for. Leave anytime.",
  },
];


const STOCK_OPTIONS = [
  { ticker: "ETH", name: "Ether" },
  { ticker: "NVDA", name: "NVIDIA" },
  { ticker: "SPCX", name: "SpaceX Class A" },
  { ticker: "GOOGL", name: "Alphabet Class A" },
  { ticker: "TSLA", name: "Tesla" },
  { ticker: "GME", name: "GameStop" },
  { ticker: "AAPL", name: "Apple" },
  { ticker: "SPY", name: "SPDR S&P 500 ETF" },
  { ticker: "SNDK", name: "SanDisk" },
  { ticker: "AMD", name: "Advanced Micro Devices" },
  { ticker: "AMZN", name: "Amazon" },
  { ticker: "MSFT", name: "Microsoft" },
  { ticker: "META", name: "Meta Platforms" },
  { ticker: "CRCL", name: "Circle Internet Group" },
  { ticker: "COIN", name: "Coinbase" },
  { ticker: "MU", name: "Micron Technology" },
  { ticker: "PLTR", name: "Palantir Technologies" },
  { ticker: "TTWO", name: "Take-Two Interactive" },
  { ticker: "RIVN", name: "Rivian Automotive" },
  { ticker: "COST", name: "Costco" },
  { ticker: "DJT", name: "Trump Media & Technology Group" },
  { ticker: "MSTR", name: "Strategy" },
  { ticker: "QQQ", name: "Invesco QQQ" },
  { ticker: "RDDT", name: "Reddit" },
  { ticker: "HIMS", name: "Hims & Hers Health" },
  { ticker: "BB", name: "BlackBerry" },
  { ticker: "GLD", name: "SPDR Gold Shares" },
  { ticker: "cbBTC", name: "Coinbase Wrapped BTC" },
  { ticker: "USDG", name: "Global Dollar" },
  { ticker: "LLY", name: "Eli Lilly" },
  { ticker: "WYFI", name: "WhiteFiber" },
  { ticker: "TSM", name: "Taiwan Semiconductor Manufacturing" },
  { ticker: "RBLX", name: "Roblox" },
  { ticker: "SKHY", name: "SK hynix" },
  { ticker: "DELL", name: "Dell Technologies" },
  { ticker: "USO", name: "United States Oil Fund" },
  { ticker: "SNAP", name: "Snap" },
  { ticker: "LULU", name: "Lululemon Athletica" },
  { ticker: "FIG", name: "Figma" },
  { ticker: "MRNA", name: "Moderna" },
  { ticker: "PFE", name: "Pfizer" },
  { ticker: "MRVL", name: "Marvell Technology" },
  { ticker: "JNJ", name: "Johnson & Johnson" },
  { ticker: "AMC", name: "AMC Entertainment" },
  { ticker: "SGOV", name: "iShares 0-3 Month Treasury Bond ETF" },
  { ticker: "BABA", name: "Alibaba" },
  { ticker: "INDA", name: "iShares MSCI India ETF" },
  { ticker: "IBM", name: "IBM" },
  { ticker: "NFLX", name: "Netflix" },
  { ticker: "BULL", name: "Webull" },
  { ticker: "NU", name: "Nu Holdings" },
  { ticker: "SLV", name: "iShares Silver Trust" },
  { ticker: "SHOP", name: "Shopify" },
  { ticker: "BE", name: "Bloom Energy" },
  { ticker: "F", name: "Ford Motor" },
  { ticker: "UPS", name: "United Parcel Service" },
  { ticker: "TAO", name: "Bittensor" },
];

// Some tickers on the platform aren't in the logo CDN under that exact symbol
// (e.g. GOOGL trades its logo under Alphabet's other class, GOOG).
const STOCK_LOGO_ALIAS = { GOOGL: "GOOG" };

const LADDER_SKINS = {
  Standard: ["Paper", "Holder", "Believer", "Diamond", "Eternal"],
  "$MOGGED": ["Sub5", "Mogging", "Alpha", "Sigma", "Gigachad"],
  "Dog coin": ["Stray", "Good Boy", "Loyal", "Best Friend", "Forever Home"],
};
const LADDER_THRESHOLDS = ["day 0", "1 day", "7 days", "30 days", "90 days, earns the stream"];

const CONTRACTS = [
  { id: "C-01", name: "Factory", body: "Deploys a token's full set in one call." },
  { id: "C-02", name: "Vault", body: "Holds the stock. Balance public. No exit but the stream." },
  { id: "C-03", name: "Stake", body: "Time-weighted staking. Held stake counts double against fresh top-ups." },
  { id: "C-04", name: "Stream", body: "Pull-based distribution. No loops, no snapshots to snipe." },
  { id: "C-05", name: "Crank", body: "Public conversion of revenue into stock. Capped, rate-limited, price-bounded." },
];

const TRUST_ITEMS = [
  {
    title: "Immutable at attach",
    body: "Stock, thresholds and correction rates are set once, cryptographically permanent. No owner, no setters, no upgrades.",
  },
  {
    title: "Staking is optional",
    body: "The protocol only ever touches what a holder chose to stake. Trading stays exactly as free as it was.",
  },
  {
    title: "Routed, never conjured",
    body: "Every unit of stock in a vault arrived from disclosed revenue, bought on-market by a public crank.",
  },
  {
    title: "Gated on purpose",
    body: "Streaming Stock Tokens is regulated activity. Audit and securities review come before mainnet, not after.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Do you need the launchpad's permission?",
    a: "No. Bound deploys beside your token, not inside it. It never touches the token contract, the launchpad, or the pool it trades on.",
  },
  {
    q: "Where does the yield come from?",
    a: "From the creator fee revenue you route into the vault. A public crank buys the Stock Token on-market with that revenue. There is no emissions schedule and nothing is minted out of thin air.",
  },
  {
    q: "Can the creator change the rules later?",
    a: "No. Stock choice, module selection, tier thresholds and correction rates are all fixed at the block the token attaches. There are no owner keys and no upgrade path.",
  },
  {
    q: "Which stocks can I attach to?",
    a: "Any reviewed Stock Token with real on-chain liquidity, since the crank buys through a live market. The list opens in order as tokens clear audit and securities review.",
  },
  {
    q: "When can I attach?",
    a: "The factory opens to the list one token at a time, after the $MOGGED flagship has run the full playbook on mainnet.",
  },
];

const ROADMAP_STEPS = [
  {
    n: "01",
    title: "Contracts and tests",
    body: "51 passing tests, plus 6 checks that run against live mainnet state.",
  },
  { n: "02", title: "Testnet", body: "Where the list opens. Attach against a test stock and break it in public." },
  {
    n: "03",
    title: "Audit and securities review",
    body: "Both gate mainnet. Streaming Stock Tokens is regulated activity.",
  },
  { n: "04", title: "The $MOGGED flagship", body: "One token, one launch, straight through the runbook." },
  { n: "05", title: "The factory", body: "Opens to the list in order, one token at a time." },
];

const TOKEN_NEEDS = [
  "A live launch whose trading fees you can point at a FeeDoor.",
  "A reviewed Stock Token with real on-chain liquidity, because the crank buys through a live market.",
  "Nothing else. Attaching is permissionless, and the config is immutable from that block.",
];

/* ---------------------------------------------------------------------- */
/*  Small pieces                                                          */
/* ---------------------------------------------------------------------- */

function Mark({ size = 24 }) {
  return (
    <img
      src={process.env.PUBLIC_URL + "/logo.png"}
      alt="Bound"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain", display: "block" }}
    />
  );
}

function Plus({ open }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" className={"faq-plus" + (open ? " open" : "")}>
      <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const STOCK_LOGO_CDN = "https://cdn.jsdelivr.net/npm/us-stock-logos/dist/png";

function tickerColor(ticker) {
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 45%, 40%)`;
}

function StockLogo({ ticker, size = 22, className = "" }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [ticker]);
  const logoTicker = STOCK_LOGO_ALIAS[ticker] || ticker;

  if (failed) {
    return (
      <span
        className={"stock-logo stock-logo-fallback " + className}
        style={{ width: size, height: size, fontSize: size * 0.5, background: tickerColor(ticker) }}
      >
        {ticker.replace(/^cb/, "").slice(0, 1).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={`${STOCK_LOGO_CDN}/${logoTicker}.png`}
      alt={`${ticker} logo`}
      width={size}
      height={size}
      className={"stock-logo " + className}
      style={{ width: size, height: size, objectFit: "contain", display: "block" }}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

/* ---------------------------------------------------------------------- */
/*  Scroll reveal                                                         */
/* ---------------------------------------------------------------------- */

// Flips a class on once an element first scrolls into view, then stops
// watching. Skips straight to "in view" for prefers-reduced-motion.
function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, inView];
}

function revealCx(base, inView) {
  return base + " reveal" + (inView ? " in-view" : "");
}
function staggerCx(base, inView) {
  return base + " reveal-stagger" + (inView ? " in-view" : "");
}

/* ---------------------------------------------------------------------- */
/*  App                                                                    */
/* ---------------------------------------------------------------------- */

function ConstellationCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Cap DPR at 1.5 instead of 2 — a 4K/retina screen was rasterizing 4x the
    // pixels of a standard display for a background effect nobody looks at closely.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let width = window.innerWidth;
    let height = window.innerHeight;
    let points = [];

    const makePoints = () => {
      // Fewer points on large screens (was up to 90, now capped at 70) — fewer
      // pairs to test every frame.
      const count = Math.min(Math.max(Math.round((width * height) / 32000), 28), 70);
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
      }));
    };

    const applySize = () => {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const LINK_DIST = 140;
    const LINK_DIST_SQ = LINK_DIST * LINK_DIST;
    // Group connecting lines into opacity buckets so a frame issues a handful
    // of stroke() calls instead of one per connected pair (previously up to
    // ~2000+ individual stroke() calls per frame — the main source of jank).
    const ALPHA_BUCKETS = 6;
    const buckets = Array.from({ length: ALPHA_BUCKETS }, () => []);

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);

      if (!reduceMotion) {
        for (const p of points) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }
      }

      for (let b = 0; b < ALPHA_BUCKETS; b++) buckets[b].length = 0;

      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dx = a.x - p2.x;
          const dy = a.y - p2.y;
          const distSq = dx * dx + dy * dy;
          // Compare squared distances — skips a sqrt() call for every pair
          // that's obviously too far apart to link.
          if (distSq < LINK_DIST_SQ) {
            const t = 1 - Math.sqrt(distSq) / LINK_DIST;
            const bucket = Math.min(ALPHA_BUCKETS - 1, Math.floor(t * ALPHA_BUCKETS));
            buckets[bucket].push(a, p2);
          }
        }
      }

      ctx.lineWidth = 1;
      for (let b = 0; b < ALPHA_BUCKETS; b++) {
        const pairs = buckets[b];
        if (!pairs.length) continue;
        ctx.strokeStyle = `rgba(0,0,0,${(((b + 1) / ALPHA_BUCKETS) * 0.14).toFixed(3)})`;
        ctx.beginPath();
        for (let k = 0; k < pairs.length; k += 2) {
          ctx.moveTo(pairs[k].x, pairs[k].y);
          ctx.lineTo(pairs[k + 1].x, pairs[k + 1].y);
        }
        ctx.stroke();
      }

      // Single path + single fill for all dots, instead of a beginPath/fill
      // pair per point.
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath();
      for (const p of points) {
        ctx.moveTo(p.x + 1.7, p.y);
        ctx.arc(p.x, p.y, 1.7, 0, Math.PI * 2);
      }
      ctx.fill();
    };

    applySize();
    makePoints();
    renderFrame();

    // Debounce resize so a window drag doesn't rebuild the point set and
    // resize the backing canvas on every intermediate pixel.
    let resizeTimer;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      applySize();
      makePoints();
      renderFrame();
    };
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };
    window.addEventListener("resize", onResize);

    let raf = null;
    let lastFrame = 0;
    // Cap at 30fps — a slow ambient drift doesn't need 60fps, and this halves
    // both the JS work and the cost of any backdrop-filter blur compositing
    // above it every single frame.
    const FRAME_INTERVAL = 1000 / 30;

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - lastFrame < FRAME_INTERVAL) return;
      lastFrame = now;
      renderFrame();
    };
    const start = () => {
      if (raf == null) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf != null) cancelAnimationFrame(raf);
      raf = null;
    };

    if (!reduceMotion) start();

    // Stop animating entirely while the tab is in the background.
    const onVisibility = () => {
      if (reduceMotion) return;
      if (document.visibilityState === "visible") start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(resizeTimer);
    };
  }, []);

  return <canvas ref={canvasRef} className="bg-constellation" />;
}

function BackgroundFX() {
  return (
    <div className="bg-fx" aria-hidden="true">
      <div className="bg-grid" />
      <ConstellationCanvas />
    </div>
  );
}

/* ---------------------------------------------------------------------- */

export default function App() {
  const wallet = useWallet();
  return (
    <WalletContext.Provider value={wallet}>
      <div className="page">
        <BackgroundFX />
        <NavBar />
        <Hero />
        <TrustStrip />
        <Simulator />
        <HowItWorks />
        <Modules />
        <Flagship />
        <Architecture />
        <TrustList />
        <Faq />
        <Roadmap />
        <Footer />
      </div>
    </WalletContext.Provider>
  );
}

/* ---------------------------------------------------------------------- */

/* ---------------------------------------------------------------------- */
/*  Wallet connect — MetaMask + OKX Wallet                                */
/* ---------------------------------------------------------------------- */

const ROBINHOOD_CHAIN = {
  chainId: "0x1237", // 4663
  chainName: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
  blockExplorerUrls: ["https://explorer.mainnet.chain.robinhood.com"],
};
const ROBINHOOD_CHAIN_ID_DEC = 4663;

function getInjectedProviders() {
  const found = { metamask: null, okx: null };
  if (typeof window === "undefined") return found;

  // OKX injects its own global, separate from window.ethereum
  if (window.okxwallet) found.okx = window.okxwallet;

  const eth = window.ethereum;
  if (eth) {
    const list = Array.isArray(eth.providers) && eth.providers.length ? eth.providers : [eth];
    for (const p of list) {
      if (p.isMetaMask && !p.isOkxWallet && !found.metamask) found.metamask = p;
      if ((p.isOkxWallet || p.isOKExWallet) && !found.okx) found.okx = p;
    }
  }
  return found;
}

function formatAddress(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

const WALLET_INFO = {
  metamask: { label: "MetaMask", installUrl: "https://metamask.io/download" },
  okx: { label: "OKX Wallet", installUrl: "https://www.okx.com/web3" },
};

const WalletContext = createContext(null);
function useWalletContext() {
  return useContext(WalletContext);
}

function useWallet() {
  const [providers, setProviders] = useState({ metamask: null, okx: null });
  const [walletKind, setWalletKind] = useState(null); // "metamask" | "okx" | null
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setProviders(getInjectedProviders());
  }, []);

  useEffect(() => {
    if (!walletKind) return;
    const provider = providers[walletKind];
    if (!provider) return;

    provider.request({ method: "eth_chainId" }).then(setChainId).catch(() => {});

    const handleAccounts = (accounts) => {
      if (!accounts || accounts.length === 0) {
        setAddress(null);
        setWalletKind(null);
      } else {
        setAddress(accounts[0]);
      }
    };
    const handleChain = (id) => setChainId(id);
    const handleDisconnect = () => {
      setAddress(null);
      setWalletKind(null);
    };

    provider.on?.("accountsChanged", handleAccounts);
    provider.on?.("chainChanged", handleChain);
    provider.on?.("disconnect", handleDisconnect);
    return () => {
      provider.removeListener?.("accountsChanged", handleAccounts);
      provider.removeListener?.("chainChanged", handleChain);
      provider.removeListener?.("disconnect", handleDisconnect);
    };
  }, [walletKind, providers]);

  const connect = async (kind) => {
    const provider = providers[kind];
    if (!provider) {
      window.open(WALLET_INFO[kind].installUrl, "_blank", "noreferrer");
      return;
    }
    setConnecting(kind);
    setError(null);
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      setAddress(accounts[0]);
      setWalletKind(kind);
    } catch (e) {
      setError(e?.message || "Connection was rejected.");
    } finally {
      setConnecting(null);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setWalletKind(null);
    setChainId(null);
  };

  const switchToRobinhood = async () => {
    const provider = providers[walletKind];
    if (!provider) return;
    setSwitching(true);
    setError(null);
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ROBINHOOD_CHAIN.chainId }],
      });
    } catch (switchErr) {
      // 4902 = chain not added to the wallet yet
      if (switchErr?.code === 4902) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [ROBINHOOD_CHAIN],
          });
        } catch (addErr) {
          setError(addErr?.message || "Couldn't add Robinhood Chain.");
        }
      } else {
        setError(switchErr?.message || "Couldn't switch network.");
      }
    } finally {
      try {
        const id = await provider.request({ method: "eth_chainId" });
        setChainId(id);
      } catch {
        // ignore — chainChanged listener will catch up if this fails
      }
      setSwitching(false);
    }
  };

  const wrongNetwork = Boolean(address && chainId && parseInt(chainId, 16) !== ROBINHOOD_CHAIN_ID_DEC);

  return {
    providers,
    walletKind,
    address,
    chainId,
    wrongNetwork,
    connecting,
    switching,
    error,
    connect,
    disconnect,
    switchToRobinhood,
  };
}

function WalletButton() {
  const {
    providers,
    walletKind,
    address,
    wrongNetwork,
    connecting,
    switching,
    error,
    connect,
    disconnect,
    switchToRobinhood,
  } = useWalletContext();
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="wallet-box" ref={boxRef}>
      <button
        className={"btn btn-ghost btn-sm wallet-btn" + (wrongNetwork ? " wrong-network" : "")}
        onClick={() => setOpen((v) => !v)}
      >
        {wrongNetwork ? "Wrong network" : address ? formatAddress(address) : "Connect wallet"}
      </button>

      {open && (
        <div className="wallet-menu">
          {address ? (
            <>
              <div className="wallet-menu-head">
                <span>{WALLET_INFO[walletKind]?.label}</span>
                <strong>{formatAddress(address)}</strong>
              </div>
              {wrongNetwork && (
                <>
                  <div className="wallet-menu-warning">Switch to Robinhood Chain to continue.</div>
                  <button className="wallet-menu-item" disabled={switching} onClick={switchToRobinhood}>
                    {switching ? "switching…" : "Switch to Robinhood Chain"}
                  </button>
                </>
              )}
              <button
                className="wallet-menu-item"
                onClick={() => {
                  disconnect();
                  setOpen(false);
                }}
              >
                Disconnect
              </button>
              {error && <div className="wallet-menu-error">{error}</div>}
            </>
          ) : (
            <>
              {["metamask", "okx"].map((kind) => (
                <button
                  key={kind}
                  className="wallet-menu-item"
                  disabled={connecting === kind}
                  onClick={async () => {
                    await connect(kind);
                    setOpen(false);
                  }}
                >
                  <span>{WALLET_INFO[kind].label}</span>
                  <span className="wallet-menu-flag">
                    {connecting === kind ? "connecting…" : providers[kind] ? "detected" : "install"}
                  </span>
                </button>
              ))}
              {error && <div className="wallet-menu-error">{error}</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */

function NavBar() {
  const scrollTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <header className="topbar">
      <a href="#top" className="brand" onClick={scrollTo("top")}>
        <span className="brand-mark">
          <Mark size={22} />
        </span>
        <span className="brand-name">BOUND</span>
      </a>
      <nav className="topnav">
        {NAV_LINKS.map((l, i) => (
          <a key={l.id} href={`#${l.id}`} className={i === 0 ? "active" : ""} onClick={scrollTo(l.id)}>
            {l.label}
          </a>
        ))}
        <a
          href="https://x.com"
          target="_blank"
          rel="noreferrer"
          className="topnav-x"
          aria-label="Bound on X"
        >
          X
        </a>
      </nav>
      <div className="topbar-actions">
        <WalletButton />
        <a href="#staking" className="btn btn-primary btn-sm" onClick={scrollTo("staking")}>
          Attach your token
        </a>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------------- */

function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero-copy">
        <h1>
          Attach any token
          <br />
          to a real stock.
        </h1>
        <p className="hero-sub">
          Route a token's revenue in. Bound streams Stock Tokens to the holders who stay. Any
          launchpad, after launch.
        </p>
        <div className="hero-ctas">
          <a href="#staking" className="btn btn-primary" onClick={(e) => { e.preventDefault(); document.getElementById("staking")?.scrollIntoView({ behavior: "smooth" }); }}>
            Attach your token
          </a>
          <a href="#staking" className="btn btn-ghost" onClick={(e) => { e.preventDefault(); document.getElementById("staking")?.scrollIntoView({ behavior: "smooth" }); }}>
            Try the simulator
          </a>
        </div>
      </div>

      <div className="hero-photo-card diagram-card">
        <div className="diagram-row token-row">
          <div className="diagram-title">$YOURTOKEN</div>
          <div className="diagram-sub">ANY TOKEN ON ROBINHOOD CHAIN</div>
        </div>

        <div className="diagram-link diagram-link-in">
          <span className="diagram-link-label">revenue in</span>
        </div>

        <div className="diagram-mark">
          <Mark size={30} />
        </div>

        <div className="diagram-link diagram-link-out">
          <span className="diagram-link-label">stock out</span>
        </div>

        <div className="diagram-row stock-row">
          <div className="diagram-title-row">
            <StockLogo ticker="NVDA" size={20} />
            <div className="diagram-title">NVDA</div>
          </div>
          <div className="diagram-sub">TOKENIZED STOCK, YOUR PICK</div>
        </div>

        <div className="diagram-stakers">
          <span className="diagram-link-label">stakers</span>
        </div>

        <ol className="diagram-list">
          <li>
            <span className="diagram-list-n">01</span>revenue routed in
          </li>
          <li>
            <span className="diagram-list-n">02</span>crank buys <strong>stock</strong>
          </li>
          <li>
            <span className="diagram-list-n">03</span>vault holds it <strong>onchain</strong>
          </li>
          <li>
            <span className="diagram-list-n">04</span>stakers earn the <strong>stream</strong>
          </li>
        </ol>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { title: "No launchpad permission", body: "Bound deploys beside your token, not inside it." },
    { title: "Immutable at attach", body: "Stock, tiers and rates are fixed from the first block." },
    { title: "Non-custodial", body: "Stake and leave whenever, keep everything earned." },
  ];
  const [ref, inView] = useInView();
  return (
    <section ref={ref} className={staggerCx("trust-strip", inView)}>
      {items.map((it) => (
        <div key={it.title} className="trust-strip-item">
          <div className="trust-strip-title">{it.title}</div>
          <div className="trust-strip-body">{it.body}</div>
        </div>
      ))}
    </section>
  );
}

/* ---------------------------------------------------------------------- */

function HowItWorks() {
  const [headRef, headIn] = useInView();
  const [gridRef, gridIn] = useInView();
  return (
    <section id="how" className="section steps-section">
      <div ref={headRef} className={revealCx("section-head", headIn)}>
        <h2>
          Four steps. No new token.
          <br />
          No migration.
        </h2>
        <p>
          Your token keeps trading exactly where it always did. Attachment is a parallel system
          your community opts into by staking.
        </p>
      </div>
      <div ref={gridRef} className={staggerCx("steps-grid", gridIn)}>
        {STEPS.map((s) => (
          <div key={s.n} className="step-card">
            <div className="step-n">{s.n}</div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

function StockPicker({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const current = STOCK_OPTIONS.find((s) => s.ticker === value);

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? STOCK_OPTIONS.filter((s) => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    : STOCK_OPTIONS;

  return (
    <div className="stock-picker" ref={boxRef}>
      <button
        type="button"
        className="stock-picker-trigger"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <StockLogo ticker={value} size={22} className="stock-picker-logo" />
        <span className="stock-picker-label">
          {current.ticker} — {current.name}
        </span>
        <svg className={"stock-picker-caret" + (open ? " open" : "")} viewBox="0 0 12 8" width="11" height="8">
          <path d="M1 1.5 6 6.5 11 1.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="stock-picker-panel">
          <input
            ref={inputRef}
            className="stock-picker-search"
            placeholder="Search ticker or name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="stock-picker-list">
            {filtered.length === 0 && <div className="stock-picker-empty">No match.</div>}
            {filtered.map((s) => (
              <button
                type="button"
                key={s.ticker}
                className={"stock-picker-row" + (s.ticker === value ? " selected" : "")}
                onClick={() => {
                  onChange(s.ticker);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <StockLogo ticker={s.ticker} size={20} />
                <span className="stock-picker-row-ticker">{s.ticker}</span>
                <span className="stock-picker-row-name">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */

const SIM_TOTAL_DAYS = 90;
const SIM_TICK_MS = 250; // demo speed: one tick = one simulated day

function tierIndexForDay(day) {
  if (day >= 90) return 4;
  if (day >= 30) return 3;
  if (day >= 7) return 2;
  if (day >= 1) return 1;
  return 0;
}

function correctionFeeForDay(day) {
  const pct = 20 - (Math.min(day, 90) / 90) * 19;
  return Math.max(1, Math.round(pct));
}

function Simulator() {
  const { address } = useWalletContext();
  const [tokenName, setTokenName] = useState("");
  const [tokenTicker, setTokenTicker] = useState("");
  const [stock, setStock] = useState(STOCK_OPTIONS[0].ticker);
  const [note, setNote] = useState("");
  const [tokenLogo, setTokenLogo] = useState(null);
  const [tokenLogoName, setTokenLogoName] = useState("");
  const logoInputRef = useRef(null);
  const [xProfile, setXProfile] = useState("");
  const [telegram, setTelegram] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [ladderOn, setLadderOn] = useState(true);
  const [correctionsOn, setCorrectionsOn] = useState(true);
  const [attached, setAttached] = useState(false);
  const [running, setRunning] = useState(false);
  const [day, setDay] = useState(0);
  const [bailed, setBailed] = useState(false);
  const intervalRef = useRef(null);

  const AVAILABLE_STAKE = 250000;
  const ticker = tokenTicker.trim() ? tokenTicker.trim().toUpperCase() : "TOKEN";
  const token = `$${ticker}`;

  useEffect(() => {
    if (address) setWalletWarning(false);
  }, [address]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setDay((d) => {
        if (d + 1 >= SIM_TOTAL_DAYS) {
          clearInterval(intervalRef.current);
          setRunning(false);
          return SIM_TOTAL_DAYS;
        }
        return d + 1;
      });
    }, SIM_TICK_MS);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const revenue = Math.round(day * 42.5);
  const stockBought = (day * 0.0031).toFixed(4);
  const tierIdx = tierIndexForDay(day);
  const tierName = LADDER_SKINS.Standard[tierIdx];
  const fee = correctionFeeForDay(day);

  const [walletWarning, setWalletWarning] = useState(false);

  const attach = () => {
    if (!address) {
      setWalletWarning(true);
      return;
    }
    setWalletWarning(false);
    setAttached(true);
    setRunning(true);
    setDay(0);
    setBailed(false);
  };

  const bail = () => {
    setRunning(false);
    setBailed(true);
  };

  const reset = () => {
    setAttached(false);
    setRunning(false);
    setDay(0);
    setBailed(false);
  };

  const onLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setTokenLogo(reader.result);
    reader.readAsDataURL(file);
    setTokenLogoName(file.name);
  };

  const clearLogo = (e) => {
    e.stopPropagation();
    setTokenLogo(null);
    setTokenLogoName("");
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  return (
    <section id="staking" className="section simulator-section">
      <div className="honesty-copy">
        <h2>
          Bound routes revenue. It <strong>never conjures yield.</strong>
        </h2>
        <p>
          An empty pipe means an empty vault. The dashboard shows inflows, holdings and stream
          rate truthfully, onchain, at all times.
        </p>
      </div>

      <div className="honesty-copy">
        <h2>Don't take our word for it. Run one.</h2>
        <p>
          A working miniature of the protocol. Attach a token, route revenue, stake, bail early if
          you dare. One tick is one day.
        </p>
      </div>

      <div className="sim-shell">
        <div className="sim-form">
          <div className="sim-form-heading-row">
            <div className="sim-form-heading">Attach a token</div>
            <span className="sim-flag">simulation · not real value</span>
          </div>

          <div className="sim-form-row two-col">
            <div>
              <label>Name</label>
              <input
                placeholder="Token name"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                disabled={attached}
              />
            </div>
            <div>
              <label>Ticker</label>
              <input
                placeholder="TICKER"
                value={tokenTicker}
                onChange={(e) => setTokenTicker(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10))}
                disabled={attached}
              />
            </div>
          </div>

          <div className="sim-form-row">
            <label>Note</label>
            <textarea
              placeholder="A short note about this attachment"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={attached}
              rows={2}
            />
          </div>

          <div className="sim-form-row">
            <label>Token image</label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="sim-file-input"
              onChange={onLogoSelect}
              disabled={attached}
            />
            <button
              type="button"
              className="sim-dropzone sim-dropzone-btn"
              onClick={() => logoInputRef.current?.click()}
              disabled={attached}
            >
              {tokenLogo ? (
                <>
                  <img src={tokenLogo} alt="Token logo preview" className="sim-token-logo-preview" />
                  <span className="sim-dropzone-filename">{tokenLogoName}</span>
                  {!attached && (
                    <span className="sim-dropzone-remove" onClick={clearLogo}>
                      Remove
                    </span>
                  )}
                </>
              ) : (
                <>
                  <svg viewBox="0 0 20 20" width="18" height="18">
                    <rect x="2.5" y="4" width="15" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none" />
                    <circle cx="7" cy="8.5" r="1.3" fill="currentColor" />
                    <path d="M3.5 13.5 7.5 10l3 2.5 2.5-2.5 3.5 3.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                  <span>Choose image</span>
                </>
              )}
            </button>
          </div>

          <div className="sim-form-row">
            <label>Stock logo</label>
            <div className="sim-dropzone">
              <StockLogo ticker={stock} size={28} />
              <span>
                {stock} — {STOCK_OPTIONS.find((s) => s.ticker === stock)?.name}
              </span>
            </div>
          </div>

          <div className="sim-form-row two-col">
            <div>
              <label>X profile</label>
              <input
                placeholder="x.com/handle"
                value={xProfile}
                onChange={(e) => setXProfile(e.target.value)}
                disabled={attached}
              />
            </div>
            <div>
              <label>Telegram</label>
              <input
                placeholder="t.me/community"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                disabled={attached}
              />
            </div>
          </div>

          <div className="sim-form-row">
            <label>Stock to stand behind it</label>
            <StockPicker value={stock} onChange={setStock} disabled={attached} />
            <span className="sim-form-caption">Attaches once ladder and corrections lock in.</span>
          </div>

          <div className="sim-form-row">
            <label>Stake amount</label>
            <div className="sim-stake-input">
              <input
                type="number"
                min="0"
                placeholder="0.00"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                disabled={attached}
              />
              <span className="sim-stake-suffix">{ticker}</span>
              <button
                type="button"
                className="sim-stake-max"
                disabled={attached}
                onClick={() => setStakeAmount(String(AVAILABLE_STAKE))}
              >
                Max
              </button>
            </div>
            <span className="sim-form-caption">
              {AVAILABLE_STAKE.toLocaleString()} available, staked in the attach transaction
            </span>
          </div>

          <div className="sim-advanced">
            <button
              type="button"
              className="sim-advanced-toggle"
              onClick={() => setAdvancedOpen((v) => !v)}
            >
              Advanced
              <svg
                className={"sim-advanced-caret" + (advancedOpen ? " open" : "")}
                viewBox="0 0 12 8"
                width="11"
                height="8"
              >
                <path
                  d="M1 1.5 6 6.5 11 1.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {advancedOpen && (
              <div className="sim-form-row two-col sim-advanced-body">
                <div>
                  <label>Ladder module</label>
                  <button
                    className={"pill-toggle block" + (ladderOn ? " on" : "")}
                    onClick={() => setLadderOn((v) => !v)}
                    disabled={attached}
                  >
                    {ladderOn ? "on" : "off"}
                  </button>
                </div>
                <div>
                  <label>Corrections module</label>
                  <button
                    className={"pill-toggle block" + (correctionsOn ? " on" : "")}
                    onClick={() => setCorrectionsOn((v) => !v)}
                    disabled={attached}
                  >
                    {correctionsOn ? "on" : "off"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="sim-form-footer-wrap">
            <div className="sim-form-footer">
              <span className="sim-footer-note">
                {token} pair, attach fee 0.0005 ETH
              </span>
              {!attached ? (
                <button className="btn btn-primary sim-cta" onClick={attach}>
                  Attach
                </button>
              ) : (
                <button className="btn btn-ghost sim-cta" onClick={reset}>
                  Reset
                </button>
              )}
            </div>
            {walletWarning && !address && (
              <div className="sim-wallet-warning">Connect your wallet first to attach.</div>
            )}
          </div>
        </div>

        <div className="sim-preview">
          <div className="sim-preview-icon">
            <StockLogo ticker={stock} size={26} />
          </div>
          <div className="sim-preview-title">Your attachment</div>
          <div className="sim-preview-sub sim-preview-sub-with-logo">
            {tokenLogo && <img src={tokenLogo} alt="" className="sim-preview-token-logo" />}
            {ticker}
          </div>

          <div className="sim-preview-rows">
            <div className="sim-preview-row">
              <span>Attach fee</span>
              <strong>0.0005 ETH</strong>
            </div>
            <div className="sim-preview-row">
              <span>Paired with</span>
              <strong>{stock}</strong>
            </div>
            <div className="sim-preview-row">
              <span>Correction rate</span>
              <strong>{correctionsOn ? "20% → 1%" : "off"}</strong>
            </div>
            <div className="sim-preview-row">
              <span>Ladder window</span>
              <strong>{ladderOn ? "90 days" : "off"}</strong>
            </div>
            <div className="sim-preview-row">
              <span>Unlocks</span>
              <strong>Day 90</strong>
            </div>
            <div className="sim-preview-row">
              <span>Liquidity</span>
              <strong>Locked</strong>
            </div>

            {attached && (
              <>
                <div className="sim-preview-divider" />
                <div className="sim-preview-row">
                  <span>Day</span>
                  <strong>
                    {day} / {SIM_TOTAL_DAYS}
                  </strong>
                </div>
                <div className="sim-preview-row">
                  <span>Revenue routed in</span>
                  <strong>${revenue.toLocaleString()}</strong>
                </div>
                <div className="sim-preview-row">
                  <span>{stock} bought</span>
                  <strong>{stockBought}</strong>
                </div>
                <div className="sim-preview-row">
                  <span>Tier{ladderOn ? "" : " (off)"}</span>
                  <strong>{ladderOn ? tierName : "—"}</strong>
                </div>
                <div className="sim-preview-row">
                  <span>Bail-early fee{correctionsOn ? "" : " (off)"}</span>
                  <strong>{correctionsOn ? `${fee}%` : "—"}</strong>
                </div>
              </>
            )}
          </div>

          {attached && (
            <>
              <div className="sim-progress">
                <div
                  className={"sim-progress-fill" + (running ? " running" : "")}
                  style={{ width: `${(day / SIM_TOTAL_DAYS) * 100}%` }}
                />
              </div>
              {day >= SIM_TOTAL_DAYS ? (
                <div className="sim-note done">
                  the stream unlocks — {token} now earns {stock} continuously
                </div>
              ) : bailed ? (
                <div className="sim-note bailed">
                  bailed on day {day}.{" "}
                  {correctionsOn
                    ? `${fee}% correction fee posted to the pot.`
                    : "no corrections module, no fee — full stake returned."}
                </div>
              ) : (
                <button className="btn btn-ghost sim-bail" onClick={bail}>
                  bail early
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}


/* ---------------------------------------------------------------------- */

function Modules() {
  const [skin, setSkin] = useState("Standard");
  const tiers = LADDER_SKINS[skin];
  const [headRef, headIn] = useInView();
  const [gridRef, gridIn] = useInView();
  return (
    <section id="modules" className="section modules-section">
      <div ref={headRef} className={revealCx("section-head", headIn)}>
        <h2>
          The default is simple.
          <br />
          Sharp edges are opt-in.
        </h2>
        <p>
          Out of the box: stake, earn stock, keep everything. Modules are chosen at attach time and
          can never be changed after.
        </p>
      </div>

      <div ref={gridRef} className={staggerCx("modules-grid", gridIn)}>
        <div className="loop-card ladder-card">
          <h3>Ladder</h3>
          <p>
            Loyalty tiers from a preset menu. Tier names are cosmetic metadata your community can
            skin. The thresholds and weights underneath are protocol math.{" "}
            <a href="#architecture" className="inline-link">
              See the standard ladder and its corrections.
            </a>
          </p>

          <div className="skin-tabs">
            {Object.keys(LADDER_SKINS).map((s) => (
              <button
                key={s}
                className={"skin-tab" + (s === skin ? " active" : "")}
                onClick={() => setSkin(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="tier-row">
            {tiers.map((t, i) => (
              <div key={t} className={"tier-cell" + (i === tiers.length - 1 ? " eternal" : "")}>
                <div className="tier-name">{t}</div>
                <div className="tier-threshold">{LADDER_THRESHOLDS[i]}</div>
              </div>
            ))}
          </div>

          <p className="ladder-note">
            The neutral default. Thresholds shown: the Standard preset (1d, 7d, 30d, 90d).
          </p>
          <div className="skin-flag">
            standard skin: <strong>on</strong>
          </div>
        </div>

        <div className="modules-side">
          <div className="loop-card">
            <h3>Corrections</h3>
            <p>
              Early-unstake fees, by tier, that feed the pot, plus a public feed of who bailed.
              Commitment culture for communities that want it.
            </p>
            <div className="skin-flag">
              standard skin: <strong>on</strong>, 20% to 1%
            </div>
          </div>
          <div className="loop-card dashed">
            <h3>Stock pool</h3>
            <p>
              The crank builds a locked, vault-owned pool where your token trades directly against
              its stock. The attachment grows its own market.
            </p>
            <div className="skin-flag">
              ships in: <strong>v2</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

function Flagship() {
  const [copyRef, copyIn] = useInView();
  const [cardRef, cardIn] = useInView();
  return (
    <section id="flagship" className="section flagship-section">
      <div ref={copyRef} className={revealCx("flagship-copy", copyIn)}>
        <h2>
          The first latched token
          <br />
          wears the loudest skin.
        </h2>
        <p>
          $MOGGED launches on Pons as a standard template token, then becomes the first
          attachment: every module on, corrections live and public, and a vault that market-buys
          the <strong>Eli Lilly Stock Token</strong> from a disclosed share of creator fees plus
          every correction paid by early bailers.
        </p>
        <p>
          It exists to prove the ceiling. Your token doesn't have to look like this. That's the
          point of skins and modules.
        </p>
        <dl className="flagship-facts">
          <div>
            <dt>Launchpad</dt>
            <dd>Pons</dd>
          </div>
          <div>
            <dt>Stock</dt>
            <dd className="dd-with-logo">
              <StockLogo ticker="LLY" size={18} />
              LLY, Eli Lilly Stock Token
            </dd>
          </div>
          <div>
            <dt>Modules</dt>
            <dd>Ladder + Corrections</dd>
          </div>
          <div>
            <dt>Skin</dt>
            <dd>PSL, Sub5 to Gigachad</dd>
          </div>
        </dl>
      </div>

      <div ref={cardRef} className={revealCx("modal-card flagship-card", cardIn)}>
        <div className="flagship-row">
          <span>$MOGGED</span>
        </div>
        <div className="flagship-row">
          <span>VAULT</span>
          <strong className="dd-with-logo">
            <StockLogo ticker="LLY" size={16} /> $LLY, stacking
          </strong>
        </div>
        <div className="flagship-row">
          <span>DAY 90</span>
          <strong>the stream unlocks</strong>
        </div>
        <div className="flagship-row">
          <span>BAIL EARLY</span>
          <strong>corrected, posted</strong>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

function Architecture() {
  const [headRef, headIn] = useInView();
  const [listRef, listIn] = useInView();
  return (
    <section id="architecture" className="section architecture-section">
      <div ref={headRef} className={revealCx("section-head", headIn)}>
        <h2>
          Five small contracts. One
          <br />
          factory. No owner keys.
        </h2>
      </div>
      <div ref={listRef} className={staggerCx("contracts-list", listIn)}>
        {CONTRACTS.map((c) => (
          <div key={c.id} className="contract-row">
            <span className="contract-id">{c.id}</span>
            <span className="contract-name">{c.name}</span>
            <span className="contract-body">{c.body}</span>
          </div>
        ))}
      </div>
      <p className="architecture-note">
        The distribution, time-weighting and crank logic are adapted from a contract set with{" "}
        <strong>51 passing tests</strong>, plus 6 checks that run against live mainnet state.
        Factory, staking shell and fee routing are built. Audit and securities review gate
        mainnet, by design.
      </p>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

function TrustList() {
  const [headRef, headIn] = useInView();
  const [listRef, listIn] = useInView();
  return (
    <section className="section trustlist-section">
      <div ref={headRef} className={revealCx("section-head", headIn)}>
        <h2>
          Built so nobody
          <br />
          has to trust us.
        </h2>
      </div>
      <div ref={listRef} className={staggerCx("trustlist", listIn)}>
        {TRUST_ITEMS.map((it) => (
          <div key={it.title} className="trustlist-row">
            <div className="trustlist-title">{it.title}</div>
            <div className="trustlist-body">{it.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

function Faq() {
  const [open, setOpen] = useState(0);
  const [headRef, headIn] = useInView();
  const [listRef, listIn] = useInView();
  return (
    <section id="faq" className="section faq-section">
      <div ref={headRef} className={revealCx("section-head", headIn)}>
        <h2>Straight answers.</h2>
      </div>
      <div ref={listRef} className={staggerCx("faq-list", listIn)}>
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className={"faq-row" + (isOpen ? " open" : "")}>
              <button className="faq-question" onClick={() => setOpen(isOpen ? -1 : i)}>
                <span>{item.q}</span>
                <Plus open={isOpen} />
              </button>
              <div className="faq-answer-wrap">
                <div className="faq-answer">{item.a}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

function Roadmap() {
  const [cardRef, cardIn] = useInView();
  const [rightRef, rightIn] = useInView();
  return (
    <section className="section roadmap-section">
      <div ref={cardRef} className={revealCx("modal-card roadmap-card", cardIn)}>
        <div className="roadmap-left">
          <h2>
            The factory opens
            <br />
            after the flagship.
          </h2>
          <p>
            $MOGGED goes first and takes the arrows. When the gates clear, early access opens in
            order of the list, one token at a time, deliberately.
          </p>
          <div className="roadmap-needs">
            <div className="roadmap-needs-title">What your token needs</div>
            <ul>
              {TOKEN_NEEDS.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        </div>
        <div ref={rightRef} className={staggerCx("roadmap-right", rightIn)}>
          {ROADMAP_STEPS.map((s) => (
            <div key={s.n} className="roadmap-row">
              <span className="roadmap-n">{s.n}</span>
              <div>
                <div className="roadmap-row-title">{s.title}</div>
                <div className="roadmap-row-body">{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="site-footer">
      <div className="brand">
        <span className="brand-mark">
          <Mark size={18} />
        </span>
        <span className="brand-name small">BOUND</span>
      </div>
      <span className="footer-note">Attach any token to a real stock.</span>
    </footer>
  );
}