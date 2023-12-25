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

type SetPropsOrderNumberType = {
    order: Order;
    setOrder: React.Dispatch<React.SetStateAction<Order>>;
    setSnackBar: React.Dispatch<React.SetStateAction<snackBar>>;
    showElementChoose: boolean;
    setShowElementChoose: React.Dispatch<React.SetStateAction<boolean>>;
    choosePreventData: PreventData[];
  };

type PreventData = {
    id : ObjectId | string;
    businessName : string;
    planName : string;
    duration: string;
    zpm4?: string
    reportDate?: string;
    editDate?: string;
}

type PreventDataFilter = PreventData & {
  hasZPM4: boolean
}

type SetPropsPreventDataTableType = {
  showElementChoose: boolean;
  order: Order;
  filter: PreventDataFilter;
  setFilter: React.Dispatch<React.SetStateAction<PreventDataFilter>>
  showPreventData: PreventData[]
  choosePreventData: PreventData[]
  setChoosePreventData: React.Dispatch<React.SetStateAction<PreventData[]>>
}

type SetPropsChoosePreventDataType = {
  choosePreventData: PreventData[]
  setChoosePreventData: React.Dispatch<React.SetStateAction<PreventData[]>>
  sendPreventData: ()=>void
}