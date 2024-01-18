import { AlertColor } from "@mui/material";
import { ObjectId } from "mongodb";
import { peaUser } from "./next-auth";

type Order = {
  no: string;
  disable: boolean;
};

type snackBar = {
  open: boolean;
  sevirity: AlertColor;
  massege: string;
};

type treeData = {
  id: string | ObjectId;
  zpm4Name: string;
  month: string;
  businessName: string;
  zpm4Po?: string;
  reportDate?: string;
  editDate?: string;
};

interface ReportTreeProps {
  treeData: treeData[];
}

type TreeDataFilter = treeData & {
  hasZPM4: boolean;
};

type SetPropsOrderNumberType = {
  order: Order;
  setOrder: React.Dispatch<React.SetStateAction<Order>>;
  setSnackBar: React.Dispatch<React.SetStateAction<snackBar>>;
  alignment: string;
  setAlignment: React.Dispatch<React.SetStateAction<string>>;
  showElementChoose: boolean;
  setShowElementChoose: React.Dispatch<React.SetStateAction<boolean>>;
  chooseTreeData: treeData[];
};

type SetPropsTreeDataTableType = {
  alignment: string;
  showElementChoose: boolean;
  order: Order;
  filter: TreeDataFilter;
  setFilter: React.Dispatch<React.SetStateAction<TreeDataFilter>>;
  showTreeData: treeData[];
  chooseTreeData: treeData[];
  setChooseTreeData: React.Dispatch<React.SetStateAction<treeData[]>>;
};

type SetPropsChooseTreeDataType = {
  chooseTreeData: treeData[];
  setChooseTreeData: React.Dispatch<React.SetStateAction<treeData[]>>;
  sendTreeData: () => void;
};

// type FormChangePlanTree = {
//   _id: ObjectId|string
//   status?:"progress"|"success"|"reject";
//   userReq?: peaUser
//   dateReq?: string
//   reason?:string
//   typeReq?: "change"|"cancel"|"add"
//   oldPlan?:{
//     planName: string;
//     qauntity?:{
//       plentifully?: number|string;
//       moderate?: number|string;
//       lightly?: number|string;
//       clear?: number|string;
//     }
//     budget: number|string;
//     systemVolt: "33kV"|"400/230V"|"115kV";
//     month: string;
//     hireType: string;
//   }
//   newPlan?:{
//     planName: string;
//     qauntity?:{
//       plentifully?: number|string;
//       moderate?: number|string;
//       lightly?: number|string;
//       clear?: number|string;
//     }
//     budget: number|string;
//     systemVolt: string;
//     month: string;
//     hireType: string;
//   }
// }

type FormChangePlanTree = {
  _id: ObjectId | string;
  status: "progress" | "success" | "reject";
  userReq?: peaUser;
  dateReq?: string;
  reason: string;
  typeReq: "change";
  oldPlan: {
    planName: string;
    budget: number | string;
    systemVolt: "33kV" | "400/230V" | "115kV";
    month: string;
  } & (SelfProceed | HireNormal | HireSpecial);
  newPlan: {
    planName: string;
    budget: number | string;
    systemVolt: string;
    month: string;
  } & (SelfProceed | HireNormal | HireSpecial);
};

type FormAddPlanTree = {
  _id: ObjectId | string;
  status: "progress" | "success" | "reject";
  userReq?: peaUser;
  dateReq?: string;
  reason: string;
  typeReq: "add";
  newPlan: {
    planName: string;
    budget: number | string;
    systemVolt: string;
    month: string;
  } & (SelfProceed | HireNormal | HireSpecial);
};

type FormCancelPlanTree = {
  _id: ObjectId | string;
  status: "progress" | "success" | "reject";
  userReq?: peaUser;
  dateReq?: string;
  reason: string;
  typeReq: "cancel";
  oldPlan: {
    planName: string;
    budget: number | string;
    systemVolt: "33kV" | "400/230V" | "115kV";
    month: string;
  } & (SelfProceed | HireNormal | HireSpecial);
};

type SelfProceed = {
  hireType: "self";
  quantity: {
    distance: number | string;
  };
};

type HireNormal = {
  hireType: "normal";
  quantity: {
    plentifully: number | string;
    moderate: number | string;
    lightly: number | string;
    clear: number | string;
  };
};

type HireSpecial = {
  hireType: "special";
  quantity: {
    discription: string;
  };
};

type MonthTotalBudget = {
  month: number;
  totalBudget: number;
};

type AdminChangePlanTree = (
  | FormChangePlanTree
  | FormAddPlanTree
  | FormCancelPlanTree
) & { businessName: string };
