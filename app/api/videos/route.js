// app/api/videos/route.js
import axios from "axios";

// GET /api/videos
export async function GET() {
  try {
    const channels = [
      "UC_x5XG1OV2P6uZZ5FSM9Ttw",
      "UCWJ2lWNubArHWmf3FIHbfcQ",
      "UCVHFbqXqoYvEWM1Ddxl0QDg",
    ];

    const apiKey = process.env.YOUTUBE_API_KEY;
    // Debug: check if key exists
    if (!apiKey) {
      console.error("Vercel is not seeing YOUTUBE_API_KEY!");
      return new Response(
        JSON.stringify({ error: "API key not set in Vercel environment" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  
    // For security: don't print the key itself
    console.log("Vercel sees the API key: ✅");

    const allVideos = [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const publishedAfter = thirtyDaysAgo.toISOString();

    // Fetch videos for each channel
    for (const id of channels) {
      try {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${id}&part=snippet&type=video&order=date&maxResults=10&publishedAfter=${publishedAfter}`;
        const res = await axios.get(url);

        if (Array.isArray(res.data.items)) {
          const videosWithChannel = res.data.items.map(video => ({
            ...video,
            channelId: id, // keep the channel reference
          }));
          allVideos.push(...videosWithChannel);
        }
      } catch (err) {
        console.error(`Failed to fetch channel ${id}:`, err.message);
        // just skip this channel if it fails, no need to push empty object
      }
    }

    // Sort all videos newest → oldest
    allVideos.sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));

    return new Response(JSON.stringify(allVideos), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error in API:", err.message);
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
