import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Portfolio.css";
import daplogo from "../assets/daplogo.png";
import vectorPng from "../assets/vector.png";
import shubhEnggPdf from "../assets/broucers/shubh engg.pdf";
import ShaderBackground from "../components/ShaderBackground";

// Projects section data
interface WebsiteProject {
  id: string;
  title: string;
  desc: string;
  url: string;
  screenshot: string;
}

interface AppProject {
  id: string;
  title: string;
  desc: string;
  platform: "ios" | "android" | "both";
  storeUrl: string;
  accentColor: string;
  screenshots: string[];
}

const WEBSITE_PROJECTS: WebsiteProject[] = [
  {
    id: "w1",
    title: "VK Automation and Control",
    desc: "Showcases industrial automation services and company expertise.",
    url: "https://vkautomationandcontrol.in",
    screenshot:
      "https://api.microlink.io/?url=https://vkautomationandcontrol.in&screenshot=true&meta=false&embed=screenshot.url",
  },
  {
    id: "w2",
    title: "Sunrisr System",
    desc: "Highlights practical automation and systems solutions for clients.",
    url: "https://sunrisrsystem.co.in",
    screenshot:
      "https://api.microlink.io/?url=https://sunrisrsystem.co.in&screenshot=true&meta=false&embed=screenshot.url",
  },
  {
    id: "w3",
    title: "Uma Sensor",
    desc: "Presents sensor and instrumentation products in a clean catalog style.",
    url: "https://umasensor.co.in",
    screenshot:
      "https://api.microlink.io/?url=https://umasensor.co.in&screenshot=true&meta=false&embed=screenshot.url",
  },
  {
    id: "w4",
    title: "Millennium Automation System",
    desc: "Explains automation capabilities, portfolio work, and service coverage.",
    url: "https://millenniumautomationsystem.com",
    screenshot:
      "https://api.microlink.io/?url=https://millenniumautomationsystem.com&screenshot=true&meta=false&embed=screenshot.url",
  },
  {
    id: "w5",
    title: "Atreya IoT",
    desc: "Focuses on connected devices and real-world IoT implementation.",
    url: "https://atreyaiot.in",
    screenshot:
      "https://api.microlink.io/?url=https://atreyaiot.in&screenshot=true&meta=false&embed=screenshot.url",
  },
  {
    id: "w6",
    title: "Creative Infra",
    desc: "A straightforward business site for creative and infrastructure services.",
    url: "https://creativeinfra.me",
    screenshot:
      "https://api.microlink.io/?url=https://creativeinfra.me&screenshot=true&meta=false&embed=screenshot.url",
  },
];

const APP_PROJECTS: AppProject[] = [
  {
    id: "a1",
    title: "App Name",
    desc: "What this app does in one sentence.",
    platform: "ios",
    storeUrl: "https://apps.apple.com/your-link",
    accentColor: "180,120,255",
    screenshots: [
      "https://via.placeholder.com/390x844/120820/ffffff?text=Screen+1",
      "https://via.placeholder.com/390x844/120820/ffffff?text=Screen+2",
    ],
  },
  {
    id: "a2",
    title: "App Name",
    desc: "What this app does in one sentence.",
    platform: "android",
    storeUrl: "https://play.google.com/store/apps/your-link",
    accentColor: "80,220,160",
    screenshots: [
      "https://via.placeholder.com/390x844/081508/ffffff?text=Screen+1",
      "https://via.placeholder.com/390x844/081508/ffffff?text=Screen+2",
    ],
  },
];

// PDF.js loader
const PDFJS_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function loadPdfJs(): Promise<any> {
  return new Promise((resolve) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const s = document.createElement("script");
    s.src = PDFJS_SRC;
    s.onload = () => {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      resolve((window as any).pdfjsLib);
    };
    document.head.appendChild(s);
  });
}

function getSpreadPages(s: number, total: number) {
  if (s === 0) return { left: null as number | null, right: 1 };
  const l = s * 2;
  const r = s * 2 + 1;
  return { left: l <= total ? l : null, right: r <= total ? r : null };
}

