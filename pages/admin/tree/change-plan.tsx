import AlertSnackBar from "@/components/alert-snack-bar";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertSnackBarType } from "@/types/snack-bar";
import {
  AdminChangePlanTree,
  FormAddPlanTree,
  FormCancelPlanTree,
  FormChangePlanTree,
} from "@/types/report-tree";
import ChangePlanTreeCard from "@/components/tree/change-plan/change-plan-tree-req-card";
import { useRouter } from "next/router";
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
import LoadingBackDrop from "@/components/loading-backdrop";

export async function getServerSideProps(context: any) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/signin?link=/admin/tree/change-plan",
      },
    };
  }

  if (!session.pea) {
    return {
      redirect: {
        destination: "/profile?link=/admin/tree/change-plan",
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

  try {
    const mongoClient = await clientPromise;

    const planTreeCollection = mongoClient.db("tree").collection("plan");

    let docs = (await mongoClient
      .db("tree")
      .collection("typeRequest")
      .find()
      .toArray()) as AdminChangePlanTree[];

    let changePlanTreeReq: AdminChangePlanTree[] = [];
    docs.forEach((val) => {
      changePlanTreeReq.push({
        ...val,
        _id: val._id instanceof ObjectId ? val._id.toHexString() : val._id,
      });
    });

    return {
      props: { changePlanTreeReq },
    };
  } catch (e) {
    console.error(e);
    return {
      props: { changePlanTreeReq: [] },
    };
  }
}

export default function ChangePlanReqList({
  changePlanTreeReq,
}: {
  changePlanTreeReq: AdminChangePlanTree[];
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

  const handleApprove = async (e: any) => {
    e.preventDefault();
    // const res = await fetch("/api/tree/request-change-plan", {
    //   method: "PUT",
    //   body: JSON.stringify(changePlanRequire),
    // });
    // if (res.status != 200) {
    //   setSnackBar({ sevirity: "error", massege: "เกิดข้อผิดพลาด", open: true });
    //   return;
    // }
    setSnackBar({ sevirity: "success", massege: "สำเร็จ", open: true });
    setOpenDialog(false);
    router.reload();
  };

  const handleReject = async (
    changePlanRequire:
      | FormChangePlanTree
      | FormAddPlanTree
      | FormCancelPlanTree,
  ) => {
    {
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

  const handlePrint = async () => {
    setProgress(true);
    const res = await fetch("/api/tree/summary-budget");
    if (res.status == 200) {
      setSnackBar({
        massege: "สำเร็จ",
        sevirity: "success",
        open: true,
      });
      window.open(
        "https://docs.google.com/spreadsheets/d/1r6xiCX-mSE0FzVb1iLwVdqoWMggjzSddrGdYky4AC1A/export?format=xlsx",
      );
    } else {
      setSnackBar({
        massege: "Error " + res.status,
        sevirity: "error",
        open: true,
      });
    }
    setProgress(false);
  };

  const businessNameOptions: string[] = useMemo(() => {
    let autoComplete: string[] = [];
    changePlanTreeReq.forEach((val) => {
      autoComplete.push(val.businessName);
    });
    autoComplete = autoComplete.filter((val, i, arr) => {
      return arr.indexOf(val) === i;
    });
    return autoComplete;
  }, [changePlanTreeReq]);

  const [businessName, setBusinessName] = useState(
    businessNameOptions.length > 0 ? businessNameOptions[0] : "",
  );

  const {
    changeType,
    addType,
    cancelType,
  }: {
    changeType: (FormChangePlanTree & { businessName: string })[];
    addType: (FormAddPlanTree & { businessName: string })[];
    cancelType: (FormCancelPlanTree & { businessName: string })[];
  } = useMemo(() => {
    let changeType: (FormChangePlanTree & { businessName: string })[] = [];
    let addType: (FormAddPlanTree & { businessName: string })[] = [];
    let cancelType: (FormCancelPlanTree & { businessName: string })[] = [];
    changePlanTreeReq.forEach((val) => {
      if (val.typeReq == "add" && val.businessName == businessName) {
        addType.push(val);
      }

      if (val.typeReq == "change" && val.businessName == businessName) {
        changeType.push(val);
      }

      if (val.typeReq == "cancel" && val.businessName == businessName) {
        cancelType.push(val);
      }
    });
    return { changeType, addType, cancelType };
  }, [changePlanTreeReq, businessName]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div>
      <div className="flex flex-row" id="main-content">
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
      <div className="h-full">
        <div id="main-content" className="p-0 m-0">
          <p className="m-3">
            รายการขอเปลี่ยนแปลง / เพิ่ม / ยกเลิกแผนงานตัดต้นไม้
          </p>
          <CustomSeparator setProgress={setProgress} />
          <Box className="mx-auto w-11/12 mb-3 bg-white grid grid-cols-1 relative">
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
                  renderInput={(params) => (
                    <TextField {...params} required label="กฟฟ." />
                  )}
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
                      <ChangePlanTreeCard
                        plan={val}
                        onClickEdit={() => {}}
                        onClickCancel={() => {}}
                        isAdmin
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
                      <ChangePlanTreeCard
                        plan={val}
                        onClickEdit={() => {}}
                        onClickCancel={() => {}}
                        isAdmin
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
                      <ChangePlanTreeCard
                        plan={val}
                        onClickEdit={() => {}}
                        onClickCancel={() => {}}
                        isAdmin
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
    </div>
  );
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

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
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
