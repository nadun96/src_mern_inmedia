import { useEffect, useState, useContext } from "react";
import "./Home.css";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";
import PostCard from "../components/PostCard";
import FollowSuggestions from "../components/FollowSuggestions";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
  author: User;
}

interface Post {
  id: string;
  title: string;
  body: string;
  image: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: User;
  likeCount: number;
  isLiked: boolean;
  likedBy: User[];
  comments: Comment[];
  commentCount: number;
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
      <div
        style={{
          display: "flex",
          gap: "20px",
          padding: "20px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div style={{ flex: "0 0 300px" }}>
          <FollowSuggestions currentUserId={state?.id} />
        </div>
        <div style={{ flex: "1", maxWidth: "600px", margin: "0 auto" }}>
          <p style={{ textAlign: "center", padding: "20px" }}>
            Loading posts...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          gap: "20px",
          padding: "20px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div style={{ flex: "0 0 300px" }}>
          <FollowSuggestions currentUserId={state?.id} />
        </div>
        <div style={{ flex: "1", maxWidth: "600px", margin: "0 auto" }}>
          <p style={{ textAlign: "center", padding: "20px", color: "red" }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          gap: "20px",
          padding: "20px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div style={{ flex: "0 0 300px" }}>
          <FollowSuggestions currentUserId={state?.id} />
        </div>
        <div style={{ flex: "1", maxWidth: "600px", margin: "0 auto" }}>
          <p style={{ textAlign: "center", padding: "20px" }}>
            No posts yet. <Link to="/create-post">Create one!</Link>
          </p>
        </div>
      </div>
    );
  }

  const handlePostUpdate = () => {
    // Refresh posts to get updated comments/likes
    fetchPosts(1);
  };

  const handleCommentUpdate = (postId: string, updatedPost: Post) => {
    // Update only the specific post instead of reloading all posts
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === postId ? updatedPost : post)),
    );
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        padding: "20px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      {/* Left Sidebar */}
      <div
        style={{
          flex: "0 0 300px",
          position: "sticky",
          top: "20px",
          height: "fit-content",
        }}
      >
        <FollowSuggestions currentUserId={state?.id} />
      </div>

      {/* Main Content */}
      <div style={{ flex: "1", maxWidth: "600px", margin: "0 auto" }}>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            title={post.title}
            body={post.body}
            image={post.image}
            author={post.author}
            createdAt={post.createdAt}
            updatedAt={post.updatedAt}
            likeCount={post.likeCount}
            isLiked={post.isLiked}
            likedBy={post.likedBy}
            comments={post.comments}
            commentCount={post.commentCount}
            currentUserId={state?.id}
            enableEdit={false}
            onPostUpdate={handlePostUpdate}
            onCommentUpdate={(updatedPost) =>
              handleCommentUpdate(post.id, updatedPost)
            }
          />
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
    </div>
  );
};

export default Home;
