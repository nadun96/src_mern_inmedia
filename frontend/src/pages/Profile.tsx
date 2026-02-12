import React from "react";
import { useContext, useEffect, useState } from "react";
import "./Profile.css";
import { UserContext } from "../context/userContext";

interface Post {
  id: string;
  title: string;
  body: string;
  image: string;
  authorId: string;
  createdAt: string;
}

const Profile = () => {
  const { state } = useContext(UserContext);
  const [myposts, setMyposts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state || !state.id) return;

    const token = localStorage.getItem("jwt");

    fetch(`/posts/author?userId=${state.id}&page=1&limit=10`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setMyposts(Array.isArray(data.data) ? data.data : []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [state]);

  return (
    <div className="main-container">
      <div className="profile-container">
        <div>
          <img
            style={{ width: "166px", height: "166px", borderRadius: "83px" }}
            src={state?.profilePicUrl || "https://via.placeholder.com/166"}
            alt="Profile"
          />
        </div>
        <div className="details-section">
          <h4>{state ? state.name : "Loading..."}</h4>
          <h5>{state ? state.email : "Loading..."}</h5>
          <div className="followings">
            <h6>{myposts.length} posts</h6>
            <h6>
              {state && state.hasOwnProperty("followers")
                ? state.followers.length
                : 0}{" "}
              followers
            </h6>
            <h6>
              {state && state.hasOwnProperty("following")
                ? state.following.length
                : 0}{" "}
              following
            </h6>
          </div>
        </div>
      </div>
      <div className="posts">
        {loading ? (
          <p>Loading posts...</p>
        ) : myposts.length === 0 ? (
          <p>No posts yet</p>
        ) : (
          myposts.map((post) => (
            <img
              src={post.image}
              className="post"
              alt={post.title}
              key={post.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
