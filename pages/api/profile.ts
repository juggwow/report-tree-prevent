// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { doc, setDoc } from "firebase/firestore";
import db from "@/firebase";
import { peaUser } from "@/types/next-auth";
import authOptions from "./auth/authoption";
import NextAuth from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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
    const mongoClient = await clientPromise;
    const userCollection = mongoClient.db("user").collection("user")
    const findDoc = await userCollection.findOne({sub: session.sub})
    if(findDoc){
      const filter = {sub: session.sub}
      const update = {
        $set: {...pea,provider:session.provider  }
      }
      const resultUpdate = await userCollection.findOneAndUpdate(filter,update)
      if(!resultUpdate.ok){
        res.status(500).end()
        return
      }
      res.status(200).end()
      return
    }
    else {
      const doc = await userCollection.insertOne({...pea,sub:session.sub,provider:session.provider})
      if(!doc.acknowledged){
        res.status(500).end()
        return
      }
      res.status(200).end();
      return;
    }
  }

  res.status(401).end();
  return;
}
