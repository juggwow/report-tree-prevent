import { treeData, ReportTreeProps, Order } from "@/types/report-tree";
import OrderNumber from "@/components/report-tree/order-number";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import TreeDataTable from "@/components/report-tree/tree-data-table";
import ChooseTreeData from "@/components/report-tree/choose-tree-data";
import AlertSnackBar from "@/components/alert-snack-bar";
import { AlertSnackBarType } from "@/types/snack-bar";
import LoadingBackDrop from "@/components/loading-backdrop";
import clientPromise from "@/lib/mongodb";
import { ObjectId, WithId } from "mongodb";

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

    const query = {businessName: session.pea.karnfaifa}
    const options = {
      projection:{
        _id: 0,
        id: "$_id",
        businessName: 1,
        zpm4Name: "$planName",
        month: 1,
        zpm4Po: 1,
      }
    }

    const mongoClient = await clientPromise
    const treeData = (await mongoClient.db("tree").collection<treeData>("plan").find(query,options).toArray()) as unknown as treeData[]

    if (treeData) {
      treeData.forEach((val,i,arr)=>{
        arr[i].id = (val.id as ObjectId).toHexString()
      })
      return {
        props: { treeData },
      };
    }
    return {
      redirect: {
        destination: "/404",
      },
    };
  } catch {
    return {
      redirect: {
        destination: "/404",
      },
    };
  }
}

export default function ReportTree(props: ReportTreeProps) {
  const router = useRouter();

  const [filter, setFilter] = useState<treeData>({
    id: "",
    businessName: "",
    month: "",
    zpm4Name: "",
    zpm4Po: "",
  });

  const [progress, setProgress] = useState(false);

  const [snackBar, setSnackBar] = useState<AlertSnackBarType>({
    open: false,
    sevirity: "success",
    massege: "",
  });

  const [showElementChoose, setShowElementChoose] = useState(false);
  const [order, setOrder] = useState<Order>({
    no: "",
    disable: false,
  });
  const [alignment, setAlignment] = useState("po");
  const [showTreeData, setShowTreeData] = useState<treeData[]>(props.treeData);
  const [chooseTreeData, setChooseTreeData] = useState<treeData[]>([]);

  useEffect(() => {
    let filterData = props.treeData;
    let chooseID: string[] = [];

    chooseTreeData.forEach((val) => {
      chooseID.push(val.id as string);
    });

    filterData = filterData.filter((val) => {
      return !chooseID.includes(val.id as string);
    });

    if (filter.month != "") {
      filterData = filterData.filter((val) => {
        return val.month == filter.month;
      });
    }

    if (filter.zpm4Name != "") {
      filterData = filterData.filter((val) => {
        return val.zpm4Name.includes(filter.zpm4Name);
      });
    }

    setShowTreeData(filterData);
  }, [filter, chooseTreeData]);

  async function sendTreeData() {
    setProgress(true);
    try {
      const res = await fetch("/api/tree/report-zpm4po", {
        method: "POST",
        body: JSON.stringify(chooseTreeData),
      });
      if (res.status == 200) {
        const data = await res.json()
        setSnackBar({
          open: true,
          sevirity: "success",
          massege: data.massege,
        });
        router.refresh();
      } else {
        setProgress(false);
        setSnackBar({
          open: true,
          sevirity: "error",
          massege: "เกิดข้อผิดพลาดบางอย่าง กรุณาลองอีกครั้ง",
        });
      }
    } catch {
      setProgress(false);
      setSnackBar({
        open: true,
        sevirity: "error",
        massege: "เกิดข้อผิดพลาดบางอย่าง กรุณาลองอีกครั้ง",
      });
    }
  }

  return (
    <div className="flex flex-col p-4 min-h-screen ">
      <p className="m-3">รายผลการดำเนินงานตัดต้นไม้</p>
      <OrderNumber
        order={order}
        setOrder={setOrder}
        setSnackBar={setSnackBar}
        alignment={alignment}
        setAlignment={setAlignment}
        showElementChoose={showElementChoose}
        setShowElementChoose={setShowElementChoose}
        chooseTreeData={chooseTreeData}
      />
      <TreeDataTable
        alignment={alignment}
        showElementChoose={showElementChoose}
        order={order}
        filter={filter}
        setFilter={setFilter}
        setChooseTreeData={setChooseTreeData}
        showTreeData={showTreeData}
        chooseTreeData={chooseTreeData}
      />
      <ChooseTreeData
        sendTreeData={sendTreeData}
        chooseTreeData={chooseTreeData}
        setChooseTreeData={setChooseTreeData}
      />
      <div className="flex flex-row justify-center">
        <Button
          variant="outlined"
          className="mt-3 w-40"
          onClick={() => {
            setProgress(true);
            if (order.no != "") {
              return window.confirm(
                "คุณได้ใส่ข้อมูลไปบางส่วนหรือทั้งหมดแล้ว คุณแน่ใจว่าจะออกจากหน้านี้?",
              )
                ? router.push("/")
                : setProgress(false);
            }
            router.push("/");
          }}
        >
          กลับสู่หน้าหลัก
        </Button>
      </div>
      <AlertSnackBar snackBar={snackBar} setSnackBar={setSnackBar} />
      <LoadingBackDrop progress={progress} setProgress={setProgress} />
    </div>
  );
}
