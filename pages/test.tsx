import clientPromise from "@/lib/mongodb";
import { PlanLV } from "@/types/plan-lv";
import { Collection, ObjectId } from "mongodb";
import { getSession } from "next-auth/react";

export async function getServerSideProps(context: any) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/signin",
      },
    };
  }

  if (!session.pea) {
    return {
      redirect: {
        destination: "/profile",
      },
    };
  }

  const mongoClient = await clientPromise;
  try {
    const planLVCollection: Collection<PlanLV> = mongoClient
      .db("patrol-LV")
      .collection("plan");
    let plan = await planLVCollection.findOne({
      _id: new ObjectId("655e09455f16d485454b0ce3"),
    });
    plan?._id instanceof ObjectId
      ? (plan._id = plan._id.toHexString())
      : undefined,
      console.log(plan);
    await mongoClient.close();
    return {
      props: { plan },
    };
  } catch (e) {
    await mongoClient.close();
    console.error(e);
    return {
      props: { planLV: [] },
    };
  }
}

export default function CustomizedAccordions({ plan }: { plan: PlanLV }) {
  console.log(plan);

  return <div></div>;
}
