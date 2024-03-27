import clientPromise from "@/lib/mongodb";
import { ObjectId, WithId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import authOptions from "../../../auth/authoption";
import { getServerSession } from "next-auth";
import { AdminChangePlanWithStatus } from "@/types/report-prevent";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const session = await getServerSession(req, res, authOptions);
  if (!(session && session.pea && session.pea.role == "admin")) {
    res.status(403).end();
    return;
  }

  const { _id } = req.query;
  if (!_id || Array.isArray(_id)) {
    res.status(400).json({ error: "Missing _id parameter" });
  }

  const mongoClient = await clientPromise;
  await mongoClient.connect();

  switch (req.method) {
    case "GET": {
      try {
        let docs = await mongoClient
          .db("prevent")
          .collection("idsHaveSentRequest")
          .findOne(
            { _id: new ObjectId(_id as string) },
            { projection: { _id: 0, changePlanRequest: "$changePlanRequest" } },
          );

        if (!docs) {
          await mongoClient.close();
          res.status(404).json({ error: "ไม่พบเอกสารนี้" });
        }

        let changePlanRequest: AdminChangePlanWithStatus[] =
          docs!["changePlanRequest"];

        changePlanRequest.forEach((val, i) => {
          val._id instanceof ObjectId
            ? (changePlanRequest[i]._id = val._id.toHexString())
            : undefined;
        });
        await mongoClient.close();
        res.status(200).json({ changePlanRequest });
      } catch (e) {
        await mongoClient.close();
        res.status(500).json({ error: "error" });
        return;
      }
    }
    default: {
      await mongoClient.close();
      res.status(404).end();
      return;
    }
  }
}
