import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import authOptions from "../../auth/authoption";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { RequestDataForSendToReporter } from "@/types/vine-be-gone-now";

type Data = {
  massege: string;
};

type RequestData = {
  uploadedImage: {
    id: string;
    url: string;
  };
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
  if (!(session && session.sub && session.pea)) {
    res.status(400).end();
    return;
  }

  const id = req.query.id as string;

  const data: RequestData = JSON.parse(req.body);

  const mongoClient = await clientPromise;
  await mongoClient.connect();

  const filter = { _id: new ObjectId(id) };
  const update = {
    maintenance: {
      operator: session.pea,
      image: data.uploadedImage,
    },
  };

  const collection = mongoClient.db("vine-be-gone").collection("risk");

  const resultUpdate = await collection.updateOne(filter, {
    $set: update,
  });

  if (!resultUpdate.acknowledged) {
    await mongoClient.close();
    res.status(405).end();
    return;
  }

  const resultData = (await collection.findOne(filter, {
    projection: {
      _id: 0,
      id: { $toString: "$_id" },
      sub: 1,
      riskPoint: 1,
      place: 1,
      img: "$maintenance.image.url",
    },
  })) as unknown as RequestDataForSendToReporter;

  if (!resultData) {
    await mongoClient.close();
    res.status(404).end();
    return;
  }

  sendMessageToReporter(resultData);

  await mongoClient.close();
  res.status(200).end();
  return;
}

async function sendMessageToReporter(data: RequestDataForSendToReporter) {
  const lineApiUrl = "https://api.line.me/v2/bot/message/push";
  const accessToken = process.env.NEXT_PUBLIC_MESSAGING_TOKEN as string

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  });

  const body = {
    to: data.sub,
    messages: [
      {
        type: "template",
        altText: "สิ่งผิดปกติของคุณได้รับการแก้ไขแล้ว",
        template: {
          type: "buttons",
          thumbnailImageUrl: data.img,
          imageAspectRatio: "square",
          imageSize: "contain",
          imageBackgroundColor: "#F3E6E6",
          title: "สิ่งผิดปกติของคุณได้รับการแก้ไขแล้ว",
          text: `ตำแหน่ง ${data.place}`,
          actions: [
            {
              type: "uri",
              label: "รายละเอียดเพิ่มเติม",
              uri: `${data.img}`,
            },
          ],
        },
      },
    ],
  };

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  };

  const resLineApi = await fetch(lineApiUrl, requestOptions);
}
