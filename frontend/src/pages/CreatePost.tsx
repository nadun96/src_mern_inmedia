import React from "react";
import "./CreatePost.css";

const CreatePost = (props: Props) => {
  return (
    <div className="card create-post-container">
      <input type="text" placeholder="post title" />
      <input type="text" placeholder="post content" />
      <div className="file-field input-field">
        <div className="btn #64b5f6 blue darken-1">
          <span>Upload Post Image</span>
          <input type="file" />
        </div>
        <div className="file-path-wrapper">
          <input className="file-path validate" type="text" />
        </div>
      </div>
      <button className="btn waves-effect waves-light btn-large #64b5f6 blue darken-1">
        Submit Post
      </button>
    </div>
  );
};

export default CreatePost;
