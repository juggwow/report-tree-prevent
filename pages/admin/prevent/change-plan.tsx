import AlertSnackBar from "@/components/alert-snack-bar";
import LoadingBackDrop from "@/components/loading-backdrop";
import ChangePlanPreventCard from "@/components/prevent/change-plan/change-plan-prevent-req-card";
import clientPromise from "@/lib/mongodb";
import {
  AdminChangePlanWithStatus,
  ChangePlanWithStatus,
  FormAddPlanPreventWithStatus,
  FormCancelPlanPreventWithStatus,
  FormChangePlanPrevent,
  FormChangePlanPreventWithStatus,
} from "@/types/report-prevent";
import { AlertSnackBarType } from "@/types/snack-bar";
import {
  Autocomplete,
  Box,
  Breadcrumbs,
  Button,
  Grid,
  Link,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { ObjectId } from "mongodb";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

export async function getServerSideProps(contex: any) {
  const session = await getSession(contex);

  if (!session) {
    return {
      redirect: {
        destination: "/signin?link=/admin/prevent/change-plan",
      },
    };
  }

  if (!session.pea) {
    return {
      redirect: {
        destination: "/profile?link=/admin/prevent/change-plan",
      },
    };
  }

  if (session.pea.role != "admin") {
    return {
      redirect: {
        destination: "/404",
      },
    };
  }

  const mongoClient = await clientPromise;
  await mongoClient.connect()
  try {
    const planPreventCollection = mongoClient
      .db("prevent")
      .collection("changePlanRequest");

    const docs = (await planPreventCollection
      .find({ businessName: { $ne: "กฟฟ.ทดสอบ" } })
      .toArray()) as unknown as AdminChangePlanWithStatus[];
    let changePlanPreventReq: AdminChangePlanWithStatus[] = [];
    docs.forEach((val) => {
      changePlanPreventReq.push({
        ...val,
        _id: val._id instanceof ObjectId ? val._id.toHexString() : val._id,
      });
    });

    await mongoClient.close()
    return {
      props: { changePlanPreventReq },
    };
  } catch (e) {
    console.log(e);
    await mongoClient.close()
    return {
      props: { changePlanPreventReq: [] },
    };
  }
}

export default function PreventChangePlanReqList({
  changePlanPreventReq,
}: {
  changePlanPreventReq: AdminChangePlanWithStatus[];
}) {
  const stickyRef = useRef<HTMLDivElement>();
  const router = useRouter();
  const [isSticky, setIsSticky] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [progress, setProgress] = useState(false);
  const [tab, setTab] = useState(0);
  const [snackBar, setSnackBar] = useState<AlertSnackBarType>({
    open: false,
    sevirity: "success",
    massege: "",
  });
  const [deleteId, setDeleteId] = useState<string[]>([]);

  const handlePrint = async () => {
    const res = await fetch("/api/prevent/admin");
    if (res.status != 200) {
      setSnackBar({
        massege: "เกิดข้อผิดพลาด",
        sevirity: "error",
        open: true,
      });
    }
    setSnackBar({
      massege: "สำเร็จ",
      sevirity: "success",
      open: true,
    });
    window.open(
      "https://docs.google.com/spreadsheets/d/1uYdrj-e46AC1LfySds1dU4lokDJL7y0b92rEUgRmcm8/",
    );
  };

  const handleApprove = async (val: AdminChangePlanWithStatus) => {
    let message = "ต้องการ ";
    switch (val.typeReq) {
      case "add":
        message =
          message +
          '"อนุมัติ" การการเพิ่มแผนงาน ' +
          val.newPlan.planName +
          " ?";
        break;
      case "cancel":
        message =
          message +
          '"อนุมัติ" การการยกเลิกแผนงาน ' +
          val.oldPlan.planName +
          " ?";
        break;
      case "change":
        message =
          message +
          '"อนุมัติ" การเปลี่ยนแผนงานเดิม ' +
          val.newPlan.planName +
          " ?";
    }
    if (!window.confirm(message)) {
      return;
    }
    const res = await fetch("/api/prevent/admin", {
      method: "PATCH",
      body: JSON.stringify({
        ...val,
        status: "success",
      }),
    });
    if (res.status != 200) {
      setSnackBar({
        massege: "เกิดข้อผิดพลาด ลองถามพี่แป๊ะดู",
        sevirity: "error",
        open: true,
      });
    }
    setSnackBar({
      massege: "สำเร็จ",
      sevirity: "success",
      open: true,
    });
    setDeleteId([...deleteId, val._id as string]);
  };

  const handleReject = async (val: AdminChangePlanWithStatus) => {
    {
      let message = "ต้องการ ";
      switch (val.typeReq) {
        case "add":
          message =
            message + '"ปฏิเสธ" การเพิ่มแผนงาน ' + val.newPlan.planName + " ?";
          break;
        case "cancel":
          message =
            message + '"ปฏิเสธ" การยกเลิกแผนงาน ' + val.oldPlan.planName + " ?";
          break;
        case "change":
          message =
            message +
            '"ปฏิเสธ" การเปลี่ยนแผนงานเดิม ' +
            val.newPlan.planName +
            " ?";
      }
      if (!window.confirm(message)) {
        return;
      }
      const res = await fetch("/api/prevent/admin", {
        method: "PUT",
        body: JSON.stringify({
          ...val,
          status: "reject",
        }),
      });
      if (res.status != 200) {
        setSnackBar({
          massege: "เกิดข้อผิดพลาด ลองถามพี่แป๊ะดู",
          sevirity: "error",
          open: true,
        });
      }
      setSnackBar({
        massege: "สำเร็จ",
        sevirity: "success",
        open: true,
      });
      setDeleteId([...deleteId, val._id as string]);
    }
  };

  const handleScroll = () => {
    // ตรวจสอบว่า scroll position มีค่ามากกว่าความสูงของ header หรือไม่
    setIsSticky(
      stickyRef && stickyRef.current
        ? window.scrollY > stickyRef.current.offsetHeight + 50
        : false,
    );
  };

  const businessNameOptions: string[] = useMemo(() => {
    let autoComplete: string[] = [];
    changePlanPreventReq.forEach((val) => {
      autoComplete.push(val.businessName);
    });
    autoComplete = autoComplete.filter((val, i, arr) => {
      return arr.indexOf(val) === i;
    });
    return autoComplete;
  }, [changePlanPreventReq]);

  const [businessName, setBusinessName] = useState(
    businessNameOptions.length > 0 ? businessNameOptions[0] : "",
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const {
    changeType,
    addType,
    cancelType,
  }: {
    changeType: (FormChangePlanPreventWithStatus & { businessName: string })[];
    addType: (FormAddPlanPreventWithStatus & { businessName: string })[];
    cancelType: (FormCancelPlanPreventWithStatus & { businessName: string })[];
  } = useMemo(() => {
    let changeType: (FormChangePlanPreventWithStatus & {
      businessName: string;
    })[] = [];
    let addType: (FormAddPlanPreventWithStatus & { businessName: string })[] =
      [];
    let cancelType: (FormCancelPlanPreventWithStatus & {
      businessName: string;
    })[] = [];
    changePlanPreventReq.forEach((val) => {
      if (!deleteId.includes(val._id as string)) {
        if (val.typeReq == "add" && val.businessName == businessName) {
          addType.push(val);
        }

        if (val.typeReq == "change" && val.businessName == businessName) {
          changeType.push(val);
        }

        if (val.typeReq == "cancel" && val.businessName == businessName) {
          cancelType.push(val);
        }
      }
    });
    return { changeType, addType, cancelType };
  }, [changePlanPreventReq, deleteId, businessName]);

  return (
    <div>
      <div className="flex flex-row" id="main-content">
        <Link
          href="/admin/tree/change-plan"
          sx={{ fontSize: "12px", padding: "0 0.25rem" }}
        >
          ต้นไม้
        </Link>
        <Link
          href="/admin/prevent/change-plan"
          sx={{ fontSize: "12px", padding: "0 0.25rem" }}
        >
          ป้องกัน
        </Link>
      </div>
      <div className="h-full" id="main-content">
        <div className="p-0 m-0">
          <div className="m-3">
            รายการขอเปลี่ยนแปลง / เพิ่ม / ยกเลิกแผนงานป้องกัน
          </div>
        </div>
        <CustomSeparator setProgress={setProgress} />
        <Box className="mx-auto w-11/12 mb-3 bg-white grid grid-cols-1">
          <Box
            ref={stickyRef}
            className={`${isSticky ? "sticky" : ""}`}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <Tabs
              value={tab}
              onChange={(e, v) => setTab(v)}
              aria-label="basic tabs example"
              sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
            >
              <Tab label="เปลี่ยนแปลง" {...a11yProps(0)} />
              <Tab label="เพิ่ม" {...a11yProps(1)} />
              <Tab label="ยกเลิก" {...a11yProps(2)} />
            </Tabs>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignContent: "center",
                gap: "1rem",
              }}
            >
              <Autocomplete
                size="small"
                disablePortal
                value={businessName}
                id="combo-box-demo"
                options={businessNameOptions}
                sx={{ margin: "0.5rem 0 0 0", width: "200px" }}
                renderInput={(params) => <TextField {...params} label="กฟฟ." />}
                onChange={(e, v) => setBusinessName(v ? v : "")}
              />
              <Button onClick={handlePrint}>โหลดเอกสารแนบ</Button>
            </Box>
          </Box>
          <TabPanel value={tab} index={0}>
            <Grid container spacing={1}>
              {changeType.map((val) => {
                return (
                  <Grid item key={val._id as string} xs={12} sm={6} md={4}>
                    <ChangePlanPreventCard
                      isAdmin
                      plan={val}
                      onClickEdit={() => handleApprove(val)}
                      onClickCancel={() => handleReject(val)}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </TabPanel>
          <TabPanel value={tab} index={1}>
            <Grid container spacing={1}>
              {addType.map((val) => {
                return (
                  <Grid item key={val._id as string} xs={12} sm={6} md={4}>
                    <ChangePlanPreventCard
                      isAdmin
                      plan={val}
                      onClickEdit={() => handleApprove(val)}
                      onClickCancel={() => handleReject(val)}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </TabPanel>
          <TabPanel value={tab} index={2}>
            <Grid container spacing={1}>
              {cancelType.map((val) => {
                return (
                  <Grid item key={val._id as string} xs={12} sm={6} md={4}>
                    <ChangePlanPreventCard
                      isAdmin
                      plan={val}
                      onClickEdit={() => handleApprove(val)}
                      onClickCancel={() => handleReject(val)}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </TabPanel>
        </Box>
        <div className="mt-3 flex flew-row justify-center">
          <Button
            sx={{ margin: "1rem auto" }}
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
      </div>
      <AlertSnackBar setSnackBar={setSnackBar} snackBar={snackBar} />
      <LoadingBackDrop progress={progress} setProgress={setProgress} />
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
      ป้องกัน
    </Typography>,
    <Typography sx={{ fontSize: "12px" }} key="3" color="text.primary">
      รายการขอเปลี่ยนแปลง / เพิ่ม / ยกเลิกแผนงาน
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

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </Box>
  );
}
