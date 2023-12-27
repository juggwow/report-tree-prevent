// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import authOptions from "../auth/authoption";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { PreventData } from "@/types/report-prevent";

type Data = {
  massege: string;
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
  if (session && session.sub && session.pea && session.pea.karnfaifa) {
    try {
      const mongoClient = await clientPromise;

      const planPreventCollection = mongoClient
        .db("prevent")
        .collection("plan");

      const data: PreventData[] = JSON.parse(req.body);

      data.forEach(async (val) => {
        const doc = await planPreventCollection.findOne(
          { _id: new ObjectId(val.id as string) },
          { projection: { businessName: 1 } },
        );
        if (!(doc && doc.businessName == session.pea?.karnfaifa)) {
          res.status(404).end();
          return;
        }
        const resultUpdate = await planPreventCollection.updateOne(
          {
            _id: new ObjectId(val.id as string),
          },
          {
            $set: {
              editReport: val.editDate,
              reportDate: val.reportDate,
              zpm4: val.zpm4,
            },
          },
        );
        if (!resultUpdate.acknowledged) {
          res.status(404).end();
          return;
        }
      });

      res.status(200).send({ massege: `รายงาน ZPM4/PO สำเร็จ` });
      return;
    } catch {
      res.status(401).end();
      return;
    }
  }

  res.status(401).end();
  return;
}
