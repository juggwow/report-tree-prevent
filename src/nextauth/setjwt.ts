import db from "@/firebase";
import clientPromise from "@/lib/mongodb";
import { peaUser } from "@/types/next-auth";
import { doc, getDoc } from "firebase/firestore";
import { Session } from "inspector";
import { ObjectId } from "mongodb";
import { Account } from "next-auth";
import { JWT } from "next-auth/jwt";

export default async function setJWT(token: JWT,account: Account|null): Promise<JWT> {
  //ถ้ามีข้อมูล pea แล้ว ก็ไม่ต้องทำไร ส่ง token กลับไปได้เลย
  if (token.pea) {
    return token;
  }
  //ถ้า token ไม่มี sub (ข้อมูล uuid จาก provider) บังคับ log out เพื่อให้ log in ใหม่
  if (!token.sub) {
    return token;
  }
  //ค้นห้าข้อมูล PEA ใน Firestore
  const mongoClient = await clientPromise
  const userCollection = mongoClient.db("user").collection("user")
  const query = {
    sub : token.sub
  }
  const options = {
    projection : {
      _id: 0,
      firstname: 1,
      karnfaifa: 1,
      lastname: 1,
      mobileno: 1,
      role: 1,
      userid: 1
    }
  }
  const docSnap = await userCollection.findOne(query,options) as unknown as peaUser | null
  return docSnap? { ...token, pea: docSnap,provider: account?.provider }:{...token,provider:account?.provider}
}
