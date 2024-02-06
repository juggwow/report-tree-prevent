import {
  treeData,
  ReportTreeProps,
  Order,
  TreeDataFilter,
} from "@/types/report-tree";
import OrderNumber from "@/components/tree/report-tree/order-number";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Breadcrumbs, Button, Link, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import TreeDataTable from "@/components/tree/report-tree/tree-data-table";
import ChooseTreeData from "@/components/tree/report-tree/choose-tree-data";
import AlertSnackBar from "@/components/alert-snack-bar";
import { AlertSnackBarType } from "@/types/snack-bar";
import LoadingBackDrop from "@/components/loading-backdrop";
import clientPromise from "@/lib/mongodb";
import { ObjectId, WithId } from "mongodb";
import ControlledOpenSpeedDial from "@/components/speed-dial";

export async function getServerSideProps(context: any) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/signin?link=/tree/report-tree",
      },
    };
  }

  if (!session.pea) {
    return {
      redirect: {
        destination: "/profile?link=/tree/report-tree",
      },
    };
  }

  const mongoClient = await clientPromise;
  try {
    const query = {
      businessName: session.pea.karnfaifa,
      changePlanRequest: {
        $not: {
          $elemMatch: {
            status: "progress",
          },
        },
      },
    };
    const options = {
      projection: {
        _id: 0,
        id: "$_id",
        businessName: 1,
        zpm4Name: "$planName",
        month: 1,
        zpm4Po: 1,
      },
    };

    const treeData = (await mongoClient
      .db("tree")
      .collection<treeData>("plan")
      .find(query, options)
      .toArray()) as unknown as treeData[];

    if (treeData) {
      treeData.forEach((val, i, arr) => {
        arr[i].id = (val.id as ObjectId).toHexString();
      });
      await mongoClient.close();
      return {
        props: { treeData },
      };
    }
    await mongoClient.close();
    return {
      redirect: {
        destination: "/404",
      },
    };
  } catch {
    await mongoClient.close();
    return {
      redirect: {
        destination: "/404",
      },
    };
  }
}

export default function ReportTree(props: ReportTreeProps) {
  const router = useRouter();

  const [filter, setFilter] = useState<TreeDataFilter>({
    id: "",
    businessName: "",
    month: "",
    zpm4Name: "",
    zpm4Po: "",
    hasZPM4: true,
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

    if (!filter.hasZPM4) {
      filterData = filterData.filter((val) => {
        return !val.zpm4Po;
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
        const data = await res.json();
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
    <div>
      <div className="flex flex-row">
        <Link
          href="/tree/report-tree"
          sx={{ fontSize: "12px", padding: "0 0.25rem" }}
        >
          รายงานผล
        </Link>
        <Link
          href="/tree/change-plan"
          sx={{ fontSize: "12px", padding: "0 0.25rem" }}
        >
          ขอเปลี่ยนแผน
        </Link>
        <Link
          href="/tree/change-plan-req-list"
          sx={{ fontSize: "12px", padding: "0 0.25rem" }}
        >
          รายการเปลี่ยนแผน
        </Link>
      </div>
      <div className="flex flex-col p-4 min-h-screen ">
        <p className="m-3">รายผลการดำเนินงานตัดต้นไม้</p>
        <CustomSeparator setProgress={setProgress} />
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
        <div className="mt-3 flex flex-row justify-center">
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
        <ControlledOpenSpeedDial userManual="https://drive.google.com/uc?export=view&id=1k-3M8-rSzgkO8bIG0JF4WVRAGhzP9fuk" />
      </div>
    </div>
  );
}

function CustomSeparator({
  setProgress,
}: {
  setProgress: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const breadcrumbs = [
    <Link
      sx={{ fontSize: "12px" }}
      underline="hover"
      key="1"
      color="inherit"
      href="/"
      onClick={() => setProgress(true)}
    >
      หน้าหลัก
    </Link>,
    <Typography sx={{ fontSize: "12px" }} key="2" color="text.primary">
      ต้นไม้
    </Typography>,
    <Typography sx={{ fontSize: "12px" }} key="3" color="text.primary">
      รายงานผล
    </Typography>,
  ];

  return (
    <Stack sx={{ margin: "0 0 1rem 1rem" }} spacing={2}>
      <Breadcrumbs separator="›" aria-label="breadcrumb">
        {breadcrumbs}
      </Breadcrumbs>
    </Stack>
  );
}
