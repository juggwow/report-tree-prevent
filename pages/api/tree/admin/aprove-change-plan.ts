import clientPromise from "@/lib/mongodb";
import { ObjectId, WithId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import authOptions from "../../auth/authoption";
import { getServerSession } from "next-auth";
import { AdminChangePlanTree, AllTypeChangePlan } from "@/types/report-tree";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const session = await getServerSession(req, res, authOptions);
  if (!(session && session.pea && session.pea.role == "admin")) {
    res.status(403).end();
    return;
  }

  const mongoClient = await clientPromise;
  await mongoClient.connect();

  switch (req.method) {
    case "POST": {
      try {
        const sendId = JSON.parse(req.body).id;
        const docs = await mongoClient
          .db("tree")
          .collection("idsHasSentRequest")
          .findOne({ _id: new ObjectId(sendId) });
        if (!docs) {
          await mongoClient.close();
          res.status(404).end();
          return;
        }

        const changePlanRequest: AllTypeChangePlan[] =
          docs["changePlanRequest"];
        let ids: ObjectId[] = [];
        changePlanRequest.forEach((val) => {
          ids.push(val._id as ObjectId);
        });

        const filter = {
          _id: { $in: ids },
        };
        const update = {
          $set: {
            "changePlanRequest.$[elem].status": "success",
          },
        };
        const options = {
          arrayFilters: [
            { "elem.status": "progress", "elem.sendId": new ObjectId(sendId) },
          ],
        };
        const resUpdate = await mongoClient
          .db("tree")
          .collection("plan")
          .updateMany(filter, update, options);
        if (!resUpdate.acknowledged) {
          await mongoClient.close();
          res.status(500).end();
          return;
        }

        await mongoClient.close();
        res.status(200).end();
        return;
      } catch (e) {
        await mongoClient.close();
        res.status(500).end();
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
