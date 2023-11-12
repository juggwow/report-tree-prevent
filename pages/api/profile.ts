// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { doc, setDoc } from "firebase/firestore";
import db from "@/firebase";
import { peaUser } from "@/types/next-auth";
import authOptions from "./auth/authoption";
import NextAuth from "next-auth/next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method != "POST") {
    res.status(400).end();
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  if (session && session.sub) {
    let pea: peaUser = JSON.parse(req.body);
    if (!pea.role) {
      pea = { ...pea, role: "operator" };
    }
    const docRef = doc(
      db,
      process.env.NEXT_PUBLIC_USER_DB_COLLECTION as string,
      session.sub,
    );
    await setDoc(docRef, pea);
    res.status(200).end();
    return;
  }

  res.status(401).end();
  return;
}
