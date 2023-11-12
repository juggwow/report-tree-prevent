// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { doc, setDoc } from "firebase/firestore";
import db from "@/firebase";
import { peaUser } from "@/types/next-auth";
import authOptions from "./auth/authoption";

type Data = {
  name: string;
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
      const resFromAppScript = await fetch(
        `https://script.google.com/macros/s/AKfycby0DVu9COEYPZLlPkbJZEPrj1cWj2DW1WJasZQd6f6AhQLYDR2hcP8RDsOwmOIGaD909Q/exec?karnfaifa=${session.pea.karnfaifa}`,
        {
          method: "POST",
          body: req.body,
        },
      );
      const data = await resFromAppScript.json();
      if (data.massege == "success") {
        res.status(200).end();
        return;
      }
      res.status(401).end();
      return;
    } catch {
      res.status(401).end();
      return;
    }
  }

  res.status(401).end();
  return;
}
