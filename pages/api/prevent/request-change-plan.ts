import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import authOptions from "../auth/authoption";
import {
  ChangePlanRequirePrevent,
  ChangePlanWithStatus,
} from "@/types/report-prevent";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
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

  let changeReq: ChangePlanRequirePrevent = JSON.parse(req.body);

  try {
    const mongoClient = await clientPromise;
    const planPreventCollection = mongoClient.db("prevent").collection("plan");

    switch (req.method) {
      case "POST":
        const update = {
          $addToSet: {
            changePlanRequest: {
              ...changeReq,
              status: "progress",
              userReq: session.pea,
              dateReq: formatDate(new Date()),
            },
          },
        };
        switch (changeReq.typeReq) {
          case "change":
          case "cancel": {
            const cancelAndChangeQuery = {
              _id: new ObjectId(changeReq._id as string),
              changePlanRequest: {
                $not: {
                  $elemMatch: {
                    status: "progress",
                  },
                },
              },
            };
            const docExist =
              await planPreventCollection.findOne(cancelAndChangeQuery);
            if (!docExist) {
              res.status(404).end();
              return;
            }

            if (docExist["businessName"] != session.pea.karnfaifa) {
              res.status(403).end();
              return;
            }

            const resultUpdate = await planPreventCollection.updateOne(
              cancelAndChangeQuery,
              update,
            );
            if (!resultUpdate.acknowledged) {
              res.status(404).end();
              return;
            }
            break;
          }

          case "add": {
            const resultInsert = await planPreventCollection.insertOne({
              businessName: session.pea.karnfaifa,
            });
            if (!resultInsert.acknowledged) {
              res.status(404).end();
              return;
            }
            const resultUpdate = await planPreventCollection.updateOne(
              { _id: resultInsert.insertedId },
              update,
            );
            if (!resultUpdate.acknowledged) {
              res.status(404).end();
            }
            break;
          }

          default: {
            res.status(404).end();
            return;
          }
        }
        res.status(200).end()
        return;
      default:
        {
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
