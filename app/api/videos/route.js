// app/api/videos/route.js
export const runtime = "nodejs"; // ensures Node.js runtime

import axios from "axios";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // initial delay between retries

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`Retrying (${attempt}/${retries})...`);
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
}

// GET /api/videos
export async function GET() {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      console.error("❌ Missing YOUTUBE_API_KEY!");
      return new Response(
        JSON.stringify({ error: "Missing YOUTUBE_API_KEY!" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Vercel sees YOUTUBE_API_KEY");

    const channels = [
      "UCoOae5nYA7VqaXzerajD0lg",
      "UCVWDbXqQ8cupuVpotWNt2eg",
      "UCIALMKvObZNtJ6AmdCLP7Lg",
      "UCmh2BRfezDEhDCm_x9gyJ-w",
      "UCvJJ_dzjViJCoLf5uKUTwoA",
      "UCrp_UI8XtuYfpiqluWLD7Lw",
      "UCOmcA3f_RrH6b9NmcNa4tdg",
      "UCupvZG-5ko_eiXAupbDfxWw",
      "UCVYamHliCI9rw1tHR1xbkfw",
      "UC-CSyyi47VX1lD9zyeABW3w",
      "UCkw6A6Zmand6UhZnIODLRcA",
      "UC-6OW5aJYBFM33zXQlBKPNA",
      "UCpvyOqtEc86X8w8_Se0t4-w",
      "UCV6KDgJskWaEckne5aPA0aQ",
      "UCb825Ij-6qnlRr66VZVj8PQ",
      "UCzomXQvDl2UblYIjBoFR8aw",
      "UCXZvhCBxTSvPf38GN0NtKiw",
      "UCZRoNJu1OszFqABP8AuJIuw",
      "UCBJycsmduvYEL83R_U4JriQ",
      "UCUvvj5lwue7PspotMDjk5UA",
      "UCz4a7agVFr1TxU-mpAP8hkw",
      "UCMiJRAwDNSNzuYeN2uWa0pA",
      "UCHm8vWol8eNjTJZSjq2jaLQ",
      "UCqKJtQcXMnYMEJAzorQgbGA",
      "UCE5RIa7b_JIK0a31Uaq4xRw",
      "UCKZozRVHRYsYHGEyNKuhhdA",
      "UCEAZeUIeJs0IjQiqTCdVSIg",
    ];

    const allVideos = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const publishedAfter = thirtyDaysAgo.toISOString();

    for (const id of channels) {
      try {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${id}&part=snippet&type=video&order=date&maxResults=10&publishedAfter=${publishedAfter}`;
        const data = await fetchWithRetry(url);

        if (Array.isArray(data.items)) {
          const videosWithChannel = data.items.map((video) => ({
            ...video,
            channelId: id,
          }));
          allVideos.push(...videosWithChannel);
        }
      } catch (err) {
        console.warn(`⚠️ Skipping channel ${id}: ${err.response?.status || ""} ${err.message}`);
      }
    }

    allVideos.sort(
      (a, b) => new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime()
    );

    return new Response(JSON.stringify(allVideos), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error in /api/videos:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
