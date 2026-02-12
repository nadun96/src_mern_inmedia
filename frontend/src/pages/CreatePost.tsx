import React from "react";
import "./CreatePost.css";
import { useNavigate } from "react-router-dom";
import M from "materialize-css";

interface Props {}

const CreatePost = (props: Props) => {
  const navigate = useNavigate();
  const [title, setTitle] = React.useState<string>("");
  const [body, setBody] = React.useState<string>("");
  const [image, setImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string>("");
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "inmedia");
    formData.append("cloud_name", "dkxb9gklg");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dkxb9gklg/image/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Cloudinary upload failed");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };

  const submitPost = async () => {
    if (!title || !body) {
      M.toast({ html: "Title and content are required", classes: "red" });
      return;
    }

    if (!image) {
      M.toast({ html: "Please upload an image", classes: "red" });
      return;
    }

    const token = localStorage.getItem("jwt");
    if (!token) {
      M.toast({ html: "Please login first", classes: "red" });
      navigate("/login");
      return;
    }

    try {
      setIsUploading(true);
      M.toast({ html: "Uploading image...", classes: "blue" });

      // Upload image to Cloudinary
      const imageUrl = await uploadToCloudinary(image);

      // Post to backend with Cloudinary URL
      const response = await fetch("/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, body, image: imageUrl }),
      });

      const data = await response.json();

      if (data.error) {
        M.toast({ html: data.error, classes: "red" });
      } else {
        M.toast({ html: "Post created successfully!", classes: "green" });
        setTitle("");
        setBody("");
        setImage(null);
        setImagePreview("");
        navigate("/");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      M.toast({ html: "Error creating post", classes: "red" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card create-post-container">
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
      <div className="file-field input-field" style={{ marginTop: "15px" }}>
        <div className="btn #64b5f6 blue darken-1">
          <span>Upload Post Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
        <div className="file-path-wrapper">
          <input
            className="file-path validate"
            type="text"
            value={image?.name || ""}
            readOnly
          />
        </div>
      </div>
      {imagePreview && (
        <div style={{ marginTop: "15px", marginBottom: "15px" }}>
          <img
            src={imagePreview}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: "200px",
              borderRadius: "4px",
            }}
          />
        </div>
      )}
      <button
        className="btn waves-effect waves-light btn-large #64b5f6 blue darken-1"
        onClick={submitPost}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Submit Post"}
      </button>
    </div>
  );
};

export default CreatePost;
