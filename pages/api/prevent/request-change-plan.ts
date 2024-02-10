import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import authOptions from "../auth/authoption";
import {
  ChangePlanRequirePrevent,
  ChangePlanWithStatus,
} from "@/types/report-prevent";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import formatDate from "@/lib/format-date";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const session = await getServerSession(req, res, authOptions);
  if (!(session && session.sub && session.pea)) {
    res.status(401).end();
    return;
  }

  let changeReq: ChangePlanRequirePrevent = JSON.parse(req.body);
  try {
    const mongoClient = await clientPromise;
    await mongoClient.connect();
    const planPreventCollection = mongoClient.db("prevent").collection("plan");

    switch (req.method) {
      case "POST": {
        const update = {
          $addToSet: {
            changePlanRequest: {
              ...changeReq,
              status: "progress",
              userReq: session.pea,
              dateReq: formatDate(new Date()),
            },
          },
        };
        switch (changeReq.typeReq) {
          case "change":
          case "cancel": {
            const cancelAndChangeQuery = {
              _id: new ObjectId(changeReq._id as string),
              changePlanRequest: {
                $not: {
                  $elemMatch: {
                    status: "progress",
                  },
                },
              },
            };
            const docExist =
              await planPreventCollection.findOne(cancelAndChangeQuery);
            if (!docExist) {
              await mongoClient.close();
              res.status(404).end();
              return;
            }

            if (docExist["businessName"] != session.pea.karnfaifa) {
              await mongoClient.close();
              res.status(403).end();
              return;
            }

            const resultUpdate = await planPreventCollection.updateOne(
              cancelAndChangeQuery,
              update,
            );
            if (!resultUpdate.acknowledged) {
              await mongoClient.close();
              res.status(404).end();
              return;
            }
            break;
          }

          case "add": {
            const resultInsert = await planPreventCollection.insertOne({
              businessName: session.pea.karnfaifa,
            });
            if (!resultInsert.acknowledged) {
              await mongoClient.close();
              res.status(404).end();
              return;
            }
            const resultUpdate = await planPreventCollection.updateOne(
              { _id: resultInsert.insertedId },
              update,
            );
            if (!resultUpdate.acknowledged) {
              await mongoClient.close();
              res.status(404).end();
            }
            break;
          }

          default: {
            await mongoClient.close();
            res.status(404).end();
            return;
          }
        }
        await mongoClient.close();
        res.status(200).end();
        return;
      }
      case "PUT": {
        const dataUpdate: ChangePlanWithStatus = {
          ...changeReq,
          userReq: session.pea,
          status: "progress",
          dateReq: formatDate(new Date()),
        };
        const filter = { _id: new ObjectId(changeReq._id) };
        const update = {
          $set: {
            "changePlanRequest.$[elem]": dataUpdate,
          },
        };
        const options = {
          arrayFilters: [
            {
              "elem.status": "progress",
            },
          ],
        };
        const resultUpdate = await planPreventCollection.updateOne(
          filter,
          update,
          options,
        );
        if (!resultUpdate.acknowledged) {
          await mongoClient.close();
          res.status(404).end();
          return;
        }
        await mongoClient.close();
        res.status(200).end();
        return;
      }
      case "PATCH": {
        const filter = { _id: new ObjectId(changeReq._id) };
        const update = {
          $pull: {
            changePlanRequest: {
              status: "progress",
            },
          },
        };

        const resultDelete = await planPreventCollection.updateOne(
          filter,
          update,
        );

        if (!resultDelete.acknowledged) {
          await mongoClient.close();
          res.status(404).end();
          return;
        }
        await mongoClient.close();
        res.status(200).end();
        return;
      }

      default: {
        await mongoClient.close();
        res.status(404).end();
        return;
      }
    }
  } catch (e) {
    console.log(e);
    await (await clientPromise).close();
    res.status(500).end();
    return;
  }
}
