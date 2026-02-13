import axios from "axios";

const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD || "dkxb9gklg";
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET || "inmedia";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  formData.append("cloud_name", CLOUDINARY_CLOUD);

  const { data } = await axios.post(CLOUDINARY_URL, formData);
  return data.secure_url;
};
