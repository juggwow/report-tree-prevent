import { ObjectId } from "mongodb";

type PlanLV = {
    _id: string | ObjectId;
    feeder?: string;
    peaNo: string;
    distanceCircuit?: any;
    businessName: string;
    businessArea: string;
  }
  
  type ChangePlanLV = {
    plan_id: string;
    oldPlan: {
      feeder: string;
      peaNo: string;
      distanceCircuit: any;
    };
    newPlan: {
      feeder: string;
      peaNo: string;
      distanceCircuit: any;
    };
    reason:string
  }