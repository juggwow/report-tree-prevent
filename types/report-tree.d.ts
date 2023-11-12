import { AlertColor } from "@mui/material";

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
  id: string;
  zpm4Name: string;
  month: string;
  karnfaifa: string;
  zpm4Po: string;
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
