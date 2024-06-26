import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import authOptions from "../auth/authoption";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { IdsHasSentPlanTreeRequest, SentReq } from "@/types/report-tree";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const session = await getServerSession(req, res, authOptions);
  if (!(session && session.sub && session.pea)) {
    res.status(401).end();
    return;
  }

  try {
    switch (req.method) {
      case "POST": {
        const { changePlanIds }: { changePlanIds: string[] } = JSON.parse(
          req.body,
        );
        let changeRequestIds: ObjectId[] = [];
        for (const val of changePlanIds) {
          changeRequestIds.push(new ObjectId(val));
        }

        const filter = {
          _id: { $in: changeRequestIds },
        };

        const mongoClient = await clientPromise;
        await mongoClient.connect();
        const treePlanCollection = mongoClient.db("tree").collection("plan");
        const docs = await treePlanCollection.find(filter).toArray();
        if (docs.length != changePlanIds.length) {
          await mongoClient.close();
          res.status(403);
          return;
        }

        const sendId = new ObjectId();
        const update = {
          $set: {
            "changePlanRequest.$[elem].sendDate": new Date().toJSON(),
            "changePlanRequest.$[elem].sendId": sendId,
          },
        };
        const options = {
          arrayFilters: [
            {
              "elem.status": "progress",
            },
          ],
        };
        await mongoClient.connect();
        const resultUpdate = await treePlanCollection.updateMany(
          filter,
          update,
          options,
        );
        if (!resultUpdate.acknowledged) {
          await mongoClient.close();
          res.status(404).end();
          return;
        }

        await mongoClient.close();
        res.status(200).end();
        return;
      }
      case "PUT": {
        const body: IdsHasSentPlanTreeRequest | SentReq = JSON.parse(req.body);
        const mongoClient = await clientPromise;
        await mongoClient.connect();
        let doc = await mongoClient
          .db("tree")
          .collection("idsHasSentRequest")
          .findOne({ _id: new ObjectId(body._id as string) });
        if (!doc) {
          await mongoClient.close();
          res.status(404).end();
          return;
        }

        let cancelIdsRequest: ObjectId[] = [];
        for (const val of doc["changePlanRequest"]) {
          cancelIdsRequest.push(val._id);
        }

        const filter = {
          _id: { $in: cancelIdsRequest },
        };
        const update = {
          $unset: {
            "changePlanRequest.$[elem].sendId": "",
            "changePlanRequest.$[elem].sendDate": "",
          },
        };

        const options = {
          arrayFilters: [{ "elem.status": "progress" }],
        };

        const treePlanCollection = mongoClient.db("tree").collection("plan");
        const resultDelete = await treePlanCollection.updateMany(
          filter,
          update,
          options,
        );
        if (!resultDelete.acknowledged) {
          await mongoClient.close();
          res.status(500).end();
          return;
        }

        await mongoClient.close();
        res.status(200).end();
        return;
      }
      default: {
        res.status(404).end();
        return;
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500).end();
    return;
  }
}
