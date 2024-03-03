import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import authOptions from "../auth/authoption";
import NextAuth from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { Collection, ObjectId } from "mongodb";
import { ChangePlanLV, PlanLV } from "@/types/plan-lv";
import { peaUser } from "@/types/next-auth";
import { IdsHasSentPlanPreventRequest } from "@/types/report-prevent";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>,
) {
    const session = await getServerSession(req, res, authOptions);
    if (!(session && session.sub && session.pea)) {
        res.status(401).end();
        return;
    }

    
    try {
        const mongoClient = await clientPromise
        await mongoClient.connect()
        switch (req.method) {
          case "POST": {
            const {changePlanIds}:{changePlanIds:string[]} = JSON.parse(req.body)
            if(changePlanIds.length == 0){
                await mongoClient.close()
                res.status(403).end()
                return
            }

            let ids:ObjectId[] = []
            changePlanIds.forEach(val=>{
                ids.push(new ObjectId(val))
            })

            const filter = {
                _id : { $in: ids },
                "changePlanRequest.status" : "progress"
            }

            const docs = await mongoClient.db("prevent").collection("plan").find(filter).toArray()
            if(docs.length == 0 || docs.length != changePlanIds.length){
                await mongoClient.close()
                res.status(404).end()
            }

            const sendId = new ObjectId();
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
            const resultUpdate = await mongoClient.db("prevent").collection("plan").updateMany(filter,update,options)
            if(!resultUpdate.acknowledged){
                await mongoClient.close()
                res.status(500).end()
                return
            }
            await mongoClient.close()
            res.status(200).end()
            return
          }
          case "PUT": {
            const body: IdsHasSentPlanPreventRequest = JSON.parse(req.body);
            const mongoClient = await clientPromise;
            await mongoClient.connect();
            let doc = await mongoClient
              .db("prevent")
              .collection("idsHaveSentRequest")
              .findOne({ _id: new ObjectId(body._id as string) });
            if (!doc) {
              await mongoClient.close();
              res.status(404).end();
              return;
            }
    
            let cancelIdsRequest: ObjectId[] = [];
            for (const val of doc["changePlanRequest"]) {
              cancelIdsRequest.push(val._id);
            }
    
            const filter = {
              _id: { $in: cancelIdsRequest },
            };
            const update = {
              $unset: {
                "changePlanRequest.$[elem].sendId": "",
                "changePlanRequest.$[elem].sendDate": "",
              },
            };
    
            const options = {
              arrayFilters: [{ "elem.status": "progress" }],
            };
    
            const resultDelete = await mongoClient.db("prevent").collection("plan").updateMany(
              filter,
              update,
              options,
            );
            if (!resultDelete.acknowledged) {
              await mongoClient.close();
              res.status(500).end();
              return;
            }
    
            await mongoClient.close();
            res.status(200).end();
            return;
          }
          default: {
            await mongoClient.close()
            res.status(500).end()
            return
          }
        }
    }
    catch(e){
        res.status(500).end()
        return
    }
}
