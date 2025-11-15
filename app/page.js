"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/videos")
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>My YouTube Dashboard</h1>

      {data.map((block) => (
        <div key={block.channelId}>
          <h2>Channel: {block.channelId}</h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20
          }}>
            {block.videos.map(v => (
              <a key={v.id.videoId} href={`https://www.youtube.com/watch?v=${v.id.videoId}`} target="_blank">
                <img src={v.snippet.thumbnails.medium.url} width="100%" />
                <p>{v.snippet.title}</p>
                <small>{v.snippet.publishedAt}</small>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}