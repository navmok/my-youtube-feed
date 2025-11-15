// app/api/videos/route.js
import axios from "axios";

// GET /api/videos
export async function GET() {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    // Check if API key exists
    if (!apiKey) {
      console.error("❌ Missing YOUTUBE_API_KEY!");
      return new Response(
        JSON.stringify({ error: "Missing YOUTUBE_API_KEY!" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Vercel sees YOUTUBE_API_KEY");

    const channels = [
      "UC_x5XG1OV2P6uZZ5FSM9Ttw",
      "UCWJ2lWNubArHWmf3FIHbfcQ",
      "UCVHFbqXqoYvEWM1Ddxl0QDg",
    ];

    const allVideos = [];

    // 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const publishedAfter = thirtyDaysAgo.toISOString();

    // Fetch videos for each channel
    for (const id of channels) {
      try {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${id}&part=snippet&type=video&order=date&maxResults=10&publishedAfter=${publishedAfter}`;
        const res = await axios.get(url);

        if (Array.isArray(res.data.items)) {
          // Add channelId to each video
          const videosWithChannel = res.data.items.map((video) => ({
            ...video,
            channelId: id,
          }));
          allVideos.push(...videosWithChannel);
        }
      } catch (err) {
        console.error(`Failed to fetch videos for channel ${id}:`, err.message);
      }
    }

    // Sort newest → oldest
    allVideos.sort(
      (a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
    );

    return new Response(JSON.stringify(allVideos), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error in /api/videos:", err.message);
    return new Response(
      JSON.stringify({ error: "Unexpected server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
