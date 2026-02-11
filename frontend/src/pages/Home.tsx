import React from "react";
import "./Home.css";
import { Link } from "react-router-dom";

const Home = (props: Props) => {
  return (
    <div className="home-container">
      <div className="card home-card">
        <h5 style={{ padding: "10px" }}>
          <img className="profilePic" alt="Profile picture" />
        </h5>
        <div className="card-image">
          <img src="https://images.unsplash.com/photo-1770297346180-6ae7191f0817?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
        </div>
        <div className="card-content">
          <i
            className="material-icons"
            style={{ color: "red", marginRight: "10px" }}
          >
            favorite
          </i>
          <h6>Post Title</h6>
          <p>Welcome to the world of coding</p>
          <input type="text" placeholder="Add a comment..." />
        </div>
      </div>
    </div>
  );
};

export default Home;
