"use client";

import { useEffect, useState, useRef } from "react";

interface Video {
  id: { videoId: string };
  snippet: { title: string; thumbnails: { medium: { url: string } }; publishedAt: string };
  channelId: string;
  channelTitle: string;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get unique channel names
  const allChannels = Array.from(new Set(videos.map((v) => v.channelTitle)));

  // Filter videos based on selected channels
  const filteredVideos =
    selectedChannels.length === 0
      ? videos
      : videos.filter((v) => selectedChannels.includes(v.channelTitle));

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>My YouTube Feed</h1>

      {loading && <p>Loading videos...</p>}

      {!loading && videos.length === 0 && (
        <p>No videos found. Please check your API key or channel IDs.</p>
      )}

      {!loading && videos.length > 0 && (
        <>
          {/* Dropdown for channel selection */}
          <div style={{ marginBottom: "1rem", position: "relative" }} ref={dropdownRef}>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "0.5rem",
                cursor: "pointer",
                width: "250px",
                background: "#fff",
              }}
            >
              {selectedChannels.length > 0
                ? selectedChannels.join(", ")
                : "Select channels..."}
            </div>

            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  background: "#fff",
                  zIndex: 10,
                  width: "250px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                }}
              >
                {allChannels.map((channel) => (
                  <label
                    key={channel}
                    style={{ display: "block", padding: "0.5rem", cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      value={channel}
                      checked={selectedChannels.includes(channel)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedChannels([...selectedChannels, channel]);
                        } else {
                          setSelectedChannels(
                            selectedChannels.filter((c) => c !== channel)
                          );
                        }
                      }}
                      style={{ marginRight: "0.5rem" }}
                    />
                    {channel}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Video list */}
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
        </>
      )}
    </div>
  );
}
