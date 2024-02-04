import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import authOptions from "../auth/authoption";
import NextAuth from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { Collection, ObjectId } from "mongodb";
import { ChangePlanLV, PlanLV } from "@/types/plan-lv";
import { peaUser } from "@/types/next-auth";
import {
  FormAddPlanTree,
  FormCancelPlanTree,
  FormChangePlanTree,
  IdsHasSentPlanTreeRequest,
} from "@/types/report-tree";
import formatDate from "@/lib/format-date";

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

  const mongoClient = await clientPromise;
  const treePlanCollection = mongoClient.db("tree").collection("plan");
  const sendTreeRequestCollection = mongoClient
    .db("tree")
    .collection("sendRequest");

  try {
    switch (req.method) {
      case "POST": {
        const { changePlanIds }: { changePlanIds: string[] } = JSON.parse(
          req.body,
        );
        let changeRequestIds: ObjectId[] = [];

        for (const val of changePlanIds) {
          const doc = await treePlanCollection.findOne({
            _id: new ObjectId(val),
          });
          if (!doc || doc["businessName"] != session.pea.karnfaifa) {
            mongoClient.close();
            res.status(403).end();
            return;
          } else {
            changeRequestIds.push(new ObjectId(val));
          }
        }

        const sendId = new ObjectId();

        for (const val of changeRequestIds) {
          const filter = { _id: val };
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
          const resultUpdate = await treePlanCollection.updateOne(
            filter,
            update,
            options,
          );
          if (!resultUpdate.acknowledged) {
            mongoClient.close();
            res.status(404).end();
            return;
          }
        }
        mongoClient.close();
        res.status(200).end();
        return;
      }
      case "PUT": {
        const body: IdsHasSentPlanTreeRequest = JSON.parse(req.body);
        let doc = mongoClient
          .db("tree")
          .collection("idsHasSentRequest")
          .findOne({ _id: new ObjectId(body._id as string) });
        if (!doc) {
          mongoClient.close();
          res.status(404).end();
          return;
        }
        const update = {
          $unset: {
            "changePlanRequest.$[elem].sendId": "",
            "changePlanRequest.$[elem].sendDate": "",
          },
        };

        const options = {
          arrayFilters: [{ "elem.status": "progress" }],
        };

        for (const val of body.changePlanRequest) {
          const resultDelete = await mongoClient
            .db("tree")
            .collection("plan")
            .updateOne({ _id: new ObjectId(val._id) }, update, options);
          if (!resultDelete.acknowledged) {
            mongoClient.close();
            res.status(500).end();
            return;
          }
        }
        mongoClient.close();
        res.status(200).end();
        return;
      }
      default: {
        mongoClient.close();
        res.status(404).end();
        return;
      }
    }
  } catch (e) {
    mongoClient.close();
    res.status(500).end();
    return;
  }
}
