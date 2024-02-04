import clientPromise from "@/lib/mongodb";
import { Collection, ObjectId, WithId } from "mongodb";
import { getSession } from "next-auth/react";
import {
  FormEventHandler,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Pagination,
  TextField,
} from "@mui/material";
import AlertSnackBar from "@/components/alert-snack-bar";
import { AlertSnackBarType } from "@/types/snack-bar";
import { PlanLV, ChangePlanLV } from "@/types/plan-lv";
import ChangePlanLVFormDialog from "@/components/patrol-lv/form-dialog";

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
  const mongoClient = await clientPromise;

  try {
    const planLVCollection: Collection<PlanLV> = mongoClient
      .db("patrol-LV")
      .collection("plan");

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
        _id: 1,
        feeder: 1,
        peaNo: 1,
        distanceCircuit: 1,
        businessArea: 1,
        businessName: 1,
      },
    };

    const plan = await planLVCollection.find(query, options).toArray();
    let planLV: PlanLV[] = [];
    plan.forEach((val) => {
      planLV.push({
        ...val,
        _id: val._id instanceof ObjectId ? val._id.toHexString() : val._id,
      });
    });
    mongoClient.close();
    return {
      props: { planLV },
    };
  } catch (e) {
    console.error(e);
    mongoClient.close();
    return {
      props: { planLV: [] },
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

export default function PatrolLV({ planLV }: { planLV: PlanLV[] }) {
  const [changePlanRequire, setChangePlanRequire] = useState<ChangePlanLV>({
    plan_id: "",
    newPlan: {
      peaNo: "",
      feeder: "",
      distanceCircuit: 0,
    },
    oldPlan: {
      peaNo: "",
      feeder: "",
      distanceCircuit: 0,
    },
    reason: "",
  });

  const [plan, setPlan] = useState(planLV);

  const reducer = useCallback(
    (
      state: {
        plan: PlanLV[];
        page: number;
        peaNoFilter: string;
        totalPage: number;
      },
      action: {
        page: number;
        plan: PlanLV[];
        peaNoFilter: string;
        deletePeaNo?: string;
      },
    ) => {
      let p = action.plan;
      if (action.deletePeaNo) {
        p = p.filter((val) => {
          return val.peaNo != action.deletePeaNo;
        });
        setPlan(p);
      }
      if (action.peaNoFilter != "") {
        p = p.filter((val) => {
          return val.peaNo.match(action.peaNoFilter);
        });
      }
      return {
        plan: p.slice(action.page * 10 - 10, action.page * 10),
        page: action.page,
        peaNoFilter: action.peaNoFilter,
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
    plan: plan.slice(1, 10),
    page: 1,
    peaNoFilter: "",
    totalPage: Math.round(planLV.length / 10),
  });

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch({ page: value, plan, peaNoFilter: state.peaNoFilter });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await fetch("/api/plan-lv/request-change-plan", {
      method: "POST",
      body: JSON.stringify(changePlanRequire),
    });

    if (res.status != 200) {
      setSnackBar({ sevirity: "error", massege: "เกิดข้อผิดพลาด", open: true });
      return;
    }

    setSnackBar({ sevirity: "success", massege: "สำเร็จ", open: true });

    setOpenDialog(false);
    dispatch({
      page: state.page,
      plan,
      peaNoFilter: state.peaNoFilter,
      deletePeaNo: changePlanRequire.oldPlan.peaNo,
    });
  };

  return (
    <div className="h-full">
      <TextField
        sx={{ maxWidth: "100%" }}
        label="กรองตาม PEA NO."
        variant="outlined"
        onChange={(e) => {
          dispatch({ page: 1, plan, peaNoFilter: e.target.value });
        }}
      ></TextField>
      {state.plan.length == 0 ? (
        <Accordion>
          <AccordionSummary aria-controls="no-data-content" id="no-data-header">
            <Typography sx={{ margin: "auto 0" }}>ไม่พบแผนงาน</Typography>
          </AccordionSummary>
        </Accordion>
      ) : (
        state.plan.map((val, i) => {
          return (
            <div key={i}>
              <Accordion expanded={expanded === val.peaNo}>
                <AccordionSummary
                  aria-controls={`${val.peaNo}-content`}
                  id={`${val.peaNo}-header`}
                >
                  <Typography
                    onMouseOver={() => setExpanded(val.peaNo)}
                    sx={{ margin: "auto 0" }}
                  >
                    {val.peaNo}
                  </Typography>
                  <Button
                    sx={{ marginLeft: "auto" }}
                    onClick={() => {
                      setOpenDialog(true);
                      setChangePlanRequire({
                        plan_id: val._id as string,
                        oldPlan: {
                          peaNo: val.peaNo,
                          feeder: val.feeder ? val.feeder : "",
                          distanceCircuit: val.distanceCircuit
                            ? val.distanceCircuit
                            : 0,
                        },
                        newPlan: {
                          peaNo: val.peaNo,
                          feeder: val.feeder ? val.feeder : "",
                          distanceCircuit: val.distanceCircuit
                            ? val.distanceCircuit
                            : 0,
                        },
                        reason: "",
                      });
                    }}
                  >
                    {" "}
                    เปลี่ยนแผนงาน{" "}
                  </Button>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    <span>ฟีดเดอร์ที่เกาะ : {val.feeder}</span> <br />
                    <span>ระยะทาง : {val.distanceCircuit} วงจร-กม.</span> <br />
                    <span>กฟฟ. : {val.businessName}</span> <br />
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </div>
          );
        })
      )}
      <Pagination
        count={state.totalPage}
        page={state.page}
        onChange={handleChange}
      />
      <ChangePlanLVFormDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        handleSubmit={handleSubmit}
        changePlanRequire={changePlanRequire}
        setChangePlanRequire={setChangePlanRequire}
        setSnackBar={setSnackBar}
        snackBar={snackBar}
        defaultValOldPlan={true}
      />
      <AlertSnackBar snackBar={snackBar} setSnackBar={setSnackBar} />
    </div>
  );
}

const checkInvalidator = (changePlanRequire: ChangePlanLV) => {
  if (Number(changePlanRequire.newPlan.distanceCircuit) <= 0) {
    return true;
  }
  if (!/^[A-Z]{3}\d{2}$/.test(changePlanRequire.newPlan.feeder)) {
    return true;
  }
  if (!/^\d{2}-\d{6}$/.test(changePlanRequire.newPlan.peaNo)) {
    return true;
  }
  if (changePlanRequire.reason == "") {
    return true;
  }
  return false;
};
