import React, { useEffect, useState, useContext } from "react";
import "./Home.css";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";

interface Post {
  id: string;
  title: string;
  body: string;
  image: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const { state } = useContext(UserContext);
  const navigate = useNavigate();

  // Fetch posts function
  const fetchPosts = async (pageNum: number) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const token = localStorage.getItem("jwt");
      const response = await fetch(`/posts?page=${pageNum}&limit=10`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const result = await response.json();
      const newPosts = Array.isArray(result.data) ? result.data : [];

      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setHasNextPage(result.pagination?.hasNextPage ?? true);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching posts");
      console.error(err);
    } finally {
      if (pageNum === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    if (!state) {
      navigate("/login");
      return;
    }

    fetchPosts(1);
    setPage(1);
  }, [state, navigate]);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      // Check if user is near bottom (within 500px)
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.scrollHeight - 500
      ) {
        if (!loadingMore && hasNextPage && posts.length > 0) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, loadingMore, hasNextPage, posts.length]);

  if (loading) {
    return (
      <div className="home-container">
        <p style={{ textAlign: "center", padding: "20px" }}>Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <p style={{ textAlign: "center", padding: "20px", color: "red" }}>
          {error}
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="home-container">
        <p style={{ textAlign: "center", padding: "20px" }}>
          No posts yet. <Link to="/create-post">Create one!</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="home-container">
      {posts.map((post) => (
        <div key={post.id} className="card home-card">
          <h5 style={{ padding: "10px" }}>
            <strong>{post.author?.name || "Anonymous"}</strong>
          </h5>
          {post.image && (
            <div className="card-image">
              <img src={post.image} alt={post.title} />
            </div>
          )}
          <div className="card-content">
            <h6>{post.title}</h6>
            <p>{post.body}</p>
            <div>
              <i
                className="material-icons"
                style={{ color: "red", marginRight: "10px" }}
              >
                favorite
              </i>
              <span>0 likes</span>
            </div>
            <input
              type="text"
              placeholder="Add a comment..."
              style={{ marginTop: "10px" }}
            />
          </div>
        </div>
      ))}
      {loadingMore && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p>Loading more posts...</p>
        </div>
      )}
      {!hasNextPage && posts.length > 0 && (
        <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
          <p>No more posts to load</p>
        </div>
      )}
    </div>
  );
};

export default Home;
