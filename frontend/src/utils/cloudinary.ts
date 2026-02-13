const CLOUDINARY_CLOUD = "dkxb9gklg";
const CLOUDINARY_PRESET = "inmedia";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  formData.append("cloud_name", CLOUDINARY_CLOUD);

  const response = await fetch(CLOUDINARY_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = await response.json();
  return data.secure_url;
};
