import clientPromise from "@/lib/mongodb";
import { Collection, ObjectId } from "mongodb";
import { getSession } from "next-auth/react";
import {
  useCallback,
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
  Pagination,
  TextField,
} from "@mui/material";
import AlertSnackBar from "@/components/alert-snack-bar";
import { AlertSnackBarType } from "@/types/snack-bar";
import ChangePlanTreeFormDialog from "@/components/tree/change-plan/form-dialog";
import {  FormChangePlanTree } from "@/types/report-tree";

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
    const mongoClient = await clientPromise;

    const planLVCollection: Collection<FormChangePlanTree> = mongoClient
      .db("tree")
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
        _id:1,
        oldPlan:{
            planName: "$planName",
            qauntity: "$qauntity",
            budget: "$budget",
            systemVolt: "$systemVolt",
            month: "$month",
            hireType: "$hireType",
        }
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

export default function ChangePlanTree({ planTree }: { planTree: FormChangePlanTree[] }) {
  const [changePlanRequire, setChangePlanRequire] = useState<FormChangePlanTree>({
    _id: "",
    oldPlan: {
        planName: "",
        qauntity: {
            plentifully: 0,
            moderate: 0,
            lightly: 0,
            clear: 0
        },
        budget: 0,
        systemVolt: "33kV",
        month: "",
        hireType: "normal"
    },
    newPlan: {
        planName: "",
        qauntity: {
            plentifully: 0,
            moderate: 0,
            lightly: 0,
            clear: 0
        },
        budget: 0,
        systemVolt: "33kV",
        month: "",
        hireType: "normal"
    },
    typeReq: "change"
  });

  console.log(changePlanRequire)

  const [plan, setPlan] = useState(planTree);
  const [defaultValOld,setDefaultValOld] = useState(true)

  const reducer = useCallback(
    (
      state: {
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
          return val._id as string != action.deletePlan;
        });
        setPlan(p);
      }
      if (action.planFilter.planName != "") {
        p = p.filter((val) => {
          return val.oldPlan!.planName.match(action.planFilter.planName) ;
        });
      }
      if (action.planFilter.month != "") {
        p = p.filter((val) => {
          return val.oldPlan!.month == action.planFilter.month ;
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
        planName: '',
        month: ""
    },
    totalPage: Math.round(planTree.length / 10),
  });

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch({ page: value, plan, planFilter: state.planFilter });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await fetch("/api/tree/request-change-plan", {
      method: "POST",
      body: JSON.stringify(changePlanRequire),
    });

    if (res.status != 200) {
      setSnackBar({ sevirity: "error", massege: "เกิดข้อผิดพลาด", open: true });
      return;
    }

    setSnackBar({ sevirity: "success", massege: "สำเร็จ", open: true });

    setOpenDialog(false);
    if(["change" , "cancel"].includes(changePlanRequire.typeReq!)){
      dispatch({
        page: state.page,
        plan,
        planFilter: state.planFilter,
        deletePlan: changePlanRequire._id as string,
      });
    }
  };

  return (
    <div className="h-full">
      <Button onClick={()=>{
          setDefaultValOld(false)
          setChangePlanRequire({
            _id: "",
            reason: "",
            typeReq: "add",
            newPlan:{
              systemVolt: "",
              planName: "",
              budget: 0,
              month: "",
              hireType: "",
              qauntity:{
                plentifully: 0,
                moderate: 0,
                lightly: 0,
                clear: 0
              }
            }
          })
          setOpenDialog(true)
      }}>เพิ่มแผนงาน</Button>
      <TextField
        sx={{ maxWidth: "100%" }}
        label="กรองตาม PEA NO."
        variant="outlined"
        onChange={(e) => {
          dispatch({ page: 1, plan, planFilter: {...state.planFilter,planName: e.target.value} });
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
              <Accordion expanded={expanded === val._id}>
                <AccordionSummary 
                  aria-controls={`${val.oldPlan!.planName}-content`}
                  id={`${val.oldPlan!.planName}-header`}
                >
                  <Typography
                    onMouseOver={() => setExpanded(val._id as string)}
                    sx={{ margin: "auto 0" }}
                  >
                    {val.oldPlan!.planName}
                  </Typography>
                  <Button
                    sx={{ marginLeft: "auto" }}
                    onClick={() => {
                      setOpenDialog(true);
                      setChangePlanRequire({
                        _id: val._id as string,
                        oldPlan: val.oldPlan!,
                        newPlan: val.oldPlan!,
                        reason: "",
                        typeReq: "change"
                      });
                      setDefaultValOld(true)
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
                        
                      });
                    }}
                  >
                    {" "}
                    ยกเลิกแผนงาน{" "}
                  </Button>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    <span>ปริมาณงาน</span> <br />
                    <span>หนาแน่น: {val.oldPlan!.qauntity.plentifully}</span> <br />
                    <span>หนาแน่น: {val.oldPlan!.qauntity.moderate}</span> <br />
                    <span>หนาแน่น: {val.oldPlan!.qauntity.lightly}</span> <br />
                    <span>หนาแน่น: {val.oldPlan!.qauntity.clear}</span> <br />
                    <span>แผนงานเดือน : {val.oldPlan!.month}</span> <br />
                    <span>งบประมาณ: {val.oldPlan!.budget}</span> <br />
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
      <AlertSnackBar snackBar={snackBar} setSnackBar={setSnackBar} />
    </div>
  );
}


