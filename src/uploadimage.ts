import {
  ResponeUploadImageSuccess,
  ResponeUploadImageFail,
} from "@/types/vine-be-gone-now";

const uploadPhoto = async (
  file: string,
): Promise<ResponeUploadImageSuccess | null> => {
  const uploadResult = await fetch(
    "https://script.google.com/macros/s/AKfycbyTltbACbFhsd7ubH22dGXUyI0OShWmJe551lVfUg7KhgZkpJTl4F6AwElGk09ZKZPw/exec",
    {
      method: "POST",
      body: file,
    },
  );
  const uploadedImage: ResponeUploadImageSuccess | ResponeUploadImageFail =
    await uploadResult.json();
  if ("error" in uploadedImage) {
    return null;
  }
  return uploadedImage;
};

export default uploadPhoto;
