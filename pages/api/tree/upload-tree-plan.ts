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
  // let uploadPlanTree = JSON.parse(req.body);
  let uploadPlanTree: UploadTreePlan[] = req.body;

  const mongoClient = await clientPromise;

  const planTreeCollection: Collection<UploadTreePlan> = mongoClient
    .db("tree")
    .collection("plan");

  switch (req.method) {
    case "POST": {
      if (uploadPlanTree.length == 0) {
        res.status(400).end();
        return;
      }

      const lookupPlan = await planTreeCollection.findOne({
        businessName: uploadPlanTree[0].businessName,
      });
      if (lookupPlan) {
        const resultDeleteAllPlan = await planTreeCollection.deleteMany({
          businessName: uploadPlanTree[0].businessName,
        });
        console.log(resultDeleteAllPlan.deletedCount);
        if (!resultDeleteAllPlan.acknowledged) {
          res.status(400).end();
          return;
        }
      }

      const resultUpload = await planTreeCollection.insertMany(uploadPlanTree);
      if (!resultUpload.acknowledged) {
        res.status(400).end();
        return;
      }

      res.status(200).end();
      return;
    }
  }

  res.status(404).end();
  return;
}

type UploadTreePlan = {
  businessName: string;
  planName: string;
  qauntity: {
    plentifully?: number;
    moderate?: number;
    lightly?: number;
    clear?: number;
  };
  budget: number;
  systemVolt: "33kV" | "400/230V" | "115kV";
  month: string;
  hireType: "normal" | "special";
};
