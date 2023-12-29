import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { doc, setDoc } from "firebase/firestore";
import db from "@/firebase";
import { peaUser } from "@/types/next-auth";
import authOptions from "../auth/authoption";
import clientPromise from "@/lib/mongodb";
import { treeData } from "@/types/report-tree";
import { ObjectId } from "mongodb";
import { getProviders } from "next-auth/react";

type Data = {
  massege: string;
};

type RequestData = {
    riskPoint: string; 
    place: string; 
    file: string
    lat: string;
    lon: string;
    karnfaifa: {
        businessName: string;
        fullName: string;
        aoj:string
    }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
    if (req.method != "POST") {
        res.status(400).end();
        return;
    }
    const session = await getServerSession(req, res, authOptions);
    if (!(session && session.sub)){
        res.status(400).end();
        return;
    }

    const providers = await getProviders()
    console.log(providers)

    const data:RequestData = JSON.parse(req.body)
    const uploadResult = await fetch("https://script.google.com/macros/s/AKfycbyTltbACbFhsd7ubH22dGXUyI0OShWmJe551lVfUg7KhgZkpJTl4F6AwElGk09ZKZPw/exec",{
      method: "POST",
      body: data.file
    })
    const uploadedImage = await uploadResult.json()
    if(uploadedImage.error){
        res.status(405).end();
        return;
    }

    const mongoClient = await clientPromise;
    const vineBeGoneCollection = mongoClient.db("vine-be-gone").collection("risk")
    const doc = await vineBeGoneCollection.insertOne({
        user: session.sub,
        riskPoint: data.riskPoint, 
        place: data.place, 
        lat: data.lat,
        lon: data.lon,
        karnfaifa: data.karnfaifa,
        uploadedImage
    })
    if(!doc.acknowledged){
        res.status(405).end()
        return
    }

    res.status(200).end()
    return
}