import clientPromise from "@/lib/mongodb";
import { WithId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import authOptions from "../auth/authoption";
import { getServerSession } from "next-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const session = await getServerSession(req, res, authOptions);
  if (!(session && session.pea && session.pea.role == "admin")) {
    res.status(403).end();
    return;
  }

  switch (req.method) {
    case "GET": {
      try {
        const mongoClient = await clientPromise;
        const allQuarterBudgets = mongoClient
          .db("tree")
          .collection("businessNameQuaterBudget")
          .find({ _id: { $ne: "กฟฟ.ทดสอบ" } });
        const summary = await allQuarterBudgets.toArray();
        const allRequest = mongoClient
          .db("tree")
          .collection("typeRequest")
          .find();
        const typeReq = await allRequest.toArray();
        const resultGsheet = await fetch(
          "https://script.google.com/macros/s/AKfycby6XVzv3SuZqo-mtMM63wPtSnOJXbPPYcWtZ0lJnASbdIHDt5ukgx8l89s-EPtcz8WKNA/exec",
          {
            method: "POST",
            body: JSON.stringify({ summary, typeReq }),
          },
        );
        if (resultGsheet.status == 200) {
          res.status(200).end();
          return;
        } else {
          res.status(500).end();
          return;
        }
      } catch (e) {
        res.status(500).end();
      }
    }
    default: {
      res.status(404).end();
      return;
    }
  }
}
