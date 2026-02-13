import React from "react";
import "./CreatePost.css";
import { useNavigate } from "react-router-dom";
import M from "materialize-css";
import { Button, Input } from "../atoms";
import { ImageUploader } from "../molecules";
import { uploadToCloudinary } from "../../utils/cloudinary";

interface Props {}

const CreatePost = (_props: Props) => {
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="post title"
      />
      <Input
        type="text"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="post content"
      />
      <ImageUploader
        label="Upload Post Image"
        fileName={image?.name}
        previewUrl={imagePreview}
        onFileChange={handleFileChange}
        disabled={isUploading}
        style={{ marginTop: "15px" }}
        previewStyle={{ marginBottom: "15px" }}
      />
      <Button
        color="blue"
        size="large"
        onClick={submitPost}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Submit Post"}
      </Button>
    </div>
  );
};

export default CreatePost;
