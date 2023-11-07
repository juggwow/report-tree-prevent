import db from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { JWT } from "next-auth/jwt";

export default async function setJWT(token: JWT): Promise<JWT> {
  //ถ้ามีข้อมูล pea แล้ว ก็ไม่ต้องทำไร ส่ง token กลับไปได้เลย
  if (token.pea) {
    return token;
  }
  //ถ้า token ไม่มี sub (ข้อมูล uuid จาก provider) บังคับ log out เพื่อให้ log in ใหม่
  if (!token.sub) {
    return token;
  }
  //ค้นห้าข้อมูล PEA ใน Firestore
  const docRef = doc(
    db,
    process.env.NEXT_PUBLIC_USER_DB_COLLECTION as string,
    token.sub
  );
  const docSnap = await getDoc(docRef);
  //ถ้ามีข้อมูลใน Firestore แนบ pea ลงใน token
  return docSnap.exists() ? { ...token, pea: docSnap.data() } : token;
}
