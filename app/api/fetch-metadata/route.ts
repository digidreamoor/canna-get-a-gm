import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const type = searchParams.get("type") || "json";

  console.log("Proxy API called with URL:", url, "Type:", type);

  if (!url) {
    console.log("Error: URL parameter is missing");
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  const tryFetch = async (fetchUrl: string) => {
    console.log("Fetching URL (with User-Agent):", fetchUrl);
    let response = await fetch(fetchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      signal: AbortSignal.timeout(30000), // 30 seconds timeout
    });

    if (!response.ok) {
      console.log("Fetch with User-Agent failed, trying without headers...");
      response = await fetch(fetchUrl, {
        signal: AbortSignal.timeout(30000), // 30 seconds timeout
      });
    }

    return response;
  };

  try {
    let response = await tryFetch(url);

    // If the fetch fails, try a different IPFS gateway (ipfs.io)
    if (!response.ok && url.includes("ipfs.w3s.link")) {
      const cid = url.split("ipfs.w3s.link/")[1];
      const fallbackUrl = `https://ipfs.io/ipfs/bafybeie6ohy6d4fbzl3cc2twv5a6l4ywez22oy4qlkkuf672e5mpusficq/${cid}`;
      console.log("Fetch failed, trying fallback URL (ipfs.io):", fallbackUrl);
      response = await tryFetch(fallbackUrl);
    }

    console.log("Fetch response status:", response.status, response.statusText);
    console.log("Fetch response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const text = await response.text();
      console.log("Fetch failed with status:", response.status, response.statusText);
      console.log("Response body:", text.slice(0, 200));
      return NextResponse.json(
        { error: `Failed to fetch: ${response.statusText}`, details: text.slice(0, 200) },
        { status: response.status }
      );
    }

    if (type === "image") {
      try {
        // Check if the response is actually an image
        const contentType = response.headers.get("Content-Type") || "";
        console.log("Response Content-Type:", contentType);
        if (!contentType.startsWith("image/")) {
          const text = await response.text();
          console.log("Expected image, but got Content-Type:", contentType);
          console.log("Response body:", text.slice(0, 200));
          return NextResponse.json(
            { error: "Expected image, but received non-image content", details: text.slice(0, 200) },
            { status: 400 }
          );
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentTypeHeader = contentType || "image/png";
        console.log("Returning image with Content-Type:", contentTypeHeader, "Size:", buffer.length);
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentTypeHeader,
            "Content-Length": buffer.length.toString(),
            "Access-Control-Allow-Origin": "http://localhost:3000",
          },
        });
      } catch (imageError) {
        // Type the error as Error
        const err = imageError as Error;
        console.log("Error processing image response:", err.message, err.stack);
        return NextResponse.json(
          { error: "Failed to process image response: " + err.message },
          { status: 500 }
        );
      }
    } else {
      try {
        const data = await response.json();
        console.log("Returning JSON data:", data);
        return NextResponse.json(data);
      } catch (jsonError) {
        // Type the error as Error
        const err = jsonError as Error;
        console.log("Error parsing JSON response:", err.message, err.stack);
        return NextResponse.json(
          { error: "Failed to parse JSON response: " + err.message },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    // Type the error as Error
    const err = error as Error;
    console.log("Fetch error:", err.message, err.stack);
    console.log("Fetch error cause:", err.cause);
    return NextResponse.json(
      { error: "Failed to fetch: " + err.message, cause: err.cause ? err.cause.toString() : "Unknown" },
      { status: 500 }
    );
  }
}