import React from "react";
import "./FeedLayout.css";

interface FeedLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

const FeedLayout: React.FC<FeedLayoutProps> = ({ sidebar, children }) => {
  return (
    <div className="feed-layout">
      <aside className="feed-sidebar">{sidebar}</aside>
      <main className="feed-content">{children}</main>
    </div>
  );
};

export default FeedLayout;
