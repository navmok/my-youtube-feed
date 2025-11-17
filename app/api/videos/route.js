export const runtime = "nodejs";
import axios from "axios";

const MAX_RESULTS = 5; // limit videos per channel
const CHANNELS = [
  "UC_x5XG1OV2P6uZZ5FSM9Ttw", // Google Developers
  "UCWJ2lWNubArHWmf3FIHbfcQ", // Google
  "UCVHFbqXqoYvEWM1Ddxl0QDg", // Chrome Developers
];

export async function GET() {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing YOUTUBE_API_KEY!" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const publishedAfter = thirtyDaysAgo.toISOString();

    const allVideos: any[] = [];
    let apiCallCount = 0; // counter for API calls

    await Promise.all(
      CHANNELS.map(async (id) => {
        try {
          console.log("Calling YouTube API for channel:", id);
          const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${id}&part=snippet&type=video&order=date&maxResults=${MAX_RESULTS}&publishedAfter=${publishedAfter}`;
          
          apiCallCount++;
          const res = await axios.get(url);

          if (Array.isArray(res.data.items)) {
            const videosWithChannel = res.data.items.map((video) => ({
              ...video,
              channelId: id,
              channelTitle: video.snippet.channelTitle,
            }));
            allVideos.push(...videosWithChannel);
          }
        } catch (err: any) {
          console.error(`Failed to fetch channel ${id}:`, err.message);
        }
      })
    );

    allVideos.sort(
      (a, b) => new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime()
    );

    // Log total API calls and estimated quota units
    console.log("Total API calls this refresh:", apiCallCount);
    console.log("Estimated quota units used:", apiCallCount * 100); // search.list = 100 units

    return new Response(JSON.stringify(allVideos), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Unexpected error:", err.message);
    return new Response(
      JSON.stringify({ error: "Unexpected server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
