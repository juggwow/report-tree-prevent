import clientPromise from "@/lib/mongodb";
import { ObjectId, WithId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import authOptions from "../../auth/authoption";
import { getServerSession } from "next-auth";
import { AdminChangePlanTree, AllTypeChangePlan } from "@/types/report-tree";

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

  switch (req.method) {
    case "POST": {
      try {
        let sentIds: ObjectId[] = [];
        JSON.parse(req.body).ids.forEach((val: string) => {
          sentIds.push(new ObjectId(val));
        });
        const filter = {
          _id: {
            $in: sentIds,
          },
          businessName: {
            $ne: "กฟฟ.ทดสอบ",
          },
        };
        const docs = await mongoClient
          .db("tree")
          .collection("idsHasSentRequest")
          .find(filter)
          .toArray();
        if (docs.length == 0 || docs.length != sentIds.length) {
          await mongoClient.close();
          res.status(404).end();
          return;
        }

        let typeReq: AdminChangePlanTree[] = [];
        docs.forEach((val) => {
          let businessName: string = val["businessName"];
          val["changePlanRequest"].forEach((val: AdminChangePlanTree) => {
            typeReq.push({
              ...val,
              _id: (val._id as ObjectId).toHexString(),
              businessName,
            });
          });
        });

        const allQuarterBudgets = mongoClient
          .db("tree")
          .collection("businessNameQuaterBudget")
          .find({ _id: { $ne: "กฟฟ.ทดสอบ" } });
        const summary = await allQuarterBudgets.toArray();
        await mongoClient.close();

        const resultGsheet = await fetch(
          "https://script.google.com/macros/s/AKfycby6XVzv3SuZqo-mtMM63wPtSnOJXbPPYcWtZ0lJnASbdIHDt5ukgx8l89s-EPtcz8WKNA/exec",
          {
            method: "POST",
            body: JSON.stringify({ summary, typeReq }),
          },
        );

        if (resultGsheet.status != 200) {
          res.status(500).end();
          return;
        }
        res.status(200).end();
        return;
      } catch (e) {
        console.log(e);
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
