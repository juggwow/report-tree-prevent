import clientPromise from "@/lib/mongodb";
import {
  ChangePlanRequirePrevent,
  PreventDataForChange,
  snackBar,
} from "@/types/report-prevent";
import { styled } from "@mui/material/styles";
import {
  Autocomplete,
  Breadcrumbs,
  Button,
  Grid,
  Link,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next/types";
import { FormEventHandler, useEffect, useState } from "react";
import { useRouter } from "next/router";
import AlertSnackBar from "@/components/alert-snack-bar";
import ChangePlanPreventFormDialog from "@/components/prevent/change-plan/form-dialog";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/signin?link=/prevent/change-plan",
      },
    };
  }

  if (!session.pea) {
    return {
      redirect: {
        destination: "profile?link=/prevent/change-plan",
      },
    };
  }

  const mongoClient = await clientPromise;
  await mongoClient.connect();
  try {
    const preventCollection = mongoClient.db("prevent").collection("showPlan");

    const query = {
      businessName: session.pea.karnfaifa,
      planName: {
        $ne: null,
        $exists: true,
      },
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
        _id: 1,
        planName: "$planName",
        typePrevent: "$typePrevent",
        breifQuantity: "$breifQuantity",
        budget: "$budget",
        duration: "$duration",
      },
    };

    let preventDatas = (await preventCollection
      .find(query, options)
      .toArray()) as any as PreventDataForChange[];
    preventDatas.forEach((val, i, preventDatas) => {
      if (typeof val._id != "string") {
        preventDatas[i]._id = val._id.toHexString();
      }
    });
    await mongoClient.close();
    return {
      props: {
        preventDatas,
      },
    };
  } catch (e) {
    const preventDatas: PreventDataForChange[] = [];
    await mongoClient.close();
    return {
      props: { preventDatas },
    };
  }
}

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, .05)"
      : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

