"use client";

import { useEffect, useState } from "react";

interface Video {
  id: { videoId: string };
  snippet: {
    title: string;
    thumbnails: { medium: { url: string } };
    publishedAt: string;
  };
  channelId: string;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/videos");
        const data = await res.json();
        if (Array.isArray(data)) {
          setVideos(data);
        } else {
          console.error("API returned invalid data:", data);
          setVideos([]);
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>My YouTube Feed</h1>

      {loading && <p>Loading videos...</p>}

      {!loading && videos.length === 0 && (
        <p>No videos found. Check your API key or channel IDs.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {videos.map((video) => (
          <div
            key={video.id.videoId}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "0.5rem",
              display: "flex",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <img
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
              width={320}
              height={180}
              style={{ borderRadius: "4px" }}
            />
            <div>
              <h3 style={{ margin: 0 }}>{video.snippet.title}</h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>
                Channel: {video.channelId} |{" "}
                {new Date(video.snippet.publishedAt).toLocaleDateString()}
              </p>
              <a
                href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch on YouTube
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
