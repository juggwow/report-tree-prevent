// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import authOptions from "../auth/authoption";
import clientPromise from "@/lib/mongodb";
import { ObjectId, WithId } from "mongodb";
import { PreventData } from "@/types/report-prevent";

type Data = any[]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
    try {
        const mongoClient = await clientPromise
  
        const planPreventCollection = mongoClient.db("prevent").collection("plan")

        const query = {
            planName: {
                $ne: null,
                $exists: true
            }
        }
  
        const options = {
            projection:{
              _id: 0,
              businessName : 1,
              typePrevent : 1,
              planName : 1,
              breifQuantity: 1,
              budget: 1,
              duration: 1,
              taskmaster: 1,
              zpm4: 1,
              reportDate: 1,
              editDate: 1
            }
          }
        const preventDatas = await planPreventCollection.find(query,options).toArray()
  
        res.status(200).send(preventDatas)
        return
      } catch {
        res.status(401).end();
        return;
      }
}
