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
    filter: treeData;
    setFilter: React.Dispatch<React.SetStateAction<treeData>>
    showTreeData: treeData[]
    chooseTreeData: treeData[]
    setChooseTreeData: React.Dispatch<React.SetStateAction<treeData[]>>

}

type SetPropsChooseTreeDataType = {
    chooseTreeData: treeData[]
    setChooseTreeData: React.Dispatch<React.SetStateAction<treeData[]>>
    sendTreeData: ()=>void
}

type FormChangePlanTree = {
  _id: ObjectId|string
  status?:"progress"|"success"|"reject";
  userReq?: peaUser
  dateReq?: string
  reason?:string
  typeReq?: "change"|"cancel"|"add"
  oldPlan?:{
    planName: string;
    qauntity:{
      plentifully?: number;
      moderate?: number;
      lightly?: number;
      clear?: number;
    }
    budget: number;
    systemVolt: "33kV"|"400/230V"|"115kV";
    month: string;
    hireType?: "normal"|"special"|"self";
  }
  newPlan?:{
    planName: string;
    qauntity?:{
      plentifully?: number;
      moderate?: number;
      lightly?: number;
      clear?: number;
    }
    budget: number;
    systemVolt: string;
    month: string;
    hireType?: string;
  }
}

