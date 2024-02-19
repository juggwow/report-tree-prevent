import clientPromise from "@/lib/mongodb";
import { ObjectId, WithId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import authOptions from "../../auth/authoption";
import { getServerSession } from "next-auth";
import { AdminChangePlanTree, AllTypeChangePlan } from "@/types/report-tree";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const {s3gmdds01}:{s3gmdds01?:string} = req.body
  if(!s3gmdds01 || s3gmdds01!="1234")
  {
    res.status(403).end()
    return
  }

  const mongoClient = await clientPromise;
  await mongoClient.connect();

  switch (req.method) {
    case "POST": {
      try {
        
        const resGsheet = await fetch("https://script.google.com/macros/s/AKfycby6XVzv3SuZqo-mtMM63wPtSnOJXbPPYcWtZ0lJnASbdIHDt5ukgx8l89s-EPtcz8WKNA/exec")
        const {_id}:{_id:string[]} = await resGsheet.json()
        if(_id.length == 0){
            await mongoClient.close()
            res.status(400).end()
            return
        }

        let _idObjects:ObjectId[]=[]
        _id.forEach(val=>{
            _idObjects.push(new ObjectId(val))
        })

        const filter = {
            _id: { $in: _idObjects },
            "changePlanRequest.status":"progress"
        };
        const docs = await mongoClient.db("tree").collection("plan").find(filter).toArray()
        if(docs.length == 0 || docs.length != _id.length){
            await mongoClient.close()
            res.status(404).end()
            return
        }

        const update = {
            $set: {
              "changePlanRequest.$[elem].status": "success",
            },
          };
        const options = {
            arrayFilters: [
              { "elem.status": "progress", },
            ],
        };
        const resUpdate = await mongoClient
          .db("tree")
          .collection("plan")
          .updateMany(filter, update, options);
        if (!resUpdate.acknowledged) {
          await mongoClient.close();
          res.status(500).end();
          return;
        }

        res.send({message: `success among update: ${resUpdate.upsertedCount}`});
        return;
      } catch (e) {
        res.status(500).end();
        return;
      }
    }
    default: {
      res.status(404).end();
      return;
    }
  }
}
