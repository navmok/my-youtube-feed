"use client";

import { useEffect, useState } from "react";

interface Video {
  id: { videoId: string };
  snippet: { title: string; thumbnails: { medium: { url: string } }; publishedAt: string };
  channelId: string;
  channelTitle: string;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannels, setSelectedChannels] = useState<{ id: string; name: string }[]>([]);
  const [allChannels, setAllChannels] = useState<{ id: string; name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/videos");
        const json: Video[] = await res.json();
        setVideos(json);

        // build unique channels
        const channelMap = new Map<string, string>();
        json.forEach((v) => channelMap.set(v.channelId, v.channelTitle));
        const uniqueChannels = Array.from(channelMap.entries()).map(([id, name]) => ({ id, name }));
        setAllChannels(uniqueChannels);
        setSelectedChannels(uniqueChannels); // select all by default
      } catch (err) {
        console.error("Error fetching videos:", err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleRemoveChannel = (channelId: string) => {
    setSelectedChannels((prev) => prev.filter((c) => c.id !== channelId));
  };

  const handleSelectChannel = (channel: { id: string; name: string }) => {
    setSelectedChannels((prev) => [...prev, channel]);
  };

  const filteredChannels = allChannels.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedChannels.some((s) => s.id === c.id)
  );

  const filteredVideos = videos.filter((v) =>
    selectedChannels.some((c) => c.id === v.channelId)
  );

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>My YouTube Feed</h1>

      {loading && <p>Loading videos...</p>}

      {!loading && allChannels.length > 0 && (
        <>
          {/* Selected channels as tags */}
          <div style={{ marginBottom: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {selectedChannels.map((channel) => (
              <div
                key={channel.id}
                style={{
                  backgroundColor: "#e0e0e0",
                  borderRadius: "16px",
                  padding: "0.25rem 0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                {channel.name}
                <button
                  onClick={() => handleRemoveChannel(channel.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Search & add channel */}
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search channels to add..."
              style={{ padding: "0.25rem", width: "300px" }}
            />
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "0.5rem",
                maxHeight: "150px",
                overflowY: "auto",
                marginTop: "0.25rem",
              }}
            >
              {filteredChannels.map((channel) => (
                <div
                  key={channel.id}
                  style={{ cursor: "pointer", padding: "0.25rem 0" }}
                  onClick={() => handleSelectChannel(channel)}
                >
                  {channel.name} ➕
                </div>
              ))}
              {filteredChannels.length === 0 && <div style={{ color: "#888" }}>No channels found</div>}
            </div>
          </div>
        </>
      )}

      {!loading && filteredVideos.length === 0 && <p>No videos found for selected channels.</p>}

      {!loading && filteredVideos.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {filteredVideos.map((video) => (
            <a
              key={video.id.videoId}
              href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "0.5rem",
                width: "320px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <p style={{ fontWeight: "bold" }}>{video.channelTitle}</p>
              <img
                src={video.snippet.thumbnails.medium.url}
                alt={video.snippet.title}
                width={320}
                height={180}
                style={{ borderRadius: "4px" }}
              />
              <p>{video.snippet.title}</p>
              <p style={{ fontSize: "0.8rem", color: "#555" }}>
                {new Date(video.snippet.publishedAt).toLocaleString()}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
