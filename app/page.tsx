import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { load } from "cheerio";

const overlayImages: { [key: string]: { [key: string]: string | null } } = {
  "None": {
    "Weed Green": null,
    "Purple Haze": null,
    "Acapulco Gold": null,
  },
  "GM Coffee": {
    "Weed Green": "/overlays/GMCoffeeGreen.png",
    "Purple Haze": "/overlays/GMCoffeePurple.png",
    "Acapulco Gold": "/overlays/GMCoffeeGold.png",
  },
  "Taco": {
    "Weed Green": "/overlays/TacoGreen.png",
    "Purple Haze": "/overlays/TacoPurple.png",
    "Acapulco Gold": "/overlays/TacoGold.png",
  },
  "Bearish": {
    "Weed Green": "/overlays/BearishGreen.png",
    "Purple Haze": "/overlays/BearishPurple.png",
    "Acapulco Gold": "/overlays/BearishGold.png",
  },
  "Canna Banana": {
    "Weed Green": "/overlays/CannaBananaGreen.png",
    "Purple Haze": "/overlays/CannaBananaPurple.png",
    "Acapulco Gold": "/overlays/CannaBananaGold.png",
  },
};

async function scrapeStrainType(tokenId: string): Promise<string | null> {
  try {
    const url = \`https://magiceden.us/item-details/abstract/0x66f7b491691eb85b17e15a8ebf3ced2adbec1996/\${tokenId}\`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(\`Failed to fetch page: \${response.status}\`);
    }
    const html = await response.text();
    const $ = load(html);
    const strainTypeElement = $("//div[text()='Strain']/following-sibling::div");
    if (strainTypeElement.length > 0) {
      return strainTypeElement.text().trim();
    } else {
      console.warn("Strain type element not found on the page.");
      return null;
    }
  } catch (error: any) {
    console.error(\`Error scraping strain type: \${error.message}\`);
    return null;
  }
}

export default function Home() {
  const [tokenId, setTokenId] = useState("77");
  const [overlay, setOverlay] = useState("None");
  const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null
>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [strainType, setStrainType] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setBaseImageUrl(null);
    setError(null);
    setStrainType(null);

    if (tokenId) {
      async function fetchMetadata() {
        try {
          const strain = await scrapeStrainType(tokenId);
          if (strain) {
            setStrainType(strain);
          } else {
            setError("Could not retrieve strain type from metadata.");
          }
        } catch (err: any) {
          setError(\`Error fetching metadata: \${err.message}\`);
        }
      }

      fetchMetadata();

      const imageUrl = \`/api/images/gm/\${tokenId}\`;
      setBaseImageUrl(imageUrl);
    }
  }, [tokenId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (baseImageUrl && overlay && isMounted && strainType) {
      const baseImg = new Image();
      baseImg.crossOrigin = "anonymous";
      baseImg.src = baseImageUrl;
      baseImg.onload = () => {
        ctx?.drawImage(baseImg, 0, 0, 1500, 1500);

        const overlayImg = new Image();
        overlayImg.crossOrigin = "anonymous";
        const overlayPath = overlayImages[overlay][strainType];
        if (overlayPath) {
          overlayImg.src = overlayPath;
          overlayImg.onload = () => {
            ctx?.drawImage(overlayImg, 0, 0, 1500, 1500);
          };
          overlayImg.onerror = () => {
            setError("Error loading overlay image.");
          };
        }
      };
      baseImg.onerror = () => {
        setError("Error loading base image
.");
      };
    }
  }, [baseImageUrl, overlay, isMounted, strainType]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const link = document.createElement("a");
      link.download = \`canna-gm-\${tokenId}-\${overlay.replace(" ", "-").toLowerCase() || "no-overlay"}.png\`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <>
      <Head>
        <title>Hempino Head Shop</title>
        <meta name="description" content="brought to you by digidreamoor" />
        <meta property="og:title" content="Hempino Head Shop" />
        <meta property="og:description" content="brought to you by digidreamoor" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FF9999] to-[#FFCC99] p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10px_10px,#FF6666_2px,transparent_2px)] bg-[length:20px_20px] opacity-30" />

        <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg max-w-md w-full relative z-10">
          <h1 className="text-3xl font-bold text-[#ff8098] mb-4 text-center">
            Hempino Head Shop
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error:</strong> {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-[#ff8098] font-semibold mb-2">
              Token ID (1-10000)
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              className="w-full p-2 border-2 border-[#FF66CC] text-[#212121] rounded focus:outline-none focus:border-[#66CCFF] transition-all"
            />
          </div>

          <div className="mb-4">
            <label className="block text-[#ff8098] font-semibold mb-2">
              Canna Get A...
            </label>
            <select
              value={overlay}
              onChange={(e) => setOverlay(e.target.value)}
              className="w-full p-2 border-2 border-[#FF66CC] text-[#212121] rounded focus:outline-none focus:border-[#66CCFF] transition-all"
            >
              <option value="None">None</option>
              <option value="GM Coffee">GM Coffee</option>
              <option value="Taco">Taco</option>
              <option value="Bearish">Bearish</option>
              <option value="Canna Banana">Canna Banana</option>
            </select>
          </div>

          <canvas ref={canvasRef} width="1500" height="1500" className="mb-4 border-2 border-[#FF66CC] rounded" />

          <button
            onClick={handleDownload}
            className="bg-[#FF66CC] hover:bg-[#FF8098] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all"
          >
            Download Image
          </button>
        </div>
      </div>
    </>
  );
}
