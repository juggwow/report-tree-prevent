import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import authOptions from "../auth/authoption";
import NextAuth from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { Collection, ObjectId } from "mongodb";
import { ChangePlanLV, PlanLV } from "@/types/plan-lv";
import { peaUser } from "@/types/next-auth";

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

  let changeReq: ChangePlanLV = JSON.parse(req.body);

  try {
    const mongoClient = await clientPromise;

    const planLVCollection: Collection<PlanLV> = mongoClient
      .db("patrol-LV")
      .collection("plan");

    const plan = await planLVCollection.findOne({
      _id: new ObjectId(changeReq.plan_id),
    });

    if (!plan) {
      res.status(404).end();
      return;
    }

    if (plan.businessName != session.pea.karnfaifa) {
      res.status(403).end();
      return;
    }

    const insert: InsertPlanLVChangeReq = {
      status: "progress",
      userReq: session.pea,
      changeReq: {
        peaNo: changeReq.newPlan.peaNo,
        distanceCircuit: Number(changeReq.newPlan.distanceCircuit),
        feeder: changeReq.newPlan.feeder,
      },
      oldPlan: {
        peaNo: changeReq.oldPlan.peaNo,
        distanceCircuit: Number(changeReq.oldPlan.distanceCircuit),
        feeder: changeReq.oldPlan.feeder,
      },
      reason: changeReq.reason,
      dateReq: new Date().toISOString(),
    };

    switch (req.method) {
      case "PUT": {
        const filter = { _id: new ObjectId(changeReq.plan_id) };
        const update = {
          $set: {
            "changePlanRequest.$[elem]": insert,
          },
        };
        const options = {
          arrayFilters: [
            {
              "elem.status": "progress",
              "elem.oldPlan.peaNo": insert.oldPlan.peaNo,
            },
          ],
        };

        const resultUpdate = await planLVCollection.updateOne(
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
      case "PATCH":{
        const filter = { _id: new ObjectId(changeReq.plan_id) };
        const update = {
          $pull: {
            changePlanRequest: {
              status: 'progress',
              "changeReq.peaNo": changeReq.newPlan.peaNo
            },
          },
        };
        
        const resultDelete = await planLVCollection.updateOne(filter,update);

        if (!resultDelete.acknowledged) {
          res.status(404).end();
          return;
        }

        res.status(200).end();
        return;
      }
      case "POST": {
        const query = {
          _id: new ObjectId(changeReq.plan_id),
          changePlanRequest: {
            $not: {
              $elemMatch: {
                status: "progress",
              },
            },
          },
        };

        const update = { $addToSet: { changePlanRequest: insert } };

        const resultInsert = await planLVCollection.findOneAndUpdate(
          query,
          update,
        );
        if (!resultInsert.ok) {
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

interface InsertPlanLVChangeReq {
  status: "progress" | "success" | "reject";
  userReq: peaUser;
  reason: string;
  oldPlan: {
    peaNo: string;
    distanceCircuit: number;
    feeder: string;
  };
  changeReq: {
    peaNo: string;
    distanceCircuit: number;
    feeder: string;
  };
  dateReq: string;
}
