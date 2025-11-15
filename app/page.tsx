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
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/videos");
        const json: Video[] = await res.json();
        setVideos(json);
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

      {!loading && (!videos || videos.length === 0) && (
        <p>No videos found. Please check your API key or channel IDs.</p>
      )}

      {!loading && videos && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          {videos.map((video) => (
            <div
              key={video.id.videoId}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "0.5rem",
              }}
            >
             <a
              href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <img
                src={video.snippet.thumbnails.medium.url}
                alt={video.snippet.title}
                width={320}
                height={180}
                style={{ borderRadius: "4px", objectFit: "cover" }}
              />
              <p style={{ fontWeight: "bold", margin: "0.5rem 0 0.25rem 0" }}>
                {video.snippet.title}
              </p>
            </a>
              <p style={{ fontSize: "0.85rem", color: "#555", margin: 0 }}>
                Channel: {video.channelId}
              </p>
              <p style={{ fontSize: "0.8rem", color: "#777", margin: 0 }}>
                Published:{" "}
                {new Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }).format(new Date(video.snippet.publishedAt))}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
