"use client";

import { useState, useEffect, useRef } from "react";

// Fetch image URL
async function getNFTImageUrl(tokenId: string) {
  try {
    // Construct the image URL dynamically using the token ID
    const imageUrl = `https://bafybeie6ohy6d4fbzl3cc2twv5a6l4ywez22oy4qlkkuf672e5mpusficq.ipfs.w3s.link/${tokenId}.png`;
    const proxiedImageUrl = `/api/fetch-metadata?url=${encodeURIComponent(imageUrl)}&type=image`;
    console.log("Proxied Image URL:", proxiedImageUrl);

    // Test if the proxy API works
    try {
      const response = await fetch(proxiedImageUrl);
      if (response.ok) {
        console.log("Proxy API fetch successful");
        return proxiedImageUrl;
      } else {
        console.log("Proxy API fetch failed, falling back to direct URL:", imageUrl);
        return imageUrl; // Fallback to direct URL if proxy fails
      }
    } catch (error) {
      // Type the error as Error
      const err = error as Error;
      console.log("Proxy API fetch error, falling back to direct URL:", imageUrl, err.message);
      return imageUrl; // Fallback to direct URL if proxy fetch fails
    }
  } catch (error) {
    // Type the error as Error
    const err = error as Error;
    console.log("Error fetching NFT image URL:", err.message);
    // Fallback image if the entire fetch fails
    return "https://via.placeholder.com/1500x1500.png?text=Image+Not+Found";
  }
}

export default function Home() {
  const [tokenId, setTokenId] = useState("4916");
  const [overlay, setOverlay] = useState("None"); // Default to "None"
  const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Map dropdown options to overlay images ("None" has no overlay)
  const overlayImages: { [key: string]: string | null } = {
    "None": null,
    "Weed Green": "/overlays/WeedGreen.png",
    "Purple Haze": "/overlays/PurpleHaze.png",
    "Acapulco Gold": "/overlays/AcapulcoGold.png",
  };

  // Ensure the component is mounted on the client to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch base image URL when token ID changes
  useEffect(() => {
    if (!isMounted) return;
    setError(null);
    setBaseImageUrl(null);
    if (!tokenId) return;

    getNFTImageUrl(tokenId)
      .then((url) => setBaseImageUrl(url))
      .catch((err) => {
        setError(err.message);
        setBaseImageUrl(null);
      });
  }, [tokenId, isMounted]);

  // Update the canvas preview when base image or overlay changes
  useEffect(() => {
    if (!isMounted || !baseImageUrl) {
      console.log("Not mounted or no baseImageUrl:", { isMounted, baseImageUrl });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("Canvas ref is null");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log("Canvas context is null");
      return;
    }

    const baseImg = new Image();
    baseImg.src = baseImageUrl; // Remove crossOrigin since we're proxying

    baseImg.onload = () => {
      console.log("Base image loaded successfully:", baseImageUrl);
      canvas.width = 1500; // Match the base image size
      canvas.height = 1500;
      ctx.drawImage(baseImg, 0, 0, 1500, 1500);

      // Only draw the overlay if it's not "None"
      if (overlay !== "None") {
        const overlayImg = new Image();
        overlayImg.src = overlayImages[overlay]!;

        overlayImg.onload = () => {
          console.log("Overlay image loaded successfully:", overlayImages[overlay]);
          ctx.drawImage(overlayImg, 0, 0, 1500, 1500); // Overlay at full size
        };
        overlayImg.onerror = (e) => {
          console.log("Failed to load overlay image:", overlayImages[overlay], e);
        };
      }
    };

    baseImg.onerror = (e) => {
      console.log("Failed to load base image:", baseImageUrl, e);
    };
  }, [baseImageUrl, overlay, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FF9999] to-[#FFCC99] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10px_10px,#FF6666_2px,transparent_2px)] bg-[length:20px_20px] opacity-30" />

      <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg max-w-md w-full relative z-10">
        <h1 className="text-3xl font-bold text-[#ff8098] mb-4 text-center">
          Canna Get A GM
        </h1>

        {/* Token ID Input */}
        <div className="mb-4">
          <label className="block text-[#ff8098] font-semibold mb-2">
            Token ID
          </label>
          <input
            type="text"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="w-full p-2 border-2 border-[#FF66CC] text-[#212121] rounded focus:outline-none focus:border-[#66CCFF] transition-all"
            placeholder="Enter Token ID (e.g., 4916)"
          />
        </div>

        {/* Overlay Dropdown */}
        <div className="mb-4">
          <label className="block text-[#ff8098] font-semibold mb-2">
            Strain Type
          </label>
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

        {/* Preview */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-[#ff8098] mb-2">
            Preview
          </h2>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : baseImageUrl ? (
            <canvas
              ref={canvasRef}
              className="w-full border-2 border-[#FF66CC] rounded"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          ) : (
            <p className="text-gray-500">Loading image...</p>
          )}
        </div>
        {/* Download Button */}
<button
  onClick={handleDownload}
  className="w-full mt-4 bg-[#ff8098] text-white font-semibold py-2 px-4 rounded hover:bg-[#ff6680] transition-all"
>
  Download Image
</button>
      </div>
    </div>
  );
}
