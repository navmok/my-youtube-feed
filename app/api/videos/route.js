export const runtime = "nodejs";
import axios from "axios";

const MAX_RESULTS = 5; // reduce number of videos per channel
const CHANNELS = [
  "UC_x5XG1OV2P6uZZ5FSM9Ttw",
  "UCWJ2lWNubArHWmf3FIHbfcQ",
  "UCVHFbqXqoYvEWM1Ddxl0QDg",
];

export async function GET() {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing YOUTUBE_API_KEY!" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const publishedAfter = thirtyDaysAgo.toISOString();

    const allVideos = [];

    await Promise.all(
      CHANNELS.map(async (id) => {
        try {
          const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${id}&part=snippet&type=video&order=date&maxResults=${MAX_RESULTS}&publishedAfter=${publishedAfter}`;
          const res = await axios.get(url);

          if (Array.isArray(res.data.items)) {
            allVideos.push(
              ...res.data.items.map((video) => ({
                ...video,
                channelId: id,
              }))
            );
          }
        } catch (err) {
          console.error(`Failed to fetch channel ${id}:`, err.message);
        }
      })
    );

    allVideos.sort(
      (a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
    );

    return new Response(JSON.stringify(allVideos), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err.message);
    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
