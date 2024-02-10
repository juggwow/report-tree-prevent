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
  await mongoClient.connect();
  const planTreeCollection = mongoClient.db("tree").collection("plan");

  switch (req.method) {
    case "GET": {
      try {
        const allQuarterBudgets = mongoClient
          .db("tree")
          .collection("businessNameQuaterBudget")
          .find({ _id: { $ne: "กฟฟ.ทดสอบ" } });
        const summary = await allQuarterBudgets.toArray();
        const projection = {
          _id: { $toString: "$_id" },
          businessName: "$businessName",
          status: "$status",
          reason: "$reason",
          newPlan: "$newPlan",
          oldPlan: "$oldPlan",
          userReq: "$userReq",
          dateReq: "$dateReq",
          typeReq: "$typeReq",
        };
        const allRequest = mongoClient
          .db("tree")
          .collection("typeRequest")
          .find({ businessName: { $ne: "กฟฟ.ทดสอบ" } }, { projection });
        let typeReq = await allRequest.toArray();
        const resultGsheet = await fetch(
          "https://script.google.com/macros/s/AKfycby6XVzv3SuZqo-mtMM63wPtSnOJXbPPYcWtZ0lJnASbdIHDt5ukgx8l89s-EPtcz8WKNA/exec",
          {
            method: "POST",
            body: JSON.stringify({ summary, typeReq }),
          },
        );
        if (resultGsheet.status == 200) {
          await mongoClient.close();
          res.status(200).end();
          return;
        } else {
          await mongoClient.close();
          res.status(500).end();
          return;
        }
      } catch (e) {
        await mongoClient.close();
        res.status(500).end();
        return;
      }
    }
    case "PATCH": {
      try {
        const data: AdminChangePlanTree = JSON.parse(req.body);
        const filter = { _id: new ObjectId(data._id as string) };
        const options = {
          arrayFilters: [
            {
              "elem.status": "progress",
            },
          ],
        };
        const update = {
          $set: {
            "changePlanRequest.$[elem].status": "success",
          },
        };
        const resultApprove = await planTreeCollection.updateOne(
          filter,
          update,
          options,
        );
        if (!resultApprove.acknowledged) {
          await mongoClient.close();
          res.status(404).end();
        }
        await mongoClient.close();
        res.status(200).end();
        return;
      } catch (e) {
        await mongoClient.close();
        res.status(500).end();
        return;
      }
    }
    case "PUT": {
      try {
        const data: AdminChangePlanTree = JSON.parse(req.body);
        const filter = { _id: new ObjectId(data._id as string) };
        const update = {
          $set: {
            "changePlanRequest.$[elem].status": "reject",
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
          await mongoClient.close();
          res.status(404).end();
          return;
        }
        await mongoClient.close();
        res.status(200).end();
        return;
      } catch (e) {
        await mongoClient.close();
        res.status(500).end();
        return;
      }
    }
    default: {
      await mongoClient.close();
      res.status(404).end();
      return;
    }
  }
}
