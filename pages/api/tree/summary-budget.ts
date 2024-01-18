import clientPromise from "@/lib/mongodb";
import { WithId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";



type Data = {
    summary: WithId<Document>[];
}
  
  export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>,
  ) {
    switch(req.method){
        case "GET":{
            try{
                const mongoClient = await clientPromise
                const allQuarterBudgets = mongoClient.db("tree").collection("businessNameQuarterBudgets").find({"businessName":{$ne:"กฟฟ.ทดสอบ"}})
                const summary = await allQuarterBudgets.toArray()
                const allRequest =  mongoClient.db("tree").collection("typeRequest").find()
                const typeReq = await allRequest.toArray()
                res.status(200).send({summary,typeReq})
                return

            }catch(e){
                res.status(500).end()

            }
        }
        default:{
            res.status(404).end()
            return
        }
    }
  }