const FlipbookViewer: React.FC<{ pdfPath: string }> = ({ pdfPath }) => {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [spread, setSpread] = useState(0);
  const [total, setTotal] = useState(0);
  const [numSpreads, setNumSpreads] = useState(1);
  const [flipping, setFlipping] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  const pdfRef = useRef<any>(null);
  const cacheRef = useRef<Record<number, HTMLCanvasElement>>({});
  const spreadRef = useRef(0);
  const flippingRef = useRef(false);
  const totalRef = useRef(0);
  const numSpRef = useRef(1);
  const bookLeftRef = useRef<HTMLDivElement>(null);
  const bookRightRef = useRef<HTMLDivElement>(null);
  const canvasLRef = useRef<HTMLCanvasElement>(null);
  const canvasRRef = useRef<HTMLCanvasElement>(null);
  const flipLayerRef = useRef<HTMLDivElement>(null);
  const flipPageRef = useRef<HTMLDivElement>(null);
  const flipFrontRef = useRef<HTMLDivElement>(null);
  const flipBackRef = useRef<HTMLDivElement>(null);
  const zoomCanvRef = useRef<HTMLCanvasElement>(null);
  const touchXRef = useRef(0);

  useEffect(() => {
    spreadRef.current = spread;
  }, [spread]);
  useEffect(() => {
    flippingRef.current = flipping;
  }, [flipping]);
  useEffect(() => {
    totalRef.current = total;
  }, [total]);
  useEffect(() => {
    numSpRef.current = numSpreads;
  }, [numSpreads]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const lib = await loadPdfJs();
        const pdf = await lib.getDocument(pdfPath).promise;
        if (!alive) return;
        pdfRef.current = pdf;
        const n = pdf.numPages;
        const nsp = 1 + Math.ceil((n - 1) / 2);
        setTotal(n);
        totalRef.current = n;
        setNumSpreads(nsp);
        numSpRef.current = nsp;

        const p1 = await pdf.getPage(1);
        const vp1 = p1.getViewport({ scale: 1 });
        const maxH = Math.min(window.innerHeight * 0.6, 520);
        const sc = maxH / vp1.height;
        const W = Math.round(vp1.width * sc);
        const H = Math.round(vp1.height * sc);

        [bookLeftRef, bookRightRef].forEach((r) => {
          if (!r.current) return;
          r.current.style.width = W + "px";
          r.current.style.height = H + "px";
        });
        [canvasLRef, canvasRRef].forEach((r) => {
          if (!r.current) return;
          r.current.width = W;
          r.current.height = H;
        });
        if (flipLayerRef.current) {
          flipLayerRef.current.style.width = W + "px";
          flipLayerRef.current.style.height = H + "px";
        }

        await preRender(1, Math.min(8, n), sc);
        drawSpreadNow(0, n);
        setStatus("ready");
        setTimeout(() => preRender(9, Math.min(20, n), sc), 1200);
      } catch {
        if (alive) setStatus("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, [pdfPath]);

  async function preRender(from: number, to: number, sc?: number) {
    const pdf = pdfRef.current;
    if (!pdf) return;
    const scale =
      sc ?? (canvasLRef.current ? canvasLRef.current.width / 800 : 1.2);
    for (let i = from; i <= to; i++) {
      if (cacheRef.current[i]) continue;
      try {
        const pg = await pdf.getPage(i);
        const vp = pg.getViewport({ scale });
        const c = document.createElement("canvas");
        c.width = Math.round(vp.width);
        c.height = Math.round(vp.height);
        await pg.render({ canvasContext: c.getContext("2d"), viewport: vp })
          .promise;
        cacheRef.current[i] = c;
      } catch {
        break;
      }
    }
  }

  function blitPage(
    canvas: HTMLCanvasElement | null,
    pageNum: number | null,
    n: number,
  ) {
    if (!canvas) return;
    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    if (pageNum && pageNum <= n && cacheRef.current[pageNum]) {
      ctx.drawImage(cacheRef.current[pageNum], 0, 0, W, H);
    } else {
      ctx.fillStyle = "#ede8df";
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawSpreadNow(s: number, n: number) {
    const { left, right } = getSpreadPages(s, n);
    blitPage(canvasLRef.current, left, n);
    blitPage(canvasRRef.current, right, n);
  }

  function makeThumb(pageNum: number | null): HTMLCanvasElement {
    const W = canvasLRef.current?.width || 400;
    const H = canvasLRef.current?.height || 560;
    const n = totalRef.current;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d")!;
    if (pageNum && pageNum <= n && cacheRef.current[pageNum]) {
      ctx.drawImage(cacheRef.current[pageNum], 0, 0, W, H);
    } else {
      ctx.fillStyle = "#ede8df";
      ctx.fillRect(0, 0, W, H);
    }
    return c;
  }

  const flipForward = useCallback(async () => {
    const s = spreadRef.current;
    const nsp = numSpRef.current;
    const n = totalRef.current;
    if (flippingRef.current || s >= nsp - 1) return;
    flippingRef.current = true;
    setFlipping(true);
    const next = s + 1;
    const cur = getSpreadPages(s, n);
    const nxt = getSpreadPages(next, n);
    const need = ([cur.right, nxt.left, nxt.right] as (number | null)[]).filter(
      (x): x is number => !!x && x <= n,
    );
    if (need.length) await preRender(need[0], need[need.length - 1]);
    if (nxt.right && nxt.right + 6 <= n)
      preRender(nxt.right + 1, nxt.right + 6);

    const fl = flipLayerRef.current;
    if (fl) {
      fl.style.right = "0";
      fl.style.left = "auto";
    }
    if (flipFrontRef.current) {
      flipFrontRef.current.innerHTML = "";
      flipFrontRef.current.appendChild(makeThumb(cur.right));
    }
    if (flipBackRef.current) {
      flipBackRef.current.innerHTML = "";
      const bc = makeThumb(nxt.left);
      bc.style.transform = "scaleX(-1)";
      flipBackRef.current.appendChild(bc);
    }
    blitPage(canvasRRef.current, nxt.right, n);
    if (canvasLRef.current) {
      const ctx = canvasLRef.current.getContext("2d")!;
      ctx.fillStyle = "#ede8df";
      ctx.fillRect(0, 0, canvasLRef.current.width, canvasLRef.current.height);
    }

    const fp = flipPageRef.current;
    if (fp) {
      fp.style.transition = "none";
      fp.style.transform = "rotateY(0deg)";
      fp.style.transformOrigin = "left center";
      fp.style.display = "block";
      fp.offsetHeight;
      fp.style.transition =
        "transform 0.78s cubic-bezier(0.645,0.045,0.355,1.000)";
      fp.style.transform = "rotateY(-180deg)";
    }
    setTimeout(() => {
      if (fp) {
        fp.style.display = "none";
        fp.style.transform = "rotateY(0deg)";
      }
      const ns = next;
      setSpread(ns);
      spreadRef.current = ns;
      blitPage(canvasLRef.current, nxt.left, n);
      flippingRef.current = false;
      setFlipping(false);
    }, 840);
  }, []);

  const flipBackward = useCallback(async () => {
    const s = spreadRef.current;
    const n = totalRef.current;
    if (flippingRef.current || s <= 0) return;
    flippingRef.current = true;
    setFlipping(true);
    const prev = s - 1;
    const cur = getSpreadPages(s, n);
    const prv = getSpreadPages(prev, n);
    const need = ([cur.left, prv.left, prv.right] as (number | null)[]).filter(
      (x): x is number => !!x && x <= n,
    );
    if (need.length) await preRender(need[0], need[need.length - 1]);

    const fl = flipLayerRef.current;
    if (fl) {
      fl.style.left = "0";
      fl.style.right = "auto";
    }
    if (flipFrontRef.current) {
      flipFrontRef.current.innerHTML = "";
      flipFrontRef.current.appendChild(makeThumb(prv.right));
    }
    if (flipBackRef.current) {
      flipBackRef.current.innerHTML = "";
      const bc = makeThumb(cur.left);
      bc.style.transform = "scaleX(-1)";
      flipBackRef.current.appendChild(bc);
    }

    const fp = flipPageRef.current;
    if (fp) {
      fp.style.transition = "none";
      fp.style.transform = "rotateY(180deg)";
      fp.style.transformOrigin = "right center";
      fp.style.display = "block";
      fp.offsetHeight;
      fp.style.transition =
        "transform 0.78s cubic-bezier(0.645,0.045,0.355,1.000)";
      fp.style.transform = "rotateY(0deg)";
    }
    setTimeout(() => {
      if (fp) {
        fp.style.display = "none";
        fp.style.transformOrigin = "left center";
        fp.style.transform = "rotateY(0deg)";
      }
      if (fl) {
        fl.style.right = "0";
        fl.style.left = "auto";
      }
      const ns = prev;
      setSpread(ns);
      spreadRef.current = ns;
      drawSpreadNow(ns, n);
      flippingRef.current = false;
      setFlipping(false);
    }, 840);
  }, []);

  const jumpTo = useCallback(async (target: number) => {
    if (flippingRef.current) return;
    const n = totalRef.current;
    const sp = getSpreadPages(target, n);
    const pages = ([sp.left, sp.right] as (number | null)[]).filter(
      (x): x is number => !!x && x <= n,
    );
    if (pages.length) await preRender(pages[0], pages[pages.length - 1]);
    setSpread(target);
    spreadRef.current = target;
    drawSpreadNow(target, n);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (zoomOpen) {
        if (e.key === "Escape") setZoomOpen(false);
        return;
      }
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        flipForward();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        flipBackward();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [flipForward, flipBackward, zoomOpen]);

  const openZoom = async () => {
    const n = totalRef.current;
    const { right, left } = getSpreadPages(spreadRef.current, n);
    const pg = right && right <= n ? right : left;
    if (!pg || !pdfRef.current) return;
    const page = await pdfRef.current.getPage(pg);
    const vp = page.getViewport({ scale: 3 });
    const c = zoomCanvRef.current;
    if (!c) return;
    c.width = vp.width;
    c.height = vp.height;
    await page.render({ canvasContext: c.getContext("2d"), viewport: vp })
      .promise;
    setZoomOpen(true);
  };

  const { left: sl, right: sr } = getSpreadPages(spread, total);
  const pageLabel = !sl
    ? `p.${sr} / ${total}`
    : !sr || sr > total
      ? `p.${sl} / ${total}`
      : `p.${sl}-${sr} / ${total}`;
  const dotCount = Math.min(numSpreads, 16);
  const prevDis = spread <= 0 || flipping;
  const nextDis = spread >= numSpreads - 1 || flipping;

  if (status === "loading")
    return (
      <div className="proj-fb-loading">
        <div className="proj-fb-spinner" />
        <span>Opening portfolio...</span>
      </div>
    );
  if (status === "error")
    return (
      <div className="proj-fb-loading">
        <p
          style={{
            color: "rgba(230,57,70,0.85)",
            fontSize: 14,
            textAlign: "center",
            lineHeight: 1.7,
          }}
        >
          Could not load PDF.
          <br />
          Ensure <code>src/assets/broucers/shubh engg.pdf</code> exists.
        </p>
      </div>
    );

  return (
    <>
      <div
        className="proj-book-scene"
        onTouchStart={(e) => {
          touchXRef.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchXRef.current;
          if (Math.abs(dx) > 50) {
            dx < 0 ? flipForward() : flipBackward();
          }
        }}
      >
        <button
          className="proj-arrow proj-arrow-l"
          onClick={flipBackward}
          disabled={prevDis}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            width="18"
            height="18"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="proj-book">
          <div className="proj-book-left" ref={bookLeftRef}>
            <canvas ref={canvasLRef} />
            <div
              className="proj-corner-prev"
              onClick={flipBackward}
              style={{ display: spread <= 0 ? "none" : "block" }}
            />
          </div>
          <div className="proj-book-spine" />
          <div className="proj-book-right" ref={bookRightRef}>
            <canvas ref={canvasRRef} />
            <div
              className="proj-corner-next"
              onClick={flipForward}
              style={{ display: spread >= numSpreads - 1 ? "none" : "block" }}
            />
          </div>
          <div
            className="proj-flip-layer"
            ref={flipLayerRef}
            style={{ right: 0 }}
          >
            <div
              className="proj-flip-page"
              ref={flipPageRef}
              style={{ display: "none" }}
            >
              <div className="proj-flip-front" ref={flipFrontRef} />
              <div className="proj-flip-back" ref={flipBackRef} />
            </div>
          </div>
        </div>
        <button
          className="proj-arrow proj-arrow-r"
          onClick={flipForward}
          disabled={nextDis}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            width="18"
            height="18"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="proj-book-controls">
        <button
          className="proj-ctrl-btn"
          onClick={flipBackward}
          disabled={prevDis}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            width="16"
            height="16"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="proj-dots">
          {Array.from({ length: dotCount }, (_, i) => {
            const ts = Math.round(
              (i * (numSpreads - 1)) / Math.max(dotCount - 1, 1),
            );
            return (
              <div
                key={i}
                className={`proj-dot${Math.abs(ts - spread) < 1 ? " active" : ""}`}
                onClick={() => jumpTo(ts)}
              />
            );
          })}
        </div>
        <span className="proj-pg-label">{pageLabel}</span>
        <button
          className="proj-ctrl-btn"
          onClick={flipForward}
          disabled={nextDis}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            width="16"
            height="16"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <button className="proj-ctrl-btn proj-zoom-btn" onClick={openZoom}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="15"
            height="15"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          Zoom
        </button>
      </div>

      {zoomOpen && (
        <div className="proj-zoom-overlay" onClick={() => setZoomOpen(false)}>
          <canvas ref={zoomCanvRef} />
          <button
            className="proj-zoom-close"
            onClick={() => setZoomOpen(false)}
          >
            X
          </button>
        </div>
      )}
    </>
  );
};

const WebsiteShowcase: React.FC<{ projects: WebsiteProject[] }> = ({
  projects,
}) => {
  const [selected, setSelected] = useState<WebsiteProject | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  return (
    <div className="proj-web-wrap">
      <div className="proj-web-grid">
        {projects.map((p) => (
          <button
            key={p.id}
            className="proj-web-card"
            onClick={() => setSelected(p)}
          >
            <div className="proj-browser-chrome">
              <div className="proj-bdots">
                <span style={{ background: "#ff5f57" }} />
                <span style={{ background: "#febc2e" }} />
                <span style={{ background: "#28c840" }} />
              </div>
              <div className="proj-browser-bar">
                <span className="proj-browser-url">
                  {p.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </span>
              </div>
            </div>
            <div className="proj-browser-screen">
              {imgErrors[p.id] ? (
                <div className="proj-screenshot-fallback">
                  <span>Preview unavailable</span>
                </div>
              ) : (
                <img
                  src={p.screenshot}
                  alt={p.title}
                  loading="lazy"
                  onError={() =>
                    setImgErrors((prev) => ({
                      ...prev,
                      [p.id]: true,
                    }))
                  }
                />
              )}
              <div className="proj-card-hover-overlay">
                <span>Open Preview</span>
              </div>
            </div>
            <div className="proj-card-footer">
              <span className="proj-card-title">{p.title}</span>
              <span className="proj-card-desc">{p.desc}</span>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="proj-popup-bg" onClick={() => setSelected(null)}>
          <div className="proj-popup" onClick={(e) => e.stopPropagation()}>
            <button
              className="proj-popup-close"
              onClick={() => setSelected(null)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                width="16"
                height="16"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="proj-popup-browser">
              <div className="proj-browser-chrome proj-chrome-lg">
                <div className="proj-bdots">
                  <span style={{ background: "#ff5f57" }} />
                  <span style={{ background: "#febc2e" }} />
                  <span style={{ background: "#28c840" }} />
                </div>
                <div className="proj-browser-bar proj-bar-lg">
                  <span className="proj-browser-url">
                    {selected.url
                      .replace(/^https?:\/\//, "")
                      .replace(/\/$/, "")}
                  </span>
                </div>
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="proj-visit-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  Visit Site
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    width="12"
                    height="12"
                  >
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </a>
              </div>
              <div className="proj-popup-screen">
                <iframe
                  src={selected.url}
                  title={selected.title}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
                {!imgErrors[selected.id] && (
                  <img
                    className="proj-popup-screenshot-bg"
                    src={selected.screenshot}
                    alt={selected.title}
                    onError={() =>
                      setImgErrors((prev) => ({
                        ...prev,
                        [selected.id]: true,
                      }))
                    }
                  />
                )}
              </div>
            </div>
            <div className="proj-popup-info">
              <h3 className="proj-popup-title">{selected.title}</h3>
              <p className="proj-popup-desc">{selected.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PhoneMockup: React.FC<{
  screenshots: string[];
  accentColor: string;
  platform: string;
}> = ({ screenshots, accentColor, platform }) => {
  const [screen, setScreen] = useState(0);
  const touchXRef = useRef(0);
  const isAndroid = platform === "android";
  const prev = () => setScreen((s) => Math.max(0, s - 1));
  const next = () => setScreen((s) => Math.min(screenshots.length - 1, s + 1));
  return (
    <div className="proj-phone-outer">
      <div
        className="proj-phone-frame"
        style={{ "--app-clr": accentColor } as React.CSSProperties}
        onTouchStart={(e) => {
          touchXRef.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchXRef.current;
          if (dx < -40) next();
          if (dx > 40) prev();
        }}
      >
        <div className="proj-phone-side-l">
          <div className="proj-btn-vol" />
          <div className="proj-btn-vol" />
        </div>
        <div className="proj-phone-side-r">
          <div className="proj-btn-pwr" />
        </div>
        <div className="proj-phone-body">
          {!isAndroid && (
            <div className="proj-phone-notch">
              <div className="proj-notch-inner" />
            </div>
          )}
          {isAndroid && <div className="proj-phone-camera" />}
          <div className="proj-phone-screen">
            <div
              className="proj-screen-track"
              style={{ transform: `translateX(-${screen * 100}%)` }}
            >
              {screenshots.map((src, i) => (
                <div key={i} className="proj-screen-slide">
                  <img src={src} alt={`Screen ${i + 1}`} draggable={false} />
                </div>
              ))}
            </div>
            {screen > 0 && (
              <button className="proj-screen-tap proj-tap-l" onClick={prev}>
                {"<"}
              </button>
            )}
            {screen < screenshots.length - 1 && (
              <button className="proj-screen-tap proj-tap-r" onClick={next}>
                {">"}
              </button>
            )}
          </div>
          <div
            className={`proj-phone-home-bar${isAndroid ? " android" : ""}`}
          />
        </div>
      </div>
      {screenshots.length > 1 && (
        <div className="proj-phone-dots">
          {screenshots.map((_, i) => (
            <button
              key={i}
              className={`proj-phone-dot${i === screen ? " active" : ""}`}
              style={
                i === screen ? { background: `rgba(${accentColor},0.9)` } : {}
              }
              onClick={() => setScreen(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AppShowcase: React.FC<{ projects: AppProject[] }> = ({ projects }) => {
  const [active, setActive] = useState(0);
  const proj = projects[active];
  if (!projects.length)
    return (
      <div className="proj-ph-empty">
        <p>Add your apps to APP_PROJECTS</p>
      </div>
    );
  return (
    <div className="proj-app-wrap">
      <div className="proj-app-stage">
        <PhoneMockup
          key={proj.id}
          screenshots={proj.screenshots}
          accentColor={proj.accentColor}
          platform={proj.platform}
        />
        <div
          className="proj-app-info"
          style={{ "--app-clr": proj.accentColor } as React.CSSProperties}
        >
          {projects.length > 1 && (
            <div className="proj-app-tabs">
              {projects.map((p, i) => (
                <button
                  key={p.id}
                  className={`proj-app-tab${i === active ? " active" : ""}`}
                  style={
                    i === active
                      ? {
                          borderColor: `rgba(${p.accentColor},0.7)`,
                          color: `rgba(${p.accentColor},1)`,
                        }
                      : {}
                  }
                  onClick={() => setActive(i)}
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}
          <div className="proj-app-detail">
            <h2 className="proj-app-name">{proj.title}</h2>
            <div className="proj-platform-pills">
              {(proj.platform === "ios" || proj.platform === "both") && (
                <span className="proj-platform-pill ios">iOS</span>
              )}
              {(proj.platform === "android" || proj.platform === "both") && (
                <span className="proj-platform-pill android">Android</span>
              )}
            </div>
            <p className="proj-app-desc">{proj.desc}</p>
            <a
              href={proj.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="proj-store-btn"
              style={{ "--app-clr": proj.accentColor } as React.CSSProperties}
            >
              {proj.platform === "android"
                ? "Get on Google Play"
                : "Download on App Store"}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                width="12"
                height="12"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

function useBubblePhysics(
  arenaRef: React.RefObject<HTMLDivElement>,
  defs: ReadonlyArray<{ size: number }>,
  active: boolean,
) {
  const physRef = useRef<
    Array<{ x: number; y: number; vx: number; vy: number; size: number }>
  >([]);
  const rafRef = useRef<number>(0);
  const initializedRef = useRef(false);
  const lastTimeRef = useRef(0);
  const [pos, setPos] = useState(() => defs.map(() => ({ x: 0, y: 0 })));

  const init = useCallback(() => {
    const el = arenaRef.current;
    if (!el) return false;
    const W = el.clientWidth;
    const H = el.clientHeight;
    if (W < 140 || H < 140) return false;

    const laneY = H * 0.5;
    const lanePad = 24;
    const slot = W / (defs.length + 1);
    physRef.current = defs.map((b, i) => ({
      x: Math.min(
        W - b.size - lanePad,
        Math.max(lanePad, slot * (i + 1) - b.size / 2),
      ),
      y: Math.min(
        H - b.size - lanePad,
        Math.max(lanePad, laneY - b.size / 2 + (i % 2 === 0 ? -18 : 18)),
      ),
      vx: (Math.random() - 0.5) * 0.65,
      vy: (Math.random() - 0.5) * 0.45,
      size: b.size,
    }));
    initializedRef.current = true;
    setPos(physRef.current.map((p) => ({ x: p.x, y: p.y })));
    return true;
  }, [arenaRef, defs]);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
      return;
    }

    const tick = (ts: number) => {
      const dt = lastTimeRef.current
        ? Math.min((ts - lastTimeRef.current) / 16.6667, 2)
        : 1;
      lastTimeRef.current = ts;

      const el = arenaRef.current;
      if (!el) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const W = el.clientWidth;
      const H = el.clientHeight;

      if (
        !initializedRef.current ||
        physRef.current.length !== defs.length ||
        W < 140 ||
        H < 140
      ) {
        init();
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const ps = physRef.current;
      ps.forEach((p, i) => {
        const t = ts * 0.001 + i * 1.7;

        // Soft wandering force for smooth organic drift.
        p.vx += Math.sin(t * 0.9) * 0.01;
        p.vy += Math.cos(t * 0.8) * 0.008;

        p.vx *= 0.985;
        p.vy *= 0.985;

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.x <= 0) {
          p.x = 0;
          p.vx = Math.abs(p.vx) * 0.85;
        }
        if (p.x >= W - p.size) {
          p.x = W - p.size;
          p.vx = -Math.abs(p.vx) * 0.85;
        }
        if (p.y <= 0) {
          p.y = 0;
          p.vy = Math.abs(p.vy) * 0.85;
        }
        if (p.y >= H - p.size) {
          p.y = H - p.size;
          p.vy = -Math.abs(p.vy) * 0.85;
        }

        const spd = Math.hypot(p.vx, p.vy);
        if (spd < 0.12) {
          const a = Math.random() * Math.PI * 2;
          p.vx += Math.cos(a) * 0.08;
          p.vy += Math.sin(a) * 0.08;
        }
        if (spd > 0.95) {
          p.vx *= 0.95 / spd;
          p.vy *= 0.95 / spd;
        }
      });
      setPos(ps.map((p) => ({ x: p.x, y: p.y })));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    };
  }, [active, init, arenaRef]);

  return { pos, init };
}

export const Portfolio: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip custom cursor entirely on touch/stylus devices
    if (window.matchMedia("(hover: none)").matches) return;

    // Custom cursor with smooth follow
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current && cursorDotRef.current) {
        cursorDotRef.current.style.left = e.clientX + "px";
        cursorDotRef.current.style.top = e.clientY + "px";

        requestAnimationFrame(() => {
          if (cursorRef.current) {
            cursorRef.current.style.left = e.clientX + "px";
            cursorRef.current.style.top = e.clientY + "px";
          }
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    const handleMouseDown = () =>
      cursorRef.current?.classList.add("cursor-click");
    const handleMouseUp = () =>
      cursorRef.current?.classList.remove("cursor-click");
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    // Enhanced scroll with parallax
    const handleScroll = () => {
      const winScroll =
        document.body.scrollTop || document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      const progress = document.getElementById("progress");
      if (progress) {
        progress.style.width = scrolled + "%";
      }

      // Parallax effect for hero
      const hero = document.querySelector(".hero-content") as HTMLElement;
      if (hero) {
        const scrollY = window.scrollY;
        hero.style.transform = `translateY(${scrollY * 0.5}px)`;
        hero.style.opacity = `${Math.max(0, 1 - scrollY / 800)}`;
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Enhanced scroll animations with stagger
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal");
          }
        });
      },
      { threshold: 0.1, rootMargin: "-80px" },
    );

    // Observe all animatable elements
    document
      .querySelectorAll(
        ".capability-cell, .arsenal-item, .section-header, .project-card, .contact-content",
      )
      .forEach((el) => {
        observer.observe(el);
      });

    // Magnetic effect on interactive elements
    const magneticElements = document.querySelectorAll(
      ".capability-cell, .arsenal-item",
    );

    magneticElements.forEach((el) => {
      const element = el as HTMLElement;

      element.addEventListener("mouseenter", () => {
        if (cursorRef.current) {
          cursorRef.current.classList.add("cursor-hover");
        }
      });

      element.addEventListener("mouseleave", () => {
        if (cursorRef.current) {
          cursorRef.current.classList.remove("cursor-hover");
        }
        element.style.transform = "translate(0, 0) scale(1)";
      });

      element.addEventListener("mousemove", (e: Event) => {
        const mouseEvent = e as MouseEvent;
        const rect = element.getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left - rect.width / 2;
        const y = mouseEvent.clientY - rect.top - rect.height / 2;

        element.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px) scale(1.02)`;
      });
    });

    // Email hover effect
    const emailEl = document.querySelector(".contact-email") as HTMLElement;
    if (emailEl) {
      emailEl.addEventListener("mouseenter", () => {
        if (cursorRef.current) {
          cursorRef.current.classList.add("cursor-hover");
        }
      });

      emailEl.addEventListener("mouseleave", () => {
        if (cursorRef.current) {
          cursorRef.current.classList.remove("cursor-hover");
        }
      });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      observer.disconnect();
    };
  }, []);

  const BUBBLE_DEFS = [
    {
      id: "gd",
      label: ["Graphic", "Design"],
      clr: "180,120,255",
      size: 155,
      icon: (
        <svg viewBox="0 0 40 40" fill="none" width="38" height="38">
          <circle
            cx="20"
            cy="20"
            r="11"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth="1.5"
          />
          <circle
            cx="20"
            cy="20"
            r="5"
            fill="rgba(255,255,255,0.12)"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
          />
          <circle cx="28" cy="12" r="2.5" fill="rgba(255,255,255,0.65)" />
        </svg>
      ),
    },
    {
      id: "web",
      label: ["Website"],
      clr: "80,180,255",
      size: 136,
      icon: (
        <svg viewBox="0 0 40 40" fill="none" width="34" height="34">
          <rect
            x="5"
            y="9"
            width="30"
            height="22"
            rx="3"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth="1.5"
          />
          <path
            d="M5 15h30"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.5"
          />
          <rect
            x="9"
            y="19"
            width="8"
            height="6"
            rx="1"
            fill="rgba(255,255,255,0.15)"
          />
          <rect
            x="20"
            y="19"
            width="12"
            height="2"
            rx="1"
            fill="rgba(255,255,255,0.2)"
          />
          <rect
            x="20"
            y="23"
            width="8"
            height="2"
            rx="1"
            fill="rgba(255,255,255,0.12)"
          />
        </svg>
      ),
    },
    {
      id: "app",
      label: ["App"],
      clr: "80,220,160",
      size: 122,
      icon: (
        <svg viewBox="0 0 40 40" fill="none" width="30" height="30">
          <rect
            x="11"
            y="4"
            width="18"
            height="32"
            rx="4"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth="1.5"
          />
          <circle cx="20" cy="31" r="1.5" fill="rgba(255,255,255,0.55)" />
          <rect
            x="14"
            y="9"
            width="12"
            height="16"
            rx="1"
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
          />
        </svg>
      ),
    },
  ] as const;

  const ProjectsBubbleSection: React.FC = () => {
    const [panel, setPanel] = useState<string | null>(null);
    const [burstId, setBurstId] = useState<string | null>(null);
    const [exitIds, setExitIds] = useState<string[]>([]);
    const arenaRef = useRef<HTMLDivElement>(null);
    const { pos, init } = useBubblePhysics(arenaRef, BUBBLE_DEFS, !panel);

    const openPanel = (id: string) => {
      setBurstId(id);
      setExitIds(BUBBLE_DEFS.map((b) => b.id).filter((bid) => bid !== id));
      setTimeout(() => {
        setPanel(id);
        setBurstId(null);
        setExitIds([]);
      }, 450);
    };

    const closePanel = () => {
      setPanel(null);
      init();
    };

    useEffect(() => {
      const h = (e: KeyboardEvent) => {
        if (e.key === "Escape" && panel) closePanel();
      };
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }, [panel]);

    return (
      <div className="proj-root">
        <div className={`proj-arena-wrap${panel ? " hidden" : ""}`}>
          <div className="proj-arena" ref={arenaRef}>
            {BUBBLE_DEFS.map((b, i) => {
              const burst = burstId === b.id;
              const exitL = exitIds[0] === b.id;
              const exitR = exitIds[1] === b.id;
              return (
                <div
                  key={b.id}
                  className={[
                    "proj-bubble",
                    burst && "is-burst",
                    exitL && "is-exit-l",
                    exitR && "is-exit-r",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={
                    {
                      "--clr": b.clr,
                      width: b.size,
                      height: b.size,
                      transform: `translate3d(${Math.round(pos[i]?.x ?? 0)}px,${Math.round(pos[i]?.y ?? 0)}px,0)`,
                    } as React.CSSProperties
                  }
                  onClick={() => !burst && !exitL && !exitR && openPanel(b.id)}
                >
                  <div className="proj-bubble-inner">
                    {b.icon}
                    {b.label.map((l, li) => (
                      <span key={li}>{l}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="proj-arena-hint">Click a bubble to explore</p>
        </div>

        <div className={`proj-panel${panel === "gd" ? " open" : ""}`}>
          <button className="proj-back" onClick={closePanel}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              width="15"
              height="15"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          {panel === "gd" && <FlipbookViewer pdfPath={shubhEnggPdf} />}
        </div>

        <div className={`proj-panel${panel === "web" ? " open" : ""}`}>
          <button className="proj-back" onClick={closePanel}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              width="15"
              height="15"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          {panel === "web" && <WebsiteShowcase projects={WEBSITE_PROJECTS} />}
        </div>

        <div className={`proj-panel${panel === "app" ? " open" : ""}`}>
          <button className="proj-back" onClick={closePanel}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              width="15"
              height="15"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          {panel === "app" && <AppShowcase projects={APP_PROJECTS} />}
        </div>
      </div>
    );
  };

  return (
    <div className="portfolio-page">
      {window.matchMedia("(hover: hover)").matches && (
        <>
          <div ref={cursorRef} className="custom-cursor"></div>
          <div ref={cursorDotRef} className="custom-cursor-dot"></div>
        </>
      )}

      <ShaderBackground className="shader-background" />
      <div className="grid-overlay"></div>
      <div className="ambient-glow" id="glow"></div>

      <section className="hero" id="hero">
        <div className="hero-content">
          <div className="hero-main">
            <div className="logo-mark">
              <img src={daplogo} alt="DAP Logo" className="logo-image" />
            </div>
          </div>

          <h1 className="hero-title fade-in-up">
            DAP <span className="hero-subtitle">STUDIOS</span>
          </h1>
          <p className="hero-tagline fade-in-up delay-1">
            Adapt · Elevate · Amplify
          </p>
        </div>
      </section>

      <section className="capabilities" id="capabilities">
        <div className="section-header">
          <p className="section-number">// 01</p>
          <h2 className="section-title">Services</h2>
        </div>

        <div className="capability-grid">
          <div className="capability-cell">
            <svg className="capability-icon" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            <h3 className="capability-name">Web Development</h3>
            <p className="capability-desc">
              Responsive, fast, and scalable websites built with modern
              frameworks and clean architecture.
            </p>
          </div>

          <div className="capability-cell">
            <svg className="capability-icon" viewBox="0 0 24 24">
              <path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 19H7V4h10v16z" />
              <circle cx="12" cy="16" r="1" />
            </svg>
            <h3 className="capability-name">Mobile Apps</h3>
            <p className="capability-desc">
              Native and cross-platform applications designed for performance,
              usability, and engagement.
            </p>
          </div>

          <div className="capability-cell">
            <svg className="capability-icon" viewBox="0 0 24 24">
              <path d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4zm6 9l-4 5h12l-3-4-2.03 2.71L10 13zm7-4.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5zM20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2zm0 18h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7zM4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z" />
            </svg>
            <h3 className="capability-name">Custom Software</h3>
            <p className="capability-desc">
              Tailored solutions for business automation, dashboards, APIs, and
              internal tools.
            </p>
          </div>

          <div className="capability-cell">
            <svg className="capability-icon" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <h3 className="capability-name">UI/UX Design</h3>
            <p className="capability-desc">
              User-centered interfaces that balance aesthetics, function, and
              accessibility.
            </p>
          </div>

          <div className="capability-cell">
            <svg className="capability-icon" viewBox="0 0 24 24">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            <h3 className="capability-name">Graphic Design</h3>
            <p className="capability-desc">
              Creative branding, logos, posters, and print materials that define
              your visual identity.
            </p>
          </div>

          <div className="capability-cell">
            <svg className="capability-icon" viewBox="0 0 24 24">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
            </svg>
            <h3 className="capability-name">Social Media Marketing</h3>
            <p className="capability-desc">
              Strategic growth, ad campaigns, and content management to boost
              online engagement.
            </p>
          </div>
        </div>
      </section>

      <section className="arsenal" id="arsenal">
        <div className="section-header">
          <p className="section-number">// 02</p>
          <h2 className="section-title">Stack</h2>
        </div>

        <div className="arsenal-list">
          <div className="arsenal-item">
            <span className="arsenal-name">Frontend</span>
            <span className="arsenal-type">
              React · Vue · TypeScript · Tailwind
            </span>
          </div>
          <div className="arsenal-item">
            <span className="arsenal-name">Backend</span>
            <span className="arsenal-type">
              Node.js · Python · Firebase · PostgreSQL
            </span>
          </div>
          <div className="arsenal-item">
            <span className="arsenal-name">Mobile</span>
            <span className="arsenal-type">
              React Native · Flutter · iOS · Android
            </span>
          </div>
          <div className="arsenal-item">
            <span className="arsenal-name">Design</span>
            <span className="arsenal-type">
              Photoshop · Illustrator · InkScape · Figma
            </span>
          </div>
        </div>
      </section>

      <section className="revolving-section">
        <div className="revolving-container">
          <div className="revolving-carousel">
            <div className="revolving-item">
              <span className="revolving-label">React</span>
            </div>
            <div className="revolving-item">
              <span className="revolving-label">TypeScript</span>
            </div>
            <div className="revolving-item">
              <span className="revolving-label">Firebase</span>
            </div>
            <div className="revolving-item">
              <span className="revolving-label">Tailwind</span>
            </div>
            <div className="revolving-item">
              <span className="revolving-label">Node.js</span>
            </div>
            <div className="revolving-item">
              <span className="revolving-label">Python</span>
            </div>
          </div>
          <p className="revolving-text">Featured Technologies</p>
        </div>
      </section>

      <section className="vectors" id="vectors">
        <div className="section-header">
          <p className="section-number">// 03</p>
          <h2 className="section-title">Identity</h2>
        </div>

        <div className="brand-reveal">
          <div className="brand-reveal-ring brand-reveal-ring-1" />
          <div className="brand-reveal-ring brand-reveal-ring-2" />
          <div className="brand-reveal-ring brand-reveal-ring-3" />
          <div className="brand-reveal-logo">
            <img src={daplogo} alt="DAP Logo" className="brand-reveal-img" />
          </div>
          <div className="brand-orbit-label brand-orbit-studios">
            <span className="orbit-tag">DAP</span>
            <span className="orbit-name">Studios</span>
            <span className="orbit-desc">Creative · Design · Brand</span>
          </div>
          <div className="brand-orbit-label brand-orbit-tech">
            <span className="orbit-tag">DAP</span>
            <span className="orbit-name">Tech</span>
            <span className="orbit-desc">Build · Code · Deploy</span>
          </div>
        </div>

        <div className="brand-pillars">
          <div className="brand-pillar brand-pillar-studios">
            <div className="pillar-number">01</div>
            <h3 className="pillar-name">DAP Studios</h3>
            <p className="pillar-desc">
              Creative direction, visual identity, graphic design, illustration,
              motion, and print collateral.
            </p>
            <ul className="pillar-tags">
              {[
                "Logo Design",
                "Brand Identity",
                "Illustration",
                "Print Design",
                "Motion Graphics",
              ].map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

          <div className="brand-pillar-divider" />

          <div className="brand-pillar brand-pillar-tech">
            <div className="pillar-number">02</div>
            <h3 className="pillar-name">DAP Tech</h3>
            <p className="pillar-desc">
              Web applications, mobile development, backend APIs, automation,
              and scalable digital products.
            </p>
            <ul className="pillar-tags">
              {[
                "Web Apps",
                "Mobile Apps",
                "UI/UX",
                "Backend",
                "Automation",
              ].map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="vectors-png-wrap">
          <img
            src={vectorPng}
            alt="DAP vector artwork"
            className="vectors-png-image"
          />
        </div>
      </section>

      <section className="projects" id="projects">
        <div className="section-header">
          <p className="section-number">// 04</p>
          <h2 className="section-title">Projects</h2>
        </div>
        <ProjectsBubbleSection />
      </section>

      <section className="contact" id="contact">
        <div className="contact-content">
          <h2 className="contact-title">
            Start
            <br />A Project
          </h2>
          <p className="contact-subtitle">
            Looking for a reliable, detail-oriented developer?
            <br />
            Let's build something exceptional together.
          </p>
          <a href="mailto:daptechsol@gmail.com" className="contact-email">
            daptechsol@gmail.com
          </a>
        </div>
      </section>

      <footer>
        <div className="footer-grid">
          <p className="footer-text">DAP Studios</p>
          <p className="footer-year">EST. 2025</p>
        </div>
      </footer>

      <div className="status-bar">
        <div className="status-progress" id="progress"></div>
      </div>
    </div>
  );
};