export default function ChangePlanPrevent({
  preventDatas,
}: {
  preventDatas: PreventDataForChange[];
}) {
  let durationOptions: string[] = [];
  preventDatas.forEach((val) => durationOptions.push(val.duration));
  durationOptions = durationOptions.filter((val, i, arr) => {
    return arr.indexOf(val) === i;
  });

  const router = useRouter();

  const [snackBar, setSnackBar] = useState<snackBar>({
    open: false,
    sevirity: "success",
    massege: "",
  });
  const [progress, setProgress] = useState(false);
  const [page, setPage] = useState(1);
  const [planFilter, setPlanFilter] = useState({
    planName: "",
    duration: "",
    typePrevent: "",
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [showPlan, setShowPlan] = useState<PreventDataForChange[]>([]);
  const [deletedPlan, setDeletedPlan] = useState<string[]>([]);
  const [totalPage, setTotalPage] = useState(
    Math.ceil(preventDatas.length / 10),
  );
  const [expanded, setExpanded] = useState("");
  const [changePlanRequire, setChangePlanRequire] =
    useState<ChangePlanRequirePrevent>({
      _id: "",
      reason: "",
      typeReq: "add",
      newPlan: {
        planName: "",
        budget: "",
        breifQuantity: "",
        duration: "",
        typePrevent: "",
      },
    });
  useEffect(() => {
    let filterplan: PreventDataForChange[] = preventDatas;

    filterplan = filterplan.filter((v) => {
      if (deletedPlan.length > 0 && deletedPlan.includes(v._id as string)) {
        return false;
      }
      if (planFilter.duration != v.duration && planFilter.duration != "") {
        return false;
      }
      if (
        planFilter.typePrevent != v.typePrevent &&
        planFilter.typePrevent != ""
      ) {
        return false;
      }
      if (
        planFilter.planName != "" &&
        !v.planName.includes(planFilter.planName)
      ) {
        return false;
      }
      return true;
    });

    setShowPlan(filterplan.slice(page * 10 - 10, page * 10));
    setTotalPage(Math.ceil(filterplan.length / 10));
  }, [deletedPlan, page, planFilter, preventDatas]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    console.log(changePlanRequire);
    let newChangePlan = changePlanRequire;

    if (newChangePlan.typeReq == "add" || newChangePlan.typeReq == "change") {
      newChangePlan.newPlan.budget = Number(newChangePlan.newPlan.budget);
    }

    const res = await fetch("/api/prevent/request-change-plan", {
      method: "POST",
      body: JSON.stringify(newChangePlan),
    });

    if (res.status != 200) {
      setSnackBar({ sevirity: "error", massege: "เกิดข้อผิดพลาด", open: true });
      return;
    }

    if (
      newChangePlan.typeReq == "cancel" ||
      newChangePlan.typeReq == "change"
    ) {
      setDeletedPlan([...deletedPlan, newChangePlan._id as string]);
    }

    setSnackBar({ sevirity: "success", massege: "สำเร็จ", open: true });

    setOpenDialog(false);
  };

  const handleAddPlan = () => {
    setChangePlanRequire({
      _id: "",
      reason: "",
      typeReq: "add",
      newPlan: {
        planName: "",
        budget: 0,
        duration: "",
        typePrevent: "",
        breifQuantity: "",
      },
    });
    setOpenDialog(true);
  };
  return (
    <div>
      <div className="flex flex-row">
        <Link
          href="/prevent/report-tree"
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

      <p className="m-3">เปลี่ยนแปลงแผนงานตัดต้นไม้</p>
      <CustomSeparator setProgress={setProgress} />
      <div className="mx-auto w-11/12 mb-3 bg-white grid grid-cols-1">
        <Button
          sx={{ width: "100px", margin: "1rem auto 0" }}
          onClick={handleAddPlan}
        >
          เพิ่มแผนงาน
        </Button>
        <Pagination
          sx={{ margin: "0.5rem auto" }}
          count={totalPage}
          page={page}
          onChange={(_e, v) => setPage(v)}
        />
        <Grid
          container
          sx={{
            margin: "1rem auto 1rem",
            rowGap: "1rem",
            justifySelf: "center",
          }}
        >
          <Grid item xs={12} sm={4} sx={{ padding: "0.5rem" }}>
            <TextField
              label="กรองตามชื่อแผนงาน"
              variant="outlined"
              onChange={(e) => {
                setPlanFilter({ ...planFilter, planName: e.target.value });
              }}
            ></TextField>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ padding: "0.5rem" }}>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={typedurationOptions}
              onChange={(_e, v) => {
                v
                  ? setPlanFilter({ ...planFilter, typePrevent: v })
                  : setPlanFilter({ ...planFilter, typePrevent: "" });
              }}
              renderInput={(params) => (
                <TextField {...params} label="กรองประเภทแผนงาน" />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4} sx={{ padding: "0.5rem" }}>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={durationOptions}
              onChange={(_e, v) => {
                v
                  ? setPlanFilter({ ...planFilter, duration: v })
                  : setPlanFilter({ ...planFilter, duration: "" });
              }}
              renderInput={(params) => (
                <TextField {...params} label="กรองช่วงเวลา" />
              )}
            />
          </Grid>
        </Grid>
        {showPlan.length == 0 ? (
          <Accordion>
            <AccordionSummary
              aria-controls="no-data-content"
              id="no-data-header"
            >
              <Typography sx={{ margin: "auto 0" }}>ไม่พบแผนงาน</Typography>
            </AccordionSummary>
          </Accordion>
        ) : (
          showPlan.map((val, i) => {
            return (
              <div key={i} className="mt-3 mx-3">
                <Accordion expanded={expanded === val._id}>
                  <AccordionSummary
                    onClick={() =>
                      expanded == val._id
                        ? setExpanded("")
                        : setExpanded(val._id as string)
                    }
                    aria-controls={`${val._id as string}-content`}
                    id={`${val._id as string}-header`}
                  >
                    <Grid container>
                      <Grid item xs={12}>
                        <Typography sx={{ margin: "auto 0" }}>
                          {val.planName}
                        </Typography>
                      </Grid>
                      <Grid sx={{ margin: "0.5rem 0" }} item xs={12}>
                        ประเภทงานป้องกัน: {val.typePrevent}
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        sx={{ direction: "flex", justifyContent: "end" }}
                      >
                        <Button
                          sx={{ marginLeft: "auto" }}
                          onClick={() => {
                            const oldPlan = {
                              planName: val.planName,
                              typePrevent: val.typePrevent,
                              breifQuantity: val.breifQuantity,
                              budget: val.budget,
                              duration: val.duration,
                            };
                            setOpenDialog(true);
                            setChangePlanRequire({
                              _id: val._id as string,
                              oldPlan: oldPlan,
                              newPlan: oldPlan,
                              reason: "",
                              typeReq: "change",
                            });
                          }}
                        >
                          {" "}
                          เปลี่ยนแผนงาน{" "}
                        </Button>
                        <Button
                          onClick={() => {
                            const oldPlan = {
                              planName: val.planName,
                              typePrevent: val.typePrevent,
                              breifQuantity: val.breifQuantity,
                              budget: val.budget,
                              duration: val.duration,
                            };
                            setOpenDialog(true);
                            setChangePlanRequire({
                              _id: val._id as string,
                              reason: "",
                              typeReq: "cancel",
                              oldPlan,
                            });
                          }}
                        >
                          {" "}
                          ยกเลิกแผนงาน{" "}
                        </Button>
                      </Grid>
                    </Grid>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      <span>ช่วงเวลาดำเนินการ : {val.duration}</span>
                      <br />
                      <span>ปริมาณงานโดยสังเขป: {val.breifQuantity}</span>{" "}
                      <br />
                      <span>
                        งบประมาณ:{" "}
                        {val.budget.toLocaleString("th-TH", {
                          style: "currency",
                          currency: "THB",
                        })}
                      </span>
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </div>
            );
          })
        )}

        <Pagination
          sx={{ margin: "1rem auto" }}
          count={totalPage}
          page={page}
          onChange={(_e, v) => setPage(v)}
        />
      </div>
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
      <ChangePlanPreventFormDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        handleSubmit={handleSubmit}
        changePlanRequire={changePlanRequire}
        setChangePlanRequire={setChangePlanRequire}
        setSnackBar={setSnackBar}
        snackBar={snackBar}
      />
      <AlertSnackBar snackBar={snackBar} setSnackBar={setSnackBar} />
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
      เปลี่ยนแปลง / เพิ่ม / ยกเลิก แผนงาน
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

const typedurationOptions = [
  "ติดตั้งอุปกรณ์ป้องกันสัตว์",
  "ทำป้ายเตือน,พ่นหมายเลขเสาไฟฟ้า, ทาสีเสาไฟฟ้า",
  "ฉีดน้ำล้างลูกถ้วย",
  "งานอื่นๆ (ทำผนังกั้นเสริมฐานเสาไฟฟ้า, แก้ไขค่ากราวด์ที่เกินมาตรฐาน ฯลฯ)",
];
