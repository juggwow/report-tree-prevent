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
  if (req.method != "POST") {
    res.status(400).end();
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  if (!(session && session.sub && session.pea)) {
    res.status(401).end();
    return;
  }

  let changeReq:ChangePlanLV = JSON.parse(req.body)

  try {
    const mongoClient = await clientPromise;

    const planLVCollection: Collection<PlanLV> = mongoClient
      .db("patrol-LV")
      .collection("plan");

    const plan = await planLVCollection
      .findOne({ _id: new ObjectId(changeReq.plan_id)  })

    if(!plan){
      res.status(404).end();
      return;
    }

    if(plan.businessName != session.pea.karnfaifa){
      res.status(404).end();
      return;
    }

    const insert:InsertPlanLVChangeReq = {
      plan_id: new ObjectId(changeReq.plan_id),
      status: "progress",
      userReq: session.pea,
      changeReq: {
        peaNo: changeReq.newPlan.peaNo,
        distanceCircuit: Number(changeReq.newPlan.distanceCircuit),
        feeder: changeReq.newPlan.feeder
      },
      reason: changeReq.reason
    } 

    const changePlanLVReqCollection: Collection<InsertPlanLVChangeReq> = mongoClient.db("patrol-LV").collection("change-request")
    const mongodbRes = await changePlanLVReqCollection.insertOne(insert)
    if(!mongodbRes.acknowledged){
      res.status(500).end()
      return
    }

    res.status(200).end
  } catch (e) {
    console.error(e);
    res.status(500).end
  }

  res.status(200).end();
  return;
}

interface InsertPlanLVChangeReq  {
  plan_id: ObjectId;
  status: "progress" | "success" | "reject";
  userReq: peaUser;
  reason: string
  changeReq: {
    peaNo: string;
    distanceCircuit: number;
    feeder: string;
  }

}
