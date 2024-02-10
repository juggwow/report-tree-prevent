import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import authOptions from "../auth/authoption";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

type Data = {
  massege: string;
};

type RequestData = {
  riskPoint?: string;
  place?: string;
  uploadedImage?: {
    id: string;
    url: string;
  };
  lat?: string;
  lon?: string;
  karnfaifa?: {
    businessName: string;
    fullName: string;
    aoj: string;
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
  if (!(session && session.sub && session.provider == "line")) {
    res.status(400).end();
    return;
  }

  const data: RequestData = JSON.parse(req.body);

  if (
    !(
      data.karnfaifa &&
      data.riskPoint &&
      data.place &&
      data.uploadedImage &&
      data.lat &&
      data.lon
    )
  ) {
    res.status(405).end();
    return;
  }
  const mongoClient = await clientPromise;
  await mongoClient.connect();
  const vineBeGoneCollection = mongoClient
    .db("vine-be-gone")
    .collection("risk");
  const doc = await vineBeGoneCollection.insertOne({
    sub: session.sub,
    riskPoint: data.riskPoint,
    place: data.place,
    lat: data.lat,
    lon: data.lon,
    karnfaifa: data.karnfaifa,
    uploadedImage: data.uploadedImage,
  });
  if (!doc.acknowledged) {
    await mongoClient.close();
    res.status(405).end();
    return;
  }
  await mongoClient.close();

  await sendMessageToReporter(session.sub);
  await sendMessageToMaintenance(data, doc.insertedId);
  res.status(200).end();
  return;
}

async function sendMessageToReporter(user: string) {
  const lineApiUrl = "https://api.line.me/v2/bot/message/push";
  const accessToken =
    "Cnps9+Xgzybwu7N36fvxzef+iWWZAHAIW71klZ72y6fHaEOQH2xrlC5ELes26j77qXtSaTX2wsBAwVMk9shh3HA4+3yZ7O/eEMmkY3vRM5OMylg/QZakY3LwXibylLfI5rQZNf0LKOS3zEJH7BG3uQdB04t89/1O/w1cDnyilFU=";

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  });

  const body = {
    to: user,
    messages: [
      {
        type: "text",
        text: "ขอบคุณที่รายงานสิ่งผิดปกติในระบบไฟฟ้าให้กับเรา หากมีการแก้ไขแล้ว เราจะแจ้งให้คุณได้ทราบในภายหลัง",
      },
    ],
  };

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  };

  const resLineApi = await fetch(lineApiUrl, requestOptions);
  console.log(`res ตอนส่งหาคนรายงาน ${resLineApi.status}`);
  console.log(await resLineApi.json());
}

async function sendMessageToMaintenance(data: RequestData, id: ObjectId) {
  console.log(data, id);

  const mongoClient = await clientPromise;
  await mongoClient.connect();
  const userCollection = mongoClient.db("user").collection("user");

  const result = await userCollection
    .aggregate([
      {
        $match: {
          provider: "line",
          karnfaifa: data.karnfaifa?.businessName,
        },
      },
      {
        $group: {
          _id: null,
          sub: { $addToSet: "$sub" },
        },
      },
      {
        $project: {
          _id: 0,
          sub: 1,
        },
      },
    ])
    .toArray();

  if (result.length == 0) {
    console.log("ไม่เจอ user คนแก้ไข");
    return;
  }

  const lineApiUrl = "https://api.line.me/v2/bot/message/multicast";
  const accessToken = process.env.NEXT_PUBLIC_LINE_API_TOKEN as string;

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  });

  const body = {
    to: result[0].sub,
    messages: [
      {
        type: "template",
        altText: "มีผู้รายงานจุดเสี่ยงในระบบไฟฟ้า",
        template: {
          type: "buttons",
          thumbnailImageUrl: data.uploadedImage?.url,
          imageAspectRatio: "square",
          imageSize: "contain",
          imageBackgroundColor: "#F3E6E6",
          title: "ได้รับแจ้งสิ่งผิดปกติในระบบไฟฟ้า",
          text: `สิ่งผิดปกติ: ${data.riskPoint}\nหมายเลขเสา/สถานที่: ${data.place}`,
          actions: [
            {
              type: "uri",
              label: "แผนที่",
              uri: `https://www.google.com/maps?q=${data.lat},${data.lon}`,
            },
            {
              type: "uri",
              label: "แก้ไข",
              uri: "https://www.google.co.th",
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
  console.log(`res ตอนส่งหาคนแก้ไข ${resLineApi.status}`);
  console.log(await resLineApi.json());
}
