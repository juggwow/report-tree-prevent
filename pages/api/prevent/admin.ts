import clientPromise from "@/lib/mongodb";
import { ObjectId, WithId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import authOptions from "../auth/authoption";
import { getServerSession } from "next-auth";
import { AdminChangePlanTree } from "@/types/report-tree";
import { AdminChangePlanWithStatus } from "@/types/report-prevent";

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
  await mongoClient.connect()
  const planTreeCollection = mongoClient.db("prevent").collection("plan");

  switch (req.method) {
    case "GET": {
      try {
        const allTypeBudgets = mongoClient
          .db("prevent")
          .collection("budgetTypePrevent")
          .find({ _id: { $ne: "กฟฟ.ทดสอบ" } });
        const summary = await allTypeBudgets.toArray();
        const allRequest = mongoClient
          .db("prevent")
          .collection("changePlanRequest")
          .find({ businessName: { $ne: "กฟฟ.ทดสอบ" } });
        const typeReq = await allRequest.toArray();
        const resultGsheet = await fetch(
          "https://script.google.com/macros/s/AKfycbxYLQ5vHbDmUBEjDsgvj7tYd8kPm6NI5V3f7POtc-0OUUPzi4_EbiGveb8PkMkdvixU/exec",
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
        const data: AdminChangePlanWithStatus = JSON.parse(req.body);
        const filter = { _id: new ObjectId(data._id as string) };
        const options = {
          arrayFilters: [
            {
              "elem.status": "progress",
            },
          ],
        };
        switch (data.typeReq) {
          case "cancel": {
            const update = {
              $set: {
                "changePlanRequest.$[elem].status": "success",
              },
              $unset: {
                planName: 1,
                typePrevent: 1,
                budget: 1,
                breifQuantity: 1,
                duration: 1,
                taskmaster: 1,
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
            break;
          }
          case "add":
          case "change": {
            const update = {
              $set: {
                "changePlanRequest.$[elem].status": "success",
                planName: data.newPlan.planName,
                typePrevent: data.newPlan.typePrevent,
                budget: data.newPlan.budget,
                breifQuantity: data.newPlan.breifQuantity,
                duration: data.newPlan.duration,
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
            break;
          }
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
        const data: AdminChangePlanWithStatus = JSON.parse(req.body);
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
