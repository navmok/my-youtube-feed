// app/api/videos/route.js
import axios from "axios";

// GET /api/videos
export async function GET() {
  try {
    const channels = [
      "UC_x5XG1OV2P6uZZ5FSM9Ttw", // Google Developers
      "UCWJ2lWNubArHWmf3FIHbfcQ", 
      "UCVHFbqXqoYvEWM1Ddxl0QDg",
    ];

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing YOUTUBE_API_KEY!");
      return new Response(JSON.stringify([]), { status: 500 });
    }

    const allVideos = [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const publishedAfter = thirtyDaysAgo.toISOString();

    for (const id of channels) {
      try {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${id}&part=snippet&type=video&order=date&maxResults=10&publishedAfter=${publishedAfter}`;
        
        const res = await axios.get(url);

        if (Array.isArray(res.data.items)) {
          const videosWithChannel = res.data.items.map((video) => ({
            ...video,
            channelId: id, // add channel reference
          }));
          allVideos.push(...videosWithChannel);
        } else {
          console.log(`Channel ${id} returned no videos.`);
        }
      } catch (err) {
        console.error(`Failed to fetch channel ${id}:`, err.message);
      }
    }

    // Sort all videos newest to oldest
    allVideos.sort(
      (a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
    );

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
