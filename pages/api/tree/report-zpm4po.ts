// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { doc, setDoc } from "firebase/firestore";
import db from "@/firebase";
import { peaUser } from "@/types/next-auth";
import authOptions from "../auth/authoption";
import clientPromise from "@/lib/mongodb";
import { treeData } from "@/types/report-tree";
import { ObjectId } from "mongodb";
import formatDate from "@/lib/format-date";

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
      await mongoClient.connect()

      const planTreeCollection = mongoClient.db("tree").collection("plan");

      const data: treeData[] = JSON.parse(req.body);
      console.log(data)

      let editIds:ObjectId[]=[]
      let reportIds:ObjectId[]=[]
      let date=formatDate(new Date())
      let order:string[]=[]
      data.forEach((val)=>{
        val.reportDate?reportIds.push(new ObjectId(val.id as string)):editIds.push(new ObjectId(val.id as string))
        order.push(val.zpm4Po as string)
        }
      )

      order = order.filter((val,i,arr)=>{
        return arr.indexOf(val) === i
      })
      if(order.length !=1){
        res.status(405).end()
        return
      }

      const reportfilter = {
        _id : {$in : reportIds},
        businessName: session.pea.karnfaifa
      }
      const reportDocs = await planTreeCollection.find(reportfilter).toArray()
      if(reportDocs.length != reportIds.length){
        await mongoClient.close()
        res.status(404).end()
        return
      }

      const editFilter = {
        _id : {$in : editIds},
        businessName: session.pea.karnfaifa
      }
      const editDocs = await planTreeCollection.find(editFilter).toArray()
      if(editDocs.length != editIds.length){
        await mongoClient.close()
        res.status(404).end()
        return
      }

      const reportUpdate = {
        $set: {
          reportDate: date,
          editReport: date,
          zpm4Po: order[0]
        }
      }
      const resReport = await planTreeCollection.updateMany(reportfilter,reportUpdate)
      if(!resReport.acknowledged){
        await mongoClient.close()
        res.status(500).end()
        return
      }

      const editUpdate = {
        $set : {
          editReport: date,
          zpm4Po: order[0]
        }
      }
      const resEdit = await planTreeCollection.updateMany(editFilter, editUpdate)
      if(!resEdit.acknowledged){
        await mongoClient.close()
        res.status(500).end()
        return
      }

      // for(const val of data){
      //   const doc = await planTreeCollection.findOne(
      //     { _id: new ObjectId(val.id as string) },
      //     { projection: { businessName: 1 } },
      //   );
      //   if (!(doc && doc.businessName == session.pea?.karnfaifa)) {
      //     await mongoClient.close();
      //     res.status(404).end();
      //     return;
      //   }
      //   const resultUpdate = await planTreeCollection.updateOne(
      //     {
      //       _id: new ObjectId(val.id as string),
      //     },
      //     {
      //       $set: {
      //         editReport: val.editDate,
      //         reportDate: val.reportDate,
      //         zpm4Po: val.zpm4Po,
      //       },
      //     },
      //   );
      //   if (!resultUpdate.acknowledged) {
      //     await mongoClient.close();
      //     res.status(404).end();
      //     return;
      //   }
      // }
      
      await mongoClient.close();
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
