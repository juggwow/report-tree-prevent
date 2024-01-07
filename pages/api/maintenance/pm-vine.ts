import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import authOptions from "../auth/authoption";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { ImgMediaCardProp } from "@/types/vine-be-gone-now";

type Data = {
  filteredDocuments: ImgMediaCardProp[];
  totalDocuments: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const session = await getServerSession(req, res, authOptions);
  if (!(session && session.sub)) {
    res.status(400).end();
    return;
  }

  const mongoClient = await clientPromise;
  const vineBeGoneCollection = mongoClient
    .db("vine-be-gone")
    .collection("risk");

  switch (req.method) {
    case "GET": {
      const typeDoc = req.query.typeDoc;
      if (
        !typeDoc ||
        Array.isArray(typeDoc) ||
        !["all", "success", "progress"].includes(typeDoc)
      ) {
        res.status(405).end();
        return;
      }
      let maintenanceQuery;
      switch (typeDoc) {
        case "all":
          maintenanceQuery = {};
          break;
        case "success":
          maintenanceQuery = {
            maintenance: { $exists: true },
          };
          break;
        case "progress":
          maintenanceQuery = {
            maintenance: { $exists: false },
          };
      }
      const page = req.query.page ? Number(req.query.page) : 1;
      const result = await vineBeGoneCollection
        .aggregate([
          {
            $match: {
              ...maintenanceQuery,
              "karnfaifa.businessName": session.pea?.karnfaifa,
            },
          },
          {
            $facet: {
              filteredDocuments: [
                {
                  $project: {
                    _id: 0,
                    id: "$_id",
                    riskPoint: 1,
                    place: 1,
                    lat: 1,
                    lon: 1,
                    uploadedImage: 1,
                    maintenance: 1,
                  },
                },
                { $skip: page * 6 - 6 },
                { $limit: 6 },
              ],
              totalDocuments: [{ $count: "count" }],
            },
          },
          {
            $unwind: "$totalDocuments",
          },
          {
            $project: {
              totalDocuments: "$totalDocuments.count",
              filteredDocuments: 1,
            },
          },
        ])
        .toArray();

      if (result.length == 0) {
        res.status(404).end();
        return;
      }

      res.status(200).send(result[0] as unknown as Data);
      return;
    }
    default: {
      res.status(404).end();
      return;
    }
  }
}
