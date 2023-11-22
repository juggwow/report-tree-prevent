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
  
  
    try {
        const mongoClient = await clientPromise
        // `await clientPromise` will use the default database passed in the MONGODB_URI
        // However you can use another database (e.g. myDatabase) by replacing the `await clientPromise` with the following code:
        //
        // `const client = await clientPromise`
        // `const db = client.db("myDatabase")`
        //
        // Then you can execute queries against your database like so:
        // db.find({}) or any of the MongoDB Node Driver commands

        const planLVCollection = mongoClient.db("patrol-LV").collection("plan")
        const plan = await planLVCollection.find({businessArea: { $regex: /^L01/ },peaNo:{ $regex: /^60/ }},{ projection: { _id: 0 } }).toArray()
        //const plan2 = plan.map((val)=>{return {...val,_id:val._id.toString()}})
        console.log(plan)
    
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

  export default function PatrolLV({planLV}:{planLV:PlanLV[]}){
    console.log(planLV)
    return (
        <div>{planLV.map((val,i)=>{return(
            <div key={i}><span>{val.peaNo}</span><hr/></div>
        )})}</div>
        // <div></div>
        
    )
  }

  interface PlanLV {
    feeder?: string;
    peaNo: string;
    distanceCircuit?: any;
    businessName: string;
    businessArea: string;

  }

  interface PlanLVProps{
    planLV: PlanLV[]
  }