import clientPromise from "@/lib/mongodb";
import { WithId } from "mongodb";
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

    // console.log(session.pea.karnfaifa)
  
  
    try {
        const mongoClient = await clientPromise

        const planLVCollection = mongoClient.db("patrol-LV").collection("plan")
        const plan = await planLVCollection.find({businessArea: session.pea.karnfaifa},{ projection: { _id: 0 } }).toArray()
    
        return {
          props: { planLV: plan },
        }
      } catch (e) {
        console.error(e)
        return {
          props: { planLV: [] },
        }
      }
  }

  export default function ChangePlanPatrolLV({planLV}:{planLV:PlanLV[]}){
    console.log(planLV)
    return (
        <div>{planLV.map((val,i)=>{return(
            <div key={i}><span>{val.peaNo}</span><hr/></div>
        )})}</div>
    )
  }

  interface PlanLV {
    feeder?: string;
    peaNo: string;
    distanceCircuit?: any;
    businessName: string;
    businessArea: string;
  }