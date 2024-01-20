import clientPromise from "@/lib/mongodb";
import { Collection, ObjectId } from "mongodb";
import { getSession } from "next-auth/react";
import { useCallback, useReducer, useState } from "react";
import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {
  Autocomplete,
  Breadcrumbs,
  Grid,
  Link,
  Pagination,
  Stack,
  TextField,
} from "@mui/material";
import AlertSnackBar from "@/components/alert-snack-bar";
import { AlertSnackBarType } from "@/types/snack-bar";
import ChangePlanTreeFormDialog from "@/components/tree/change-plan/form-dialog";
import {
  FormAddPlanTree,
  FormCancelPlanTree,
  FormChangePlanTree,
} from "@/types/report-tree";
import { clear } from "console";
import { useRouter } from "next/router";

export async function getServerSideProps(context: any) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/signin?link=/tree/change-plan",
      },
    };
  }

  if (!session.pea) {
    return {
      redirect: {
        destination: "/profile?link=/tree/change-plan",
      },
    };
  }

  try {
    const mongoClient = await clientPromise;

    const planLVCollection: Collection<FormChangePlanTree> = mongoClient
      .db("tree")
      .collection("plan");

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
        oldPlan: {
          planName: "$planName",
          quantity: "$quantity",
          budget: "$budget",
          systemVolt: "$systemVolt",
          month: "$month",
          hireType: "$hireType",
        },
      },
    };

    const plan = await planLVCollection.find(query, options).toArray();
    let planTree: FormChangePlanTree[] = [];
    plan.forEach((val) => {
      planTree.push({
        ...val,
        _id: val._id instanceof ObjectId ? val._id.toHexString() : val._id,
      });
    });

    return {
      props: { planTree },
    };
  } catch (e) {
    console.error(e);
    return {
      props: { planTree: [] },
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

export default function ChangePlanTree({
  planTree,
}: {
  planTree: FormChangePlanTree[];
}) {
  const router = useRouter();
  const [changePlanRequire, setChangePlanRequire] = useState<
    FormChangePlanTree | FormAddPlanTree | FormCancelPlanTree
  >({
    _id: "",
    oldPlan: {
      planName: "",
      quantity: {
        plentifully: 0,
        moderate: 0,
        lightly: 0,
        clear: 0,
      },
      budget: 0,
      systemVolt: "33kV",
      month: "",
      hireType: "normal",
    },
    newPlan: {
      planName: "",
      quantity: {
        plentifully: 0,
        moderate: 0,
        lightly: 0,
        clear: 0,
      },
      budget: 0,
      systemVolt: "33kV",
      month: "",
      hireType: "normal",
    },
    typeReq: "change",
    status: "progress",
    reason: "",
  });

  const [plan, setPlan] = useState(planTree);
  const [defaultValOld, setDefaultValOld] = useState(true);
  const [progress, setProgress] = useState(false);

  const reducer = useCallback(
    (
      _state: {
        plan: FormChangePlanTree[];
        page: number;
        planFilter: {
          planName: string;
          month: string;
        };
        totalPage: number;
      },
      action: {
        page: number;
        plan: FormChangePlanTree[];
        planFilter: {
          planName: string;
          month: string;
        };
        deletePlan?: string;
      },
    ) => {
      let p = action.plan;
      if (action.deletePlan) {
        p = p.filter((val) => {
          return (val._id as string) != action.deletePlan;
        });
        setPlan(p);
      }
      if (action.planFilter.planName != "") {
        p = p.filter((val) => {
          return val.oldPlan!.planName.match(action.planFilter.planName);
        });
      }
      if (action.planFilter.month != "") {
        p = p.filter((val) => {
          return val.oldPlan!.month == action.planFilter.month;
        });
      }
      return {
        plan: p.slice(action.page * 10 - 10, action.page * 10),
        page: action.page,
        planFilter: action.planFilter,
        totalPage: Math.round(p.length / 10),
      };
    },
    [],
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [snackBar, setSnackBar] = useState<AlertSnackBarType>({
    open: false,
    sevirity: "success",
    massege: "",
  });

  const [expanded, setExpanded] = useState<string>("");

  const [state, dispatch] = useReducer(reducer, {
    plan: plan.slice(0, 10),
    page: 1,
    planFilter: {
      planName: "",
      month: "",
    },
    totalPage: Math.round(planTree.length / 10),
  });

  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    dispatch({ page: value, plan, planFilter: state.planFilter });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    let newChangePlan = changePlanRequire;

    if (newChangePlan.typeReq == "add" || newChangePlan.typeReq == "change") {
      if (newChangePlan.newPlan.hireType == "normal") {
        if (
          typeof newChangePlan.newPlan.quantity.plentifully == "string" &&
          /^\d+\.?\d{0,2}$/.test(newChangePlan.newPlan.quantity.plentifully)
        ) {
          newChangePlan.newPlan.quantity.plentifully = parseFloat(
            newChangePlan.newPlan?.quantity?.plentifully,
          );
        } 

        if (
          typeof newChangePlan.newPlan.quantity.moderate == "string" &&
          /^\d+\.?\d{0,2}$/.test(newChangePlan.newPlan.quantity.moderate)
        ) {
          newChangePlan.newPlan.quantity.moderate = parseFloat(
            newChangePlan.newPlan.quantity.moderate,
          );
        } 

        if (
          typeof newChangePlan.newPlan.quantity.lightly == "string" &&
          /^\d+\.?\d{0,2}$/.test(newChangePlan.newPlan.quantity.lightly)
        ) {
          newChangePlan.newPlan.quantity.lightly = parseFloat(
            newChangePlan.newPlan.quantity.lightly,
          );
        } 

        if (
          typeof newChangePlan.newPlan.quantity.clear == "string" &&
          /^\d+\.?\d{0,2}$/.test(newChangePlan.newPlan.quantity.clear)
        ) {
          newChangePlan.newPlan.quantity.clear = parseFloat(
            newChangePlan.newPlan.quantity.clear,
          );
        } 
      }

      if (newChangePlan.newPlan.hireType == "self") {
        if (
          typeof newChangePlan.newPlan.quantity.distance == "string" &&
          /^\d+\.?\d{0,2}$/.test(newChangePlan.newPlan.quantity.distance)
        ) {
          newChangePlan.newPlan.quantity.distance = parseFloat(
            newChangePlan.newPlan.quantity.distance,
          );
        } 
      }

      if (
        typeof newChangePlan.newPlan.budget == "string" &&
        /^\d+\.?\d{0,2}$/.test(newChangePlan.newPlan.budget)
      ) {
        newChangePlan.newPlan.budget = parseFloat(newChangePlan.newPlan.budget);
      } 
    }

    const res = await fetch("/api/tree/request-change-plan", {
      method: "POST",
      body: JSON.stringify(newChangePlan),
    });

    if (res.status != 200) {
      setSnackBar({ sevirity: "error", massege: "เกิดข้อผิดพลาด", open: true });
      return;
    }

    setSnackBar({ sevirity: "success", massege: "สำเร็จ", open: true });

    setOpenDialog(false);
    if (
      changePlanRequire.typeReq == "cancel" ||
      changePlanRequire.typeReq == "change"
    ) {
      dispatch({
        page: state.page,
        plan,
        planFilter: state.planFilter,
        deletePlan: changePlanRequire._id as string,
      });
    }
  };

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
      <div className="h-full">
        <p className="m-3">เปลี่ยนแปลงแผนงานตัดต้นไม้</p>
        <CustomSeparator setProgress={setProgress} />
        <div className="mx-auto w-11/12 mb-3 bg-white grid grid-cols-1">
          <Button
            sx={{ width: "100px", margin: "1rem auto 0" }}
            onClick={() => {
              setDefaultValOld(false);
              setChangePlanRequire({
                _id: "",
                reason: "",
                typeReq: "add",
                newPlan: {
                  systemVolt: "33kV",
                  planName: "",
                  budget: 0,
                  month: "",
                  hireType: "normal",
                  quantity: {
                    plentifully: 0,
                    moderate: 0,
                    lightly: 0,
                    clear: 0,
                  },
                },
                status: "progress",
              });
              setOpenDialog(true);
            }}
          >
            เพิ่มแผนงาน
          </Button>

          <Pagination
            sx={{ margin: "0.5rem auto" }}
            count={state.totalPage}
            page={state.page}
            onChange={handleChange}
          />
          <Grid
            container
            sx={{
              margin: "1rem auto 1rem",
              rowGap: "1rem",
              justifySelf: "center",
            }}
          >
            <Grid item xs={12} sm={8} sx={{ padding: "0.5rem" }}>
              <TextField
                label="กรองตามชื่อแผนงาน"
                variant="outlined"
                onChange={(e) => {
                  dispatch({
                    page: 1,
                    plan,
                    planFilter: {
                      ...state.planFilter,
                      planName: e.target.value,
                    },
                  });
                }}
              ></TextField>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ padding: "0.5rem" }}>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={month}
                onChange={(_e, v) => {
                  dispatch({
                    page: 1,
                    plan,
                    planFilter: {
                      ...state.planFilter,
                      month: v ? v.month : "",
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="กรองเดือน" />
                )}
              />
            </Grid>
          </Grid>
          {state.plan.length == 0 ? (
            <Accordion>
              <AccordionSummary
                aria-controls="no-data-content"
                id="no-data-header"
              >
                <Typography sx={{ margin: "auto 0" }}>ไม่พบแผนงาน</Typography>
              </AccordionSummary>
            </Accordion>
          ) : (
            state.plan.map((val, i) => {
              return (
                <div key={i} className="mt-3 mx-3">
                  <Accordion expanded={expanded === val._id}>
                    <AccordionSummary
                      onClick={() =>
                        expanded == val._id
                          ? setExpanded("")
                          : setExpanded(val._id as string)
                      }
                      aria-controls={`${val.oldPlan!.planName}-content`}
                      id={`${val.oldPlan!.planName}-header`}
                    >
                      <Grid container>
                        <Grid item xs={12}>
                          <Typography sx={{ margin: "auto 0" }}>
                            {val.oldPlan!.planName}
                          </Typography>
                        </Grid>
                        <Grid sx={{ margin: "0.5rem 0" }} item xs={12}>
                          แผนงานเดือน: {monthMap.get(val.oldPlan?.month)}
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sx={{ direction: "flex", justifyContent: "end" }}
                        >
                          <Button
                            sx={{ marginLeft: "auto" }}
                            onClick={() => {
                              setOpenDialog(true);
                              setChangePlanRequire({
                                _id: val._id as string,
                                oldPlan: val.oldPlan,
                                newPlan: val.oldPlan,
                                reason: "",
                                typeReq: "change",
                                status: "progress",
                              });
                              setDefaultValOld(true);
                            }}
                          >
                            {" "}
                            เปลี่ยนแผนงาน{" "}
                          </Button>
                          <Button
                            onClick={() => {
                              setOpenDialog(true);
                              setChangePlanRequire({
                                _id: val._id as string,
                                reason: "",
                                typeReq: "cancel",
                                status: "progress",
                                oldPlan: val.oldPlan,
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
                        <span>
                          ประเภทงาน : {hireMap.get(val.oldPlan.hireType)}
                        </span>
                        <br />
                        <span>ปริมาณงาน</span> <br />
                        {val.oldPlan.hireType == "normal" && (
                          <>
                            <span>
                              หนาแน่น: {val.oldPlan.quantity.plentifully}
                            </span>{" "}
                            <br />
                            <span>
                              เบาบาง: {val.oldPlan.quantity.moderate}
                            </span>{" "}
                            <br />
                            <span>
                              ปานกลาง: {val.oldPlan.quantity.lightly}
                            </span>{" "}
                            <br />
                            <span>โล่ง: {val.oldPlan.quantity.clear}</span>{" "}
                            <br />
                            <span>
                              แผนงานเดือน : {monthMap.get(val.oldPlan!.month)}
                            </span>{" "}
                            <br />
                            <span>งบประมาณ: {val.oldPlan!.budget}</span> <br />
                          </>
                        )}
                        {val.oldPlan.hireType == "self" && (
                          <span>ระยะทาง: {val.oldPlan.quantity.distance}</span>
                        )}
                        {val.oldPlan.hireType == "special" && (
                          <span>
                            ปริมาณงานโดยสังเขป:{" "}
                            {val.oldPlan.quantity.discription}
                          </span>
                        )}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </div>
              );
            })
          )}
          <Pagination
            sx={{ margin: "1rem auto" }}
            count={state.totalPage}
            page={state.page}
            onChange={handleChange}
          />
          <ChangePlanTreeFormDialog
            openDialog={openDialog}
            setOpenDialog={setOpenDialog}
            handleSubmit={handleSubmit}
            changePlanRequire={changePlanRequire}
            setChangePlanRequire={setChangePlanRequire}
            setSnackBar={setSnackBar}
            snackBar={snackBar}
            defaultValOldPlan={defaultValOld}
          />
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
          <AlertSnackBar snackBar={snackBar} setSnackBar={setSnackBar} />
        </div>
      </div>
    </div>
  );
}

const month = [
  { label: "มกราคม", month: "1" },
  { label: "กุมภาพันธ์", month: "2" },
  { label: "มีนาคม", month: "3" },
  { label: "เมษายน", month: "4" },
  { label: "พฤษภาคม", month: "5" },
  { label: "มิถุนายน", month: "6" },
  { label: "กรกฎาคม", month: "7" },
  { label: "สิงหาคม", month: "8" },
  { label: "กันยายน", month: "9" },
  { label: "ตุลาคม", month: "10" },
  { label: "พฤศจิกายน", month: "11" },
  { label: "ธันวาคม", month: "12" },
];

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

const hireOption: HireValue[] = [
  { label: "จ้างเหมาปกติ", hireType: "normal" },
  { label: "จ้างเหมาลักษณะพิเศษ", hireType: "special" },
  { label: "กฟภ.ดำเนินการ", hireType: "self" },
];

const hireMap = new Map([
  ["self", "กฟภ. ดำเนินการเอง"],
  ["normal", "จ้างเหมาปกติ"],
  ["special", "จ้างเหมาลักษณะพิเศษ"],
]);

const monthMap = new Map([
  ["1", "มกราคม"],
  ["2", "กุมภาพันธ์"],
  ["3", "มีนาคม"],
  ["4", "เมษายน"],
  ["5", "พฤษภาคม"],
  ["6", "มิถุนายน"],
  ["7", "กรกฎาคม"],
  ["8", "สิงหาคม"],
  ["9", "กันยายน"],
  ["10", "ตุลาคม"],
  ["11", "พฤศจิกายน"],
  ["12", "ธันวาคม"],
]);

type HireValue = {
  label: string;
  hireType?: "normal" | "special" | "self";
};
