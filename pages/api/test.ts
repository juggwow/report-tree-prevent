import type { NextApiRequest, NextApiResponse } from "next";
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
  //   let changeReq:ChangePlanLV = JSON.parse(req.body)

  try {
    const mongoClient = await clientPromise;

    const planLVCollection = mongoClient.db("patrol-LV").collection("plan");

    const plan = await planLVCollection.findOne({
      _id: new ObjectId("655e09455f16d485454b0ce3"),
    });

    console.log(plan);

    if (!plan) {
      mongoClient.close();
      res.status(404).end();
      return;
    }
  } catch (e) {
    console.error(e);
    res.status(500).end();
    return;
  }
}

interface InsertPlanLVChangeReq {
  plan_id: ObjectId;
  status: "progress" | "success" | "reject";
  userReq: peaUser;
  reason: string;
  changeReq: {
    peaNo: string;
    distanceCircuit: number;
    feeder: string;
  };
}
