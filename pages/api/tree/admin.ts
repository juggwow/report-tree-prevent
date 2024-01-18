import clientPromise from "@/lib/mongodb";
import { ObjectId, WithId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import authOptions from "../auth/authoption";
import { getServerSession } from "next-auth";
import { AdminChangePlanTree } from "@/types/report-tree";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const session = await getServerSession(req, res, authOptions);
  if (!(session && session.pea && session.pea.role == "admin")) {
    res.status(403).end();
    return;
  }

  const mongoClient = await clientPromise;
  const planTreeCollection = mongoClient.db("tree").collection("plan")

  switch (req.method) {
    case "GET": {
      try {
        const allQuarterBudgets = mongoClient
          .db("tree")
          .collection("businessNameQuaterBudget")
          .find({ _id: { $ne: "กฟฟ.ทดสอบ" } });
        const summary = await allQuarterBudgets.toArray();
        const allRequest = mongoClient
          .db("tree")
          .collection("typeRequest")
          .find({ businessName: { $ne: "กฟฟ.ทดสอบ" } });
        const typeReq = await allRequest.toArray();
        const resultGsheet = await fetch(
          "https://script.google.com/macros/s/AKfycby6XVzv3SuZqo-mtMM63wPtSnOJXbPPYcWtZ0lJnASbdIHDt5ukgx8l89s-EPtcz8WKNA/exec",
          {
            method: "POST",
            body: JSON.stringify({ summary, typeReq }),
          },
        );
        if (resultGsheet.status == 200) {
          res.status(200).end();
          return;
        } else {
          res.status(500).end();
          return;
        }
      } catch (e) {
        res.status(500).end();
        return
      }
    }
    case "PATCH":{
      try{
        const data:AdminChangePlanTree = JSON.parse(req.body)
        const filter = { _id: new ObjectId(data._id as string) };
        const options = {
          arrayFilters: [
            {
              "elem.status": "progress",
            },
          ],
        };
        switch(data.typeReq){
          case "cancel":{
            const update = {
              $set: {
                "changePlanRequest.$[elem].status": "success"
              },
              $unset: {
                planName: 1,
                quantity: 1,
                budget: 1,
                systemVolt: 1,
                month: 1,
                distance: 1,
                hireType: 1,
              }
            }
            const resultApprove = await planTreeCollection.updateOne(
              filter,
              update,
              options,
            );
            if(!resultApprove.acknowledged){
              res.status(404).end()
            }
            break
          }
          case "add":
          case "change": {
            let distance = 0
            if(data.newPlan.hireType == "normal"){
              distance = Number(data.newPlan.quantity.clear) + Number(data.newPlan.quantity.lightly) + Number(data.newPlan.quantity.moderate) + Number(data.newPlan.quantity.plentifully)
            }
            else if(data.newPlan.hireType == "self" ){
              distance = Number(data.newPlan.quantity.distance)
            }
            const update = {
              $set: {
                "changePlanRequest.$[elem].status": "success",
                planName: data.newPlan.planName,
                quantity: data.newPlan.quantity,
                budget: data.newPlan.budget,
                systemVolt: data.newPlan.systemVolt,
                month: data.newPlan.month,
                hireType: data.newPlan.hireType,
                distance,
              },
            }
            const resultApprove = await planTreeCollection.updateOne(
              filter,
              update,
              options,
            );
            if(!resultApprove.acknowledged){
              res.status(404).end()
            }
            break
          }
        }
        res.status(200).end()
        return
      }catch(e){
        res.status(500).end()
        return
      }
    }
    case "PUT":{
      try{
        const data:AdminChangePlanTree = JSON.parse(req.body)
        const filter = { _id: new ObjectId(data._id as string) };
        const update = {
          $set: {
            "changePlanRequest.$[elem]": data,
          },
        };
        const options = {
          arrayFilters: [
            {
              "elem.status": "progress",
            },
          ],
        };
        const resultReject = await planTreeCollection.updateOne(
          filter,
          update,
          options,
        );
        if (!resultReject.acknowledged) {
          res.status(404).end();
          return;
        }
        res.status(200).end()
        return

      }catch(e){
        res.status(500).end()
        return
      }

    }
    default: {
      res.status(404).end();
      return;
    }
  }
}
