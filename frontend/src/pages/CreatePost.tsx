import React from "react";
import "./CreatePost.css";
import { Cloudinary } from "@cloudinary/url-gen";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { AdvancedImage } from "@cloudinary/react";

const CreatePost = (props: Props) => {
  const [title, setTitle] = React.useState<string>("");
  const [body, setBody] = React.useState<string>("");
  const [image, setImage] = React.useState<string>("");

  const submitPost = () => {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "inmedia");
    formData.append("cloud_name", "dkxb9gklg");
  };
  const cld = new Cloudinary({ cloud: { cloudName: "dkxb9gklg" } });

  // Use this sample image or upload your own via the Media Library
  const img = cld
    .image("cld-sample-5")
    .format("auto") // Optimize delivery by resizing and applying auto-format and auto-quality
    .quality("auto")
    .resize(auto().gravity(autoGravity()).width(500).height(500)); // Transform the image: auto-crop to square aspect_ratio

  return (
    <div className="card create-post-container">
      <AdvancedImage cldImg={img} />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="post title"
      />
      <input
        type="text"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="post content"
      />
      <div className="file-field input-field">
        <div className="btn #64b5f6 blue darken-1">
          <span>Upload Post Image</span>
          <input
            type="file"
            onChange={(e) =>
              setImage(e.target.files ? e.target.files[0].name : "")
            }
          />
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
