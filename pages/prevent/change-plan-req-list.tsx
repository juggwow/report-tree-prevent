import AlertSnackBar from "@/components/alert-snack-bar";
import LoadingBackDrop from "@/components/loading-backdrop";
import ChangePlanPreventCard from "@/components/prevent/change-plan/change-plan-prevent-req-card";
import ChangePlanPreventFormDialog from "@/components/prevent/change-plan/form-dialog";
import PrintChangePlanPrevent from "@/components/prevent/change-plan/print-change-plan-prevent";
import ChangePlanTreeCard from "@/components/tree/change-plan/change-plan-tree-req-card";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOffIcon from "@mui/icons-material/FolderOff";
import clientPromise from "@/lib/mongodb";
import {
  ChangePlanRequirePrevent,
  ChangePlanWithStatus,
  FormAddPlanPrevent,
  FormAddPlanPreventWithStatus,
  FormCancelPlanPrevent,
  FormCancelPlanPreventWithStatus,
  FormChangePlanPrevent,
  FormChangePlanPreventWithStatus,
  IdsHasSentPlanPreventRequest,
  TotalBudgetEachTypePrevent,
} from "@/types/report-prevent";
import { AlertSnackBarType } from "@/types/snack-bar";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Grid,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { ObjectId } from "mongodb";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useRef, useState } from "react";

export async function getServerSideProps(contex: any) {
  const session = await getSession(contex);

  if (!session) {
    return {
      redirect: {
        destination: "/signin?link=/prevent/change-plan-req-list",
      },
    };
  }

  if (!session.pea) {
    return {
      redirect: {
        destination: "/profile?link=/prevent/change-plan-req-list",
      },
    };
  }

  const mongoClient = await clientPromise;
  await mongoClient.connect();
  try {
    const planPreventCollection = mongoClient.db("prevent").collection("plan");
    let cursor = planPreventCollection.aggregate([
      {
        $match: {
          businessName: session.pea.karnfaifa,
        },
      },
      {
        $unwind: {
          path: "$changePlanRequest",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "changePlanRequest.typeReq": { $in: ["change", "add", "cancel"] },
          "changePlanRequest.status": "progress",
          "changePlanRequest.sendId": { $exists: false },
          "changePlanRequest.userReq.userid": session.pea.userid,
        },
      },
      {
        $project: {
          _id: 1,
          status: "$changePlanRequest.status",
          userReq: "$changePlanRequest.userReq",
          reason: "$changePlanRequest.reason",
          oldPlan: "$changePlanRequest.oldPlan",
          newPlan: "$changePlanRequest.newPlan",
          typeReq: "$changePlanRequest.typeReq",
          dateReq: "$changePlanRequest.dateReq",
        },
      },
    ]);
    const docs = (await cursor.toArray()) as unknown as ChangePlanWithStatus[];
    let changePlanPreventReq: ChangePlanWithStatus[] = [];
    docs.forEach((val) => {
      changePlanPreventReq.push({
        ...val,
        _id: val._id instanceof ObjectId ? val._id.toHexString() : val._id,
      });
    });

    cursor = planPreventCollection.aggregate([
      {
        $match: {
          businessName: session.pea.karnfaifa,
          planName: {
            $exists: true,
          },
        },
      },
      {
        $group: {
          _id: "$typePrevent",
          totalBudget: { $sum: "$budget" },
        },
      },
    ]);

    const budgets = await cursor.toArray();

    let idsHasSentPlanPreventRequest = (await mongoClient
      .db("prevent")
      .collection("idsHaveSentRequest")
      .find({
        businessName: session.pea.karnfaifa,
        _id: { $exists: true },
        userId: session.pea.userid,
      })
      .toArray()) as unknown as IdsHasSentPlanPreventRequest[];
    idsHasSentPlanPreventRequest.forEach((val, i) => {
      if (val._id instanceof ObjectId) {
        idsHasSentPlanPreventRequest[i]._id = val._id.toHexString();
      }
      val.changePlanRequest.forEach((v, j) => {
        if (v._id instanceof ObjectId) {
          idsHasSentPlanPreventRequest[i].changePlanRequest[j]._id =
            v._id.toHexString();
        }
      });
    });
    await mongoClient.close();
    return {
      props: { changePlanPreventReq, budgets, idsHasSentPlanPreventRequest },
    };
  } catch (e) {
    console.log(e);
    await mongoClient.close();
    return {
      props: {
        changePlanPreventReq: [],
        budgets: [],
        idsHasSentPlanPreventRequest: [],
      },
    };
  }
}

