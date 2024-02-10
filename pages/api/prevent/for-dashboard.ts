import clientPromise from "@/lib/mongodb";
import { ObjectId, WithId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import authOptions from "../auth/authoption";
import { getServerSession } from "next-auth";
import { AdminChangePlanTree } from "@/types/report-tree";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  try {
    switch (req.method) {
      case "GET": {
        const mongoClient = await clientPromise;
        await mongoClient.connect();
        const data = await mongoClient
          .db("prevent")
          .collection("forDashBoard")
          .find()
          .toArray();
        await mongoClient.close();
        res.send(data);
        res.end();
        return;
      }
      default: {
        res.status(404).end();
        return;
      }
    }
  } catch (e) {
    res.status(500).end();
    return;
  }
}
