"use client";

import { useEffect, useState } from "react";

interface Video {
  id: { videoId: string };
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails: { medium: { url: string } };
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
        const json = await res.json();
        setVideos(json);
      } catch (err) {
        console.error("Error fetching videos:", err);
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
        <p>No videos found. Please check your API key or channel IDs.</p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {videos.map((video) => (
          <div
            key={video.id.videoId}
            style={{
              border: "1px solid #ddd",
              borderRadius: "6px",
              padding: "0.5rem",
              width: "320px",
            }}
          >
            <img
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
              width={320}
              height={180}
              style={{ borderRadius: "4px" }}
            />
            <p>
              <strong>{video.snippet.title}</strong>
            </p>
            <p style={{ fontSize: "13px", opacity: 0.7 }}>
              Channel: {video.channelId}
            </p>
            <p style={{ fontSize: "12px", opacity: 0.6 }}>
              {new Date(video.snippet.publishedAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
