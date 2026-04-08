import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../config/firebase";

export async function uploadProductImage(file: File) {
  const filePath = `${Date.now()}-${file.name}`;
  const imageRef = ref(storage, `product-images/${filePath}`);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}
