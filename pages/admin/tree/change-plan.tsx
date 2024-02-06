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
  SentReq,
} from "@/types/report-tree";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ChangePlanTreeCard from "@/components/tree/change-plan/change-plan-tree-req-card";
import { useRouter } from "next/router";
import {
  Autocomplete,
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

  const mongoClient = await clientPromise;
  try {

    const sentReqProjection = {
      _id: { $toString: '$_id' },
      businessName: "$businessName",
      sendDate: "$sendDate",
      add: "$add",
      cancel: "$cancel",
      change: "$change",
      changeBudget: "$changeBudget"
    }

    let sentReq = await mongoClient.db("tree").collection("idsHasSentRequest").find({businessName: {$ne:"กฟฟ.ทดสอบ"}},{projection: sentReqProjection}).toArray()
    await mongoClient.close()
    return {
      props: { sentReq },
    };
  } catch (e) {
    console.error(e);
    await mongoClient.close()
    return {
      props: { sentReq: [] },
    };
  }
}

export default function ChangePlanReqList({
  sentReq
}: {
  sentReq: SentReq[];
}) {
  const [changePlanTreeReq, setChangePlanTreeReq] = useState<(
    | FormChangePlanTree
    | FormAddPlanTree
    | FormCancelPlanTree
  )[]>([])
  const stickyRef = useRef<HTMLDivElement>();
  const router = useRouter();
  const [selectedVer,setSelectedVer] = useState("")
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

  const handleShow = async (_id:string)=>{
    const res = await fetch(`/api/tree/admin/get-plan/${_id}`)
    if(res.status != 200){
      setSnackBar({
        massege: "เกิดข้อผิดพลาด",
        sevirity: "error",
        open: true
      })
      return
    }
    const {changePlanRequest}:{changePlanRequest:((
      | FormChangePlanTree
      | FormAddPlanTree
      | FormCancelPlanTree
    )[])} = await res.json()
    setChangePlanTreeReq(changePlanRequest)
    setSelectedVer(_id)
  }

  const handleAprove = async (
    changePlanRequire:
      | FormChangePlanTree
      | FormAddPlanTree
      | FormCancelPlanTree,
  ) => {
    {
      let message = "ต้องการ ";
      switch (changePlanRequire.typeReq) {
        case "add":
          message =
            message +
            '"อนุมัติ" การการเพิ่มแผนงาน ' +
            changePlanRequire.newPlan.planName +
            " ?";
          break;
        case "cancel":
          message =
            message +
            '"อนุมัติ" การการยกเลิกแผนงาน ' +
            changePlanRequire.oldPlan.planName +
            " ?";
          break;
        case "change":
          message =
            message +
            '"อนุมัติ" การเปลี่ยนแผนงานเดิม ' +
            changePlanRequire.newPlan.planName +
            " ?";
      }
      if (!window.confirm(message)) {
        return;
      }
      const res = await fetch("/api/tree/admin", {
        method: "PATCH",
        body: JSON.stringify({
          ...changePlanRequire,
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
      setDeleteId([...deleteId, changePlanRequire._id as string]);
    }
  };

  const handleReject = async (
    changePlanRequire:
      | FormChangePlanTree
      | FormAddPlanTree
      | FormCancelPlanTree,
  ) => {
    {
      let message = "ต้องการ ";
      switch (changePlanRequire.typeReq) {
        case "add":
          message =
            message +
            '"ปฏิเสธ" การเพิ่มแผนงาน ' +
            changePlanRequire.newPlan.planName +
            " ?";
          break;
        case "cancel":
          message =
            message +
            '"ปฏิเสธ" การยกเลิกแผนงาน ' +
            changePlanRequire.oldPlan.planName +
            " ?";
          break;
        case "change":
          message =
            message +
            '"ปฏิเสธ" การเปลี่ยนแผนงานเดิม ' +
            changePlanRequire.newPlan.planName +
            " ?";
      }
      if (!window.confirm(message)) {
        return;
      }
      const res = await fetch("/api/tree/admin", {
        method: "PUT",
        body: JSON.stringify({
          ...changePlanRequire,
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
      setDeleteId([...deleteId, changePlanRequire._id as string]);
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

  const handleImport = async () => {
    if(!window.confirm("หากตกลง จะเป็นการทับไฟล์ Google Sheet เดิม? กดยกเลิกเพื่อเปิด Google sheet")){
      handlePrint()
      return                        
    }
    setProgress(true);
    const res = await fetch("/api/tree/admin");
    if (res.status == 200) {
      setSnackBar({
        massege: "สำเร็จ",
        sevirity: "success",
        open: true,
      });
    } else {
      setSnackBar({
        massege: "Error " + res.status,
        sevirity: "error",
        open: true,
      });
    }
    setProgress(false);
  };

  const handlePrint = async () => {
    window.open(
      "https://docs.google.com/spreadsheets/d/1r6xiCX-mSE0FzVb1iLwVdqoWMggjzSddrGdYky4AC1A/",
    );
  }

  const businessNameOptions: string[] = useMemo(() => {
    let autoComplete: string[] = [];
    sentReq.forEach((val) => {
      autoComplete.push(val.businessName);
    });
    autoComplete = autoComplete.filter((val, i, arr) => {
      return arr.indexOf(val) === i;
    });
    return autoComplete;
  }, [sentReq]);

  const [businessName, setBusinessName] = useState(
    businessNameOptions.length > 0 ? businessNameOptions[0] : "",
  );

  const showSentReq: SentReq[] = useMemo(()=>{
    let req: SentReq[] = sentReq.filter((val)=>{
      return val.businessName == businessName
    })
    return req
  },[sentReq,businessName])

  const {
    changeType,
    addType,
    cancelType,
  }: {
    changeType: (FormChangePlanTree)[];
    addType: (FormAddPlanTree)[];
    cancelType: (FormCancelPlanTree)[];
  } = useMemo(() => {
    let changeType: (FormChangePlanTree)[] = [];
    let addType: (FormAddPlanTree)[] = [];
    let cancelType: (FormCancelPlanTree)[] = [];
    changePlanTreeReq.forEach((val) => {
      if (!deleteId.includes(val._id as string)) {
        if (val.typeReq == "add" ) {
          addType.push(val);
        }

        if (val.typeReq == "change" ) {
          changeType.push(val);
        }

        if (val.typeReq == "cancel" ) {
          cancelType.push(val);
        }
      }
    });
    return { changeType, addType, cancelType };
  }, [changePlanTreeReq, deleteId, businessName]);

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
      <div className="h-full">
        <div id="main-content" className="p-0 m-0">
          <p className="m-3">
            รายการขอเปลี่ยนแปลง / เพิ่ม / ยกเลิกแผนงานตัดต้นไม้
          </p>
          <CustomSeparator setProgress={setProgress} />
          <List
            className="mx-auto w-11/12 mb-3 bg-white grid grid-cols-1 relative"
            subheader={
              <ListSubheader component="div" id="nested-list-subheader">
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
                  onChange={(e, v) => {
                    setBusinessName(v ? v : "")
                    setSelectedVer("")
                    setChangePlanTreeReq([])
                  }}
                />
              </ListSubheader>
            }
          >
            {showSentReq.map((val) => {
              return (
                <ListItem key={val._id}>
                  <ListItemAvatar>
                    <Avatar>
                      {val._id == selectedVer ?<FolderOpenIcon/>: <FolderIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    secondary={`version: ${val._id}`}
                    primary={`เพิ่ม: ${val.add}, เปลี่ยนแปลง: ${val.change}, ยกเลิก: ${val.cancel}, วงเงินเปลี่ยนแปลง:${val.changeBudget.toLocaleString("th-TH",{ style: "currency", currency: "THB" })}`}
                  />
                  <Button
                    disabled={selectedVer==val._id}
                    onClick={() =>
                      handleShow(val._id)
                    }
                  >
                    แสดง
                  </Button>
                </ListItem>
              );
            })}
          </List>
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

                <Button onClick={handleImport}>นำข้อมูลเข้า gSheet</Button>
                <Button onClick={handlePrint}>เปิด gSheet</Button>
              </Box>
            </Box>
            <TabPanel value={tab} index={0}>
              <Grid container spacing={1}>
                {changeType.map((val) => {
                  return (
                    <Grid item key={val._id as string} xs={12} sm={6} md={4}>
                      <ChangePlanTreeCard
                        plan={val}
                        onClickEdit={() => handleAprove(val)}
                        onClickCancel={() => handleReject(val)}
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
                        onClickEdit={() => handleAprove(val)}
                        onClickCancel={() => handleReject(val)}
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
                        onClickEdit={() => handleAprove(val)}
                        onClickCancel={() => handleReject(val)}
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
