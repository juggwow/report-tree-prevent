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

  let changeReq: FormChangePlanTree | FormAddPlanTree | FormCancelPlanTree =
    JSON.parse(req.body);

  try {
    const mongoClient = await clientPromise;

    const planTreeCollection = mongoClient
      .db("tree")
      .collection<
        FormChangePlanTree | FormAddPlanTree | FormCancelPlanTree
      >("plan");

    if (changeReq.typeReq == "cancel" || changeReq.typeReq == "change") {
      const plan = await mongoClient
        .db("tree")
        .collection("plan")
        .findOne({ _id: new ObjectId(changeReq._id as string) });

      if (!plan) {
        res.status(404).end();
        return;
      }

      if (plan.businessName != session.pea.karnfaifa) {
        res.status(403).end();
        return;
      }
    }

    switch (req.method) {
      case "POST": {
        switch (changeReq.typeReq) {
          case "change":
          case "cancel": {
            const query = {
              _id: new ObjectId(changeReq._id as string),
              changePlanRequest: {
                $not: {
                  $elemMatch: {
                    status: "progress",
                  },
                },
              },
            };
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

            const resultInsert = await planTreeCollection.findOneAndUpdate(
              query,
              update,
            );
            if (!resultInsert.ok) {
              res.status(404).end();
              return;
            }
            break;
          }
          case "add": {
            const resultInsert = await mongoClient
              .db("tree")
              .collection("plan")
              .insertOne({
                businessName: session.pea.karnfaifa,
              });
            if (!resultInsert.acknowledged) {
              res.status(404).end();
              return;
            }

            const resultUpdate = await mongoClient
              .db("tree")
              .collection("plan")
              .updateOne(
                {
                  _id: resultInsert.insertedId,
                },
                {
                  $addToSet: {
                    changePlanRequest: {
                      ...changeReq,
                      status: "progress",
                      userReq: session.pea,
                      dateReq: formatDate(new Date()),
                    },
                  },
                },
              );
            if (!resultUpdate.acknowledged) {
              res.status(404).end();
              return;
            }
            break;
          }
          default: {
            res.status(404).end();
            return;
          }
        }
        res.status(200).end();
        return;
      }
      case "PUT": {
        const filter = { _id: new ObjectId(changeReq._id) };
        const update = {
          $set: {
            "changePlanRequest.$[elem]": changeReq,
          },
        };
        const options = {
          arrayFilters: [
            {
              "elem.status": "progress",
            },
          ],
        };
        const resultUpdate = await planTreeCollection.updateOne(
          filter,
          update,
          options,
        );
        if (!resultUpdate.acknowledged) {
          res.status(404).end();
          return;
        }
        res.status(200).end();
        return;
      }
      case "PATCH": {
        const filter = { _id: new ObjectId(changeReq._id) };
        const update = {
          $pull: {
            changePlanRequest: {
              status: "progress",
            },
          },
        };

        const resultDelete = await planTreeCollection.updateOne(filter, update);

        if (!resultDelete.acknowledged) {
          res.status(404).end();
          return;
        }

        res.status(200).end();
        return;
      }
      default: {
        res.status(404).end();
        return;
      }
    }
  } catch (e) {
    console.error(e);
    res.status(500).end;
    return;
  }
}
