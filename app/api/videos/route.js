export const runtime = "nodejs"; // ensures Node.js runtime

import axios from "axios";

// GET /api/videos
export async function GET() {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing YOUTUBE_API_KEY!" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const channels = [
      "UC_x5XG1OV2P6uZZ5FSM9Ttw",
      "UCWJ2lWNubArHWmf3FIHbfcQ",
      "UCVHFbqXqoYvEWM1Ddxl0QDg",
    ];

    const allVideos = [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const publishedAfter = thirtyDaysAgo.toISOString();

    for (const id of channels) {
      try {
        // Get channel info
        const channelRes = await axios.get(
          `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&id=${id}&part=snippet`
        );
        const channelName =
          channelRes.data.items?.[0]?.snippet?.title || "Unknown Channel";

        // Get videos
        const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${id}&part=snippet&type=video&order=date&maxResults=10&publishedAfter=${publishedAfter}`;
        const res = await axios.get(url);

        if (Array.isArray(res.data.items)) {
          const videosWithChannel = res.data.items.map((video) => ({
            ...video,
            channelId: id,
            channelTitle: channelName,
          }));
          allVideos.push(...videosWithChannel);
        }
      } catch (err) {
        console.error(`Failed to fetch channel ${id}:`, err.message);
      }
    }

    allVideos.sort(
      (a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
    );

    return new Response(JSON.stringify(allVideos), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error in /api/videos:", err.message);
    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
