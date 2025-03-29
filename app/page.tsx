"use client";

import { useState, useEffect, useRef } from "react";

// Fetch image URL async function getNFTImageUrl(tokenId: string) { try { const imageUrl = https://bafybeie6ohy6d4fbzl3cc2twv5a6l4ywez22oy4qlkkuf672e5mpusficq.ipfs.w3s.link/${tokenId}.png; const proxiedImageUrl = /api/fetch-metadata?url=${encodeURIComponent(imageUrl)}&type=image; console.log("Proxied Image URL:", proxiedImageUrl);

try {
  const response = await fetch(proxiedImageUrl);
  if (response.ok) {
    console.log("Proxy API fetch successful");
    return proxiedImageUrl;
  } else {
    console.log("Proxy API fetch failed, falling back to direct URL:", imageUrl);
    return imageUrl;
  }
} catch (error) {
  const err = error as Error;
  console.log("Proxy API fetch error, falling back to direct URL:", imageUrl, err.message);
  return imageUrl;
}

} catch (error) { const err = error as Error; console.log("Error fetching NFT image URL:", err.message); return "https://via.placeholder.com/1500x1500.png?text=Image+Not+Found"; } }

export default function Home() { const [tokenId, setTokenId] = useState("4916"); const [overlay, setOverlay] = useState("None"); const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null); const [error, setError] = useState<string | null>(null); const [isMounted, setIsMounted] = useState(false); const canvasRef = useRef<HTMLCanvasElement>(null);

const overlayImages: { [key: string]: string | null } = { "None": null, "Weed Green": "/overlays/WeedGreen.png", "Purple Haze": "/overlays/PurpleHaze.png", "Acapulco Gold": "/overlays/AcapulcoGold.png", };

useEffect(() => { setIsMounted(true); }, []);

useEffect(() => { if (!isMounted) return; setError(null); setBaseImageUrl(null); if (!tokenId) return;

getNFTImageUrl(tokenId)
  .then((url) => setBaseImageUrl(url))
  .catch((err) => {
    setError(err.message);
    setBaseImageUrl(null);
  });

}, [tokenId, isMounted]);

useEffect(() => { if (!isMounted || !baseImageUrl) return;

const canvas = canvasRef.current;
if (!canvas) return;

const ctx = canvas.getContext("2d");
if (!ctx) return;

const baseImg = new Image();
baseImg.src = baseImageUrl;

baseImg.onload = () => {
  canvas.width = 1500;
  canvas.height = 1500;
  ctx.drawImage(baseImg, 0, 0, 1500, 1500);

  if (overlay !== "None") {
    const overlayImg = new Image();
    overlayImg.src = overlayImages[overlay]!;

    overlayImg.onload = () => {
      ctx.drawImage(overlayImg, 0, 0, 1500, 1500);
    };
  }
};

}, [baseImageUrl, overlay, isMounted]);

const handleDownload = () => { const canvas = canvasRef.current; if (!canvas) return;

const image = canvas.toDataURL("image/png");
const link = document.createElement("a");
link.href = image;
link.download = `CannaSapiens_${tokenId}.png`;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);

};

if (!isMounted) return null;

return ( <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FF9999] to-[#FFCC99] p-4 relative overflow-hidden"> <div className="absolute inset-0 bg-[radial-gradient(circle_at_10px_10px,#FF6666_2px,transparent_2px)] bg-[length:20px_20px] opacity-30" />

<div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg max-w-md w-full relative z-10">
    <h1 className="text-3xl font-bold text-[#ff8098] mb-4 text-center">
      Canna Get A GM
    </h1>

    <div className="mb-4">
      <label className="block text-[#ff8098] font-semibold mb-2">Token ID</label>
      <input
        type="text"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        className="w-full p-2 border-2 border-[#FF66CC] text-[#212121] rounded focus:outline-none focus:border-[#66CCFF] transition-all"
        placeholder="Enter Token ID (e.g., 4916)"
      />
    </div>

    <div className="mb-4">
      <label className="block text-[#ff8098] font-semibold mb-2">Strain Type</label>
      <select
        value={overlay}
        onChange={(e) => setOverlay(e.target.value)}
        className="w-full p-2 border-2 border-[#FF66CC] text-[#212121] rounded focus:outline-none focus:border-[#66CCFF] transition-all"
      >
        <option value="None">None</option>
        <option value="Weed Green">Weed Green</option>
        <option value="Purple Haze">Purple Haze</option>
        <option value="Acapulco Gold">Acapulco Gold</option>
      </select>
    </div>

    <div className="mb-4">
      <h2 className="text-xl font-semibold text-[#ff8098] mb-2">Preview</h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : baseImageUrl ? (
        <canvas ref={canvasRef} className="w-full border-2 border-[#FF66CC] rounded" style={{ maxWidth: "100%", height: "auto" }} />
      ) : (
        <p className="text-gray-500">Loading image...</p>
      )}
    </div>

    <button
      onClick={handleDownload}
      className="w-full mt-4 bg-[#ff8098] text-white font-semibold py-2 px-4 rounded hover:bg-[#ff6680] transition-all"
    >
      Download Image
    </button>
  </div>
</div>

); }

