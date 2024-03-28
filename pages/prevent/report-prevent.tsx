import AlertSnackBar from "@/components/alert-snack-bar";
import PreventDataTable from "@/components/prevent/report-prevent/prevent-data-table";
import ZPM4Number from "@/components/prevent/report-prevent/zpm4-number";
import clientPromise from "@/lib/mongodb";
import { Order, PreventDataFilter, snackBar } from "@/types/report-prevent";
import { ObjectId } from "mongodb";
import { getSession } from "next-auth/react";
import Link from "@mui/material/Link";
import React, { useEffect, useState } from "react";
import { PreventData } from "@/types/report-prevent";
import ChoosePreventData from "@/components/prevent/report-prevent/choose-prevent-data";
import { useRouter } from "next/navigation";
import LoadingBackDrop from "@/components/loading-backdrop";
import { Typography, Stack, Breadcrumbs, Button } from "@mui/material";
import ControlledOpenSpeedDial from "@/components/speed-dial";

export async function getServerSideProps(context: any) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/signin?link=/prevent/report-prevent",
      },
    };
  }

  if (!session.pea) {
    return {
      redirect: {
        destination: "/profile?link=/prevent/report-prevent",
      },
    };
  }

  const mongoClient = await clientPromise;
  await mongoClient.connect();

  try {
    const query = {
      businessName: session.pea.karnfaifa,
      planName: {
        $ne: null,
        $exists: true,
      },
    };
    const options = {
      projection: {
        _id: 0,
        id: "$_id",
        businessName: 1,
        planName: 1,
        duration: 1,
        zpm4: 1,
        reportDate: 1,
        editDate: 1,
      },
    };

    const preventData = (await mongoClient
      .db("prevent")
      .collection("showPlan")
      .find(query, options)
      .toArray()) as unknown as PreventData[];

    if (!preventData) {
      return {
        redirect: {
          destination: "/404",
        },
      };
    }

    preventData.forEach((val, i, arr) => {
      arr[i].id = (val.id as ObjectId).toHexString();
    });
    await mongoClient.close();
    return {
      props: { preventData },
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

export default function ReportPrevent({
  preventData,
}: {
  preventData: PreventData[];
}) {
  const router = useRouter();
  const [order, setOrder] = useState<Order>({
    no: "",
    disable: false,
  });

  const [snackBar, setSnackBar] = useState<snackBar>({
    open: false,
    sevirity: "success",
    massege: "",
  });

  const [choosePreventData, setChoosePreventData] = useState<PreventData[]>([]);
  const [showElementChoose, setShowElementChoose] = useState<boolean>(false);
  const [filter, setFilter] = useState<PreventDataFilter>({
    id: "",
    businessName: "",
    planName: "",
    duration: "",
    hasZPM4: true,
  });
  const [showPreventData, setShowPreventData] =
    useState<PreventData[]>(preventData);
  const [progress, setProgress] = useState<boolean>(false);

  useEffect(() => {
    let filterData = preventData;
    let chooseID: string[] = [];

    choosePreventData.forEach((val) => {
      chooseID.push(val.id as string);
    });

    filterData = filterData.filter((val) => {
      return !chooseID.includes(val.id as string);
    });

    if (filter.duration != "") {
      filterData = filterData.filter((val) => {
        return val.duration == filter.duration;
      });
    }

    if (filter.planName != "") {
      filterData = filterData.filter((val) => {
        return val.planName.includes(filter.planName);
      });
    }

    if (!filter.hasZPM4) {
      filterData = filterData.filter((val) => {
        return !val.zpm4;
      });
    }

    setShowPreventData(filterData);
  }, [filter, choosePreventData]);

  async function sendPreventData() {
    setProgress(true);
    try {
      const res = await fetch("/api/prevent/report-zpm4", {
        method: "POST",
        body: JSON.stringify(choosePreventData),
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
      <div className="flex flex-row" id="main-content">
        <Link
          href="/prevent/report-prevent"
          sx={{ fontSize: "12px", padding: "0 0.25rem" }}
        >
          รายงานผล
        </Link>
        <Link
          href="/prevent/change-plan"
          sx={{ fontSize: "12px", padding: "0 0.25rem" }}
        >
          ขอเปลี่ยนแผน
        </Link>
        <Link
          href="/prevent/change-plan-req-list"
          sx={{ fontSize: "12px", padding: "0 0.25rem" }}
        >
          รายการเปลี่ยนแผน
        </Link>
      </div>

      <div className="flex  flex-col p-4 min-h-screen">
        <p className="m-3">รายผลการดำเนินงานกิจกรรมป้องกันระบบไฟฟ้า</p>
        <CustomSeparator setProgress={setProgress} />
        <ZPM4Number
          order={order}
          setOrder={setOrder}
          setSnackBar={setSnackBar}
          showElementChoose={showElementChoose}
          setShowElementChoose={setShowElementChoose}
          choosePreventData={choosePreventData}
        />
        <PreventDataTable
          showElementChoose={showElementChoose}
          order={order}
          filter={filter}
          setFilter={setFilter}
          showPreventData={showPreventData}
          choosePreventData={choosePreventData}
          setChoosePreventData={setChoosePreventData}
        />
        <ChoosePreventData
          choosePreventData={choosePreventData}
          setChoosePreventData={setChoosePreventData}
          sendPreventData={sendPreventData}
        />
        <div className="flex flex-row justify-center">
          <Button
            variant="outlined"
            className="mt-3 w-40"
            onClick={() => {
              setProgress(true);
              router.push("/");
            }}
          >
            กลับสู่หน้าหลัก
          </Button>
        </div>
        <AlertSnackBar setSnackBar={setSnackBar} snackBar={snackBar} />
        <LoadingBackDrop progress={progress} setProgress={setProgress} />
        <ControlledOpenSpeedDial userManual="https://drive.google.com/uc?export=view&id=1rADY5rhu-iwGyu3auHPEv5LErCE5V_Cj" />
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
      ป้องกันระบบไฟฟ้า
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