export default function PreventChangePlanReqList({
  changePlanPreventReq,
  budgets,
  idsHasSentPlanPreventRequest,
}: {
  changePlanPreventReq: ChangePlanWithStatus[];
  budgets: TotalBudgetEachTypePrevent[];
  idsHasSentPlanPreventRequest: IdsHasSentPlanPreventRequest[];
}) {
  const stickyRef = useRef<HTMLDivElement>();
  const router = useRouter();
  const [isSticky, setIsSticky] = useState(false);
  const [print, setPrint] = useState<ChangePlanWithStatus[]>([]);
  const [version, setVersion] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [progress, setProgress] = useState(false);
  const [tab, setTab] = useState(0);
  const [snackBar, setSnackBar] = useState<AlertSnackBarType>({
    open: false,
    sevirity: "success",
    massege: "",
  });
  const [changePlanRequire, setChangePlanRequire] =
    useState<ChangePlanRequirePrevent>({
      reason: "",
      typeReq: "add",
      newPlan: {
        planName: "",
        budget: "",
        duration: "",
        typePrevent: "",
        breifQuantity: "",
      },
      _id: "",
    });

  const handlePrint = (plan: ChangePlanWithStatus[], ver: string) => {
    setPrint(plan);
    setVersion(ver);
    setTimeout(() => window.print(), 100);
  };

  const handleEdit = (val: ChangePlanWithStatus) => {
    setChangePlanRequire(val);
    setOpenDialog(true);
  };

  const handleCancelRequest = async (ids: IdsHasSentPlanPreventRequest) => {
    const res = await fetch("/api/prevent/send-request", {
      method: "PUT",
      body: JSON.stringify(ids),
    });
    if (res.status != 200) {
      setSnackBar({
        massege: "เกิดข้อผิดพลาด",
        sevirity: "error",
        open: true,
      });
      return;
    }
    setSnackBar({
      massege: "สำเร็จ",
      sevirity: "success",
      open: true,
    }),
      router.reload();
  };

  const handleCancel = async (val: ChangePlanWithStatus) => {
    const res = await fetch("/api/prevent/request-change-plan", {
      method: "PATCH",
      body: JSON.stringify(val),
    });
    if (res.status != 200) {
      setSnackBar({ sevirity: "error", massege: "เกิดข้อผิดพลาด", open: true });
      return;
    }
    setOpenDialog(false);

    setSnackBar({ sevirity: "success", massege: "สำเร็จ", open: true });
    router.reload();
  };

  const handleSendRequest = async () => {
    let changePlanIds: string[] = [];
    changePlanPreventReq.forEach((val) => {
      changePlanIds.push(val._id as string);
    });
    const res = await fetch("/api/prevent/send-request", {
      method: "POST",
      body: JSON.stringify({
        changePlanIds,
      }),
    });
    if (res.status != 200) {
      setSnackBar({
        massege: "เกิดข้อผิดพลาด",
        sevirity: "error",
        open: true,
      });
      return;
    }
    setSnackBar({
      massege: "สำเร็จ",
      sevirity: "success",
      open: true,
    }),
      router.reload();
  };

  const handleScroll = () => {
    // ตรวจสอบว่า scroll position มีค่ามากกว่าความสูงของ header หรือไม่
    setIsSticky(
      stickyRef && stickyRef.current
        ? window.scrollY > stickyRef.current.offsetHeight + 50
        : false,
    );
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log(changePlanRequire);
    const res = await fetch("/api/prevent/request-change-plan", {
      method: "PUT",
      body: JSON.stringify(changePlanRequire),
    });
    if (res.status != 200) {
      setSnackBar({ sevirity: "error", massege: "เกิดข้อผิดพลาด", open: true });
      return;
    }
    setSnackBar({ sevirity: "success", massege: "สำเร็จ", open: true });
    setOpenDialog(false);
    router.reload();
  };

  let changeType: FormChangePlanPreventWithStatus[] = [];
  let addType: FormAddPlanPreventWithStatus[] = [];
  let cancelType: FormCancelPlanPreventWithStatus[] = [];
  changePlanPreventReq.forEach((val) => {
    if (val.typeReq == "add") {
      addType.push(val);
    }

    if (val.typeReq == "change") {
      changeType.push(val);
    }

    if (val.typeReq == "cancel") {
      cancelType.push(val);
    }
  });
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
      <div className="h-full" id="main-content">
        <div className="p-0 m-0">
          <div className="m-3">
            รายการขอเปลี่ยนแปลง / เพิ่ม / ยกเลิกแผนงานป้องกัน
          </div>
        </div>
        <CustomSeparator setProgress={setProgress} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
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
              <Button onClick={handleSendRequest}>ส่ง</Button>
            </Box>
            <TabPanel value={tab} index={0}>
              <Grid container spacing={1}>
                {changeType.map((val) => {
                  return (
                    <Grid item key={val._id as string} xs={12} sm={6} md={4}>
                      <ChangePlanPreventCard
                        plan={val}
                        onClickEdit={() => handleEdit(val)}
                        onClickCancel={() => handleCancel(val)}
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
                        plan={val}
                        onClickEdit={() => handleEdit(val)}
                        onClickCancel={() => handleCancel(val)}
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
                        plan={val}
                        onClickEdit={() => handleEdit(val)}
                        onClickCancel={() => handleCancel(val)}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </TabPanel>
          </Box>
          <List
            id="main-content"
            className=" w-11/12 my-3 bg-white grid grid-cols-1 relative"
            subheader={
              <ListSubheader component="div" id="nested-list-subheader">
                รายการที่ส่งแล้ว
              </ListSubheader>
            }
          >
            {idsHasSentPlanPreventRequest.length == 0 && (
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <FolderOffIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="ไม่มีรายการที่ส่ง" />
              </ListItem>
            )}
            {idsHasSentPlanPreventRequest.map((val) => {
              return (
                <ListItem key={val._id as string}>
                  <ListItemAvatar>
                    <Avatar>
                      <FolderIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`วันที่: ${new Date(
                      val.sendDate,
                    ).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })} เวลา: ${new Date(val.sendDate).toLocaleTimeString("th-TH")}`}
                    secondary={`จำนวน: ${val.changePlanRequest.length} แผนงาน`}
                  />
                  <Button
                    onClick={() =>
                      handlePrint(val.changePlanRequest, val._id as string)
                    }
                  >
                    พิมพ์รายละเอียดแนบ
                  </Button>
                  {(new Date().getTime() - new Date(val.sendDate).getTime()) /
                    36e5 <=
                    24 && (
                    <Button
                      onClick={() => {
                        handleCancelRequest(val);
                      }}
                    >
                      ยกเลิกการส่ง
                    </Button>
                  )}
                </ListItem>
              );
            })}
          </List>
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
      <ChangePlanPreventFormDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        handleSubmit={handleSubmit}
        changePlanRequire={changePlanRequire}
        setChangePlanRequire={setChangePlanRequire}
        setSnackBar={setSnackBar}
        snackBar={snackBar}
      />
      <AlertSnackBar setSnackBar={setSnackBar} snackBar={snackBar} />
      <LoadingBackDrop progress={progress} setProgress={setProgress} />
      <PrintChangePlanPrevent
        printPlan={print}
        budgets={budgets}
        version={version}
      />
      <style jsx global>{`
        @media print {
          body {
            font-size: 12pt;
          }

          #main-content {
            display: none;
          }

          #navbar-content {
            display: none;
          }

          #printable-content {
            display: block; /* แสดงเฉพาะ element ที่มี id="printable-content" */
          }
        }
      `}</style>
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
