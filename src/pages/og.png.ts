import type { APIRoute } from "astro";
import { generateOgImageForSite } from "@utils/generateOgImages";

/**
 * API endpoint that generates and returns an Open Graph image for the site.
 * This image can be used for social media previews when sharing the site.
 *
 * @returns A PNG image response with appropriate content type headers
 */
export const GET: APIRoute = async () => {
  try {
    // Generate the OG image for the site
    const imageBuffer = await generateOgImageForSite();

    // Return the image with proper content type headers
    return new Response(new Uint8Array(imageBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Length": imageBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    console.error("Failed to generate OG image:", error);
    return new Response("Failed to generate image", {
      status: 500,
      headers: {"Content-Type": "text/plain"}
    });
  }
};
