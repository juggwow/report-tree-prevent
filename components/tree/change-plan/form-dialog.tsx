import plan from "@/pages/plan-lv/plan";
import { ChangePlanLV } from "@/types/plan-lv";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { AlertSnackBarType } from "@/types/snack-bar";
import {
  FormAddPlanTree,
  FormCancelPlanTree,
  FormChangePlanTree,
  HireNormal,
  HireSpecial,
  SelfProceed,
} from "@/types/report-tree";

export default function ChangePlanTreeFormDialog({
  openDialog,
  setOpenDialog,
  handleSubmit,
  changePlanRequire,
  setChangePlanRequire,
  snackBar,
  setSnackBar,
  defaultValOldPlan,
}: {
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: (e: any) => Promise<void>;
  changePlanRequire: FormChangePlanTree | FormAddPlanTree | FormCancelPlanTree;
  setChangePlanRequire: React.Dispatch<
    React.SetStateAction<
      FormChangePlanTree | FormAddPlanTree | FormCancelPlanTree
    >
  >;
  snackBar: AlertSnackBarType;
  setSnackBar: React.Dispatch<React.SetStateAction<AlertSnackBarType>>;
  defaultValOldPlan: Boolean;
}) {
  let monthValue = {
    label: "",
    month: "",
  };

  let hireValue: HireValue = {
    label: "จ้างเหมาปกติ",
    hireType: "normal",
  };

  if (
    changePlanRequire.typeReq == "add" ||
    changePlanRequire.typeReq == "change"
  ) {
    for (const val of month) {
      if (val.month == changePlanRequire.newPlan.month) {
        monthValue = {
          label: val.label,
          month: changePlanRequire.newPlan.month,
        };
        break;
      }
    }

    for (const val of hireOption) {
      if (val.hireType == changePlanRequire.newPlan.hireType) {
        hireValue = {
          label: val.label,
          hireType: changePlanRequire.newPlan.hireType,
        };
      }
    }
  }

  return (
    <Dialog
      open={openDialog}
      onClose={() => setOpenDialog(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {changePlanRequire.typeReq == "cancel"
          ? "เหตุผลการยกเลิกแผนงาน"
          : undefined}{" "}
        <br />
        {changePlanRequire.typeReq == "change"
          ? `ข้อมูลขอเปลี่ยนแปลงแผนงาน ${changePlanRequire.oldPlan!.planName}`
          : undefined}{" "}
        <br />
        {changePlanRequire.typeReq == "add"
          ? "ข้อมูลขอเพิ่มแผนงาน"
          : undefined}{" "}
        <br />
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <DialogContentText id="alert-dialog-form">
            {changePlanRequire.typeReq == "add" ||
            changePlanRequire.typeReq == "change" ? (
              <>
                <TextField
                  size="small"
                  sx={{ margin: "0.5rem 0 0 0", width: "90%" }}
                  required
                  id="outlined-required"
                  label={`ชื่อแผนงาน`}
                  value={changePlanRequire.newPlan.planName}
                  onChange={(e) =>
                    setChangePlanRequire({
                      ...changePlanRequire,
                      newPlan: {
                        ...changePlanRequire.newPlan!,
                        planName: e.target.value,
                      },
                    })
                  }
                  error={
                    changePlanRequire.newPlan.planName == "" ? true : false
                  }
                />
                <Autocomplete
                  size="small"
                  disablePortal
                  value={hireValue}
                  id="combo-box-demo"
                  options={hireOption}
                  sx={{ margin: "0.5rem 0 0 0", width: "100%" }}
                  renderInput={(params) => (
                    <TextField {...params} required label="การดำเนินการ" />
                  )}
                  onChange={(e, v) => {
                    let hireType: "self" | "normal" | "special";
                    !v || !v.hireType
                      ? (hireType = "normal")
                      : (hireType = v.hireType);
                    let hire: SelfProceed | HireNormal | HireSpecial;
                    switch (hireType) {
                      case "normal":
                        hire = {
                          hireType: "normal",
                          quantity: {
                            plentifully: 0,
                            moderate: 0,
                            lightly: 0,
                            clear: 0,
                          },
                        };
                        break;
                      case "self":
                        hire = {
                          hireType: "self",
                          quantity: {
                            distance: 0,
                          },
                        };
                        break;
                      case "special": {
                        hire = {
                          hireType: "special",
                          quantity: {
                            discription: "",
                          },
                        };
                      }
                    }

                    setChangePlanRequire({
                      ...changePlanRequire,
                      newPlan: {
                        ...changePlanRequire.newPlan,
                        ...hire,
                      },
                    });
                  }}
                />
                {changePlanRequire.newPlan.hireType == "special" && (
                  <>
                    <TextField
                      size="small"
                      sx={{ margin: "0.5rem 0 0 0" }}
                      id="outlined-required"
                      label={`ปริมาณงานโดยสังเขป`}
                      value={changePlanRequire.newPlan.quantity.discription}
                      onChange={(e) => {
                        if (changePlanRequire.newPlan.hireType == "special") {
                          setChangePlanRequire({
                            ...changePlanRequire,
                            newPlan: {
                              ...changePlanRequire.newPlan!,
                              quantity: {
                                ...changePlanRequire.newPlan.quantity,
                                discription: e.target.value,
                              },
                            },
                          });
                        }
                      }}
                    />
                  </>
                )}
                {changePlanRequire.newPlan.hireType == "self" && (
                  <>
                    <TextField
                      size="small"
                      sx={{ margin: "0.5rem 0 0 0" }}
                      id="outlined-required"
                      label={`ระยะทาง`}
                      value={changePlanRequire.newPlan.quantity.distance}
                      onChange={(e) => {
                        if (
                          (/^\d+\.?\d{0,2}$/.test(e.target.value) ||
                            e.target.value == "") &&
                          changePlanRequire.newPlan.hireType == "self"
                        ) {
                          setChangePlanRequire({
                            ...changePlanRequire,
                            newPlan: {
                              ...changePlanRequire.newPlan!,
                              quantity: {
                                ...changePlanRequire.newPlan.quantity,
                                distance: e.target.value,
                              },
                            },
                          });
                        }
                      }}
                    />
                  </>
                )}
                {changePlanRequire.newPlan.hireType == "normal" && (
                  <>
                    <TextField
                      size="small"
                      sx={{ margin: "0.5rem 0 0 0" }}
                      id="outlined-required"
                      label={`หนาแน่น`}
                      value={changePlanRequire.newPlan.quantity.plentifully}
                      onChange={(e) => {
                        if (
                          (/^\d+\.?\d{0,2}$/.test(e.target.value) ||
                            e.target.value == "") &&
                          changePlanRequire.newPlan?.hireType == "normal"
                        ) {
                          setChangePlanRequire({
                            ...changePlanRequire,
                            newPlan: {
                              ...changePlanRequire.newPlan!,
                              quantity: {
                                ...changePlanRequire.newPlan.quantity,
                                plentifully: e.target.value,
                              },
                            },
                          });
                        }
                      }}
                    />
                    <TextField
                      size="small"
                      sx={{ margin: "0.5rem 0 0 0" }}
                      id="outlined-required"
                      label={`ปานกลาง`}
                      value={changePlanRequire.newPlan.quantity.moderate}
                      onChange={(e) => {
                        if (
                          (/^\d+\.?\d{0,2}$/.test(e.target.value) ||
                            e.target.value == "") &&
                          changePlanRequire.newPlan?.hireType == "normal"
                        ) {
                          setChangePlanRequire({
                            ...changePlanRequire,
                            newPlan: {
                              ...changePlanRequire.newPlan!,
                              quantity: {
                                ...changePlanRequire.newPlan.quantity,
                                moderate: e.target.value,
                              },
                            },
                          });
                        }
                      }}
                    />
                    <TextField
                      size="small"
                      sx={{ margin: "0.5rem 0 0 0" }}
                      id="outlined-required"
                      label={`เบาบาง`}
                      value={changePlanRequire.newPlan.quantity.lightly}
                      onChange={(e) => {
                        if (
                          (/^\d+\.?\d{0,2}$/.test(e.target.value) ||
                            e.target.value == "") &&
                          changePlanRequire.newPlan?.hireType == "normal"
                        ) {
                          setChangePlanRequire({
                            ...changePlanRequire,
                            newPlan: {
                              ...changePlanRequire.newPlan,
                              quantity: {
                                ...changePlanRequire.newPlan.quantity,
                                lightly: e.target.value,
                              },
                            },
                          });
                        }
                      }}
                    />
                    <TextField
                      size="small"
                      sx={{ margin: "0.5rem 0 0 0" }}
                      id="outlined-required"
                      label={`โล่ง`}
                      value={changePlanRequire.newPlan.quantity.clear}
                      onChange={(e) => {
                        if (
                          (/^\d+\.?\d{0,2}$/.test(e.target.value) ||
                            e.target.value == "") &&
                          changePlanRequire.newPlan?.hireType == "normal"
                        ) {
                          setChangePlanRequire({
                            ...changePlanRequire,
                            newPlan: {
                              ...changePlanRequire.newPlan,
                              quantity: {
                                ...changePlanRequire.newPlan.quantity,
                                clear: e.target.value,
                              },
                            },
                          });
                        }
                      }}
                    />
                  </>
                )}
                <TextField
                  size="small"
                  sx={{ margin: "0.5rem 0 0 0" }}
                  id="outlined-required"
                  label={`งบประมาณ (บาท)`}
                  value={changePlanRequire.newPlan.budget}
                  onChange={(e) => {
                    if (
                      /^\d+\.?\d{0,2}$/.test(e.target.value) ||
                      e.target.value == ""
                    ) {
                      setChangePlanRequire({
                        ...changePlanRequire,
                        newPlan: {
                          ...changePlanRequire.newPlan,
                          budget: e.target.value,
                        },
                      });
                    }
                  }}
                />
                <Autocomplete
                  size="small"
                  disablePortal
                  value={monthValue}
                  id="combo-box-demo"
                  options={month}
                  sx={{ margin: "0.5rem 0 0 0", width: "100%" }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      error={changePlanRequire.newPlan!.month == ""}
                      label="แผนงานเดือน "
                    />
                  )}
                  onChange={(e, v) => {
                    let month: string;
                    v ? (month = v.month) : (month = "");
                    setChangePlanRequire({
                      ...changePlanRequire,
                      newPlan: {
                        ...changePlanRequire.newPlan!,
                        month: month,
                      },
                    });
                  }}
                />
                <Autocomplete
                  size="small"
                  disablePortal
                  value={changePlanRequire.newPlan.systemVolt}
                  id="combo-box-demo"
                  options={["115kV", "33kV", "400/230V"]}
                  sx={{ margin: "0.5rem 0 0 0", width: "100%" }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      error={changePlanRequire.newPlan!.systemVolt == ""}
                      label="ระดับแรงดันของแผนงาน "
                    />
                  )}
                  onChange={(e, v) => {
                    let systemVolt: string;
                    v ? (systemVolt = v) : (systemVolt = "");
                    setChangePlanRequire({
                      ...changePlanRequire,
                      newPlan: {
                        ...changePlanRequire.newPlan!,
                        systemVolt,
                      },
                    });
                  }}
                />
              </>
            ) : undefined}

            <TextField
              size="small"
              sx={{ margin: "0.5rem 0 0 0" }}
              required
              id="outlined-required"
              label="เหตุผล"
              value={changePlanRequire.reason}
              onChange={(e) =>
                setChangePlanRequire({
                  ...changePlanRequire,
                  reason: e.target.value,
                })
              }
              error={changePlanRequire.reason == ""}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setOpenDialog(false)}>
            ยกเลิก
          </Button>
          <div
            className="p-0 m-0"
            onMouseOver={() =>
              checkInvalidator(changePlanRequire)
                ? setSnackBar({
                    open: true,
                    sevirity: "error",
                    massege:
                      'ไม่สามารถกด "ยืนยัน" ได้ เนื่องจากรูปแบบข้อมูลของคูณไม่ถูกต้อง โปรดแก้ไข',
                  })
                : undefined
            }
          >
            <Button
              disabled={checkInvalidator(changePlanRequire)}
              type="submit"
              autoFocus
            >
              ยืนยัน
            </Button>
          </div>
        </DialogActions>
      </form>
    </Dialog>
  );
}

const checkInvalidator = (
  changePlanRequire: FormChangePlanTree | FormAddPlanTree | FormCancelPlanTree,
) => {
  if (changePlanRequire.typeReq != "cancel") {
    if (!changePlanRequire.newPlan) {
      return true;
    }

    if (Number(changePlanRequire.newPlan.budget) < 0) {
      return true;
    }

    if (changePlanRequire.newPlan.month == "") {
      return true;
    }

    if (changePlanRequire.newPlan.systemVolt == "") {
      return true;
    }

    if (changePlanRequire.newPlan.planName == "") {
      return true;
    }
  }

  if (changePlanRequire.reason == "") {
    return true;
  }

  return false;
};

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

const hireOption: HireValue[] = [
  { label: "จ้างเหมาปกติ", hireType: "normal" },
  { label: "จ้างเหมาลักษณะพิเศษ", hireType: "special" },
  { label: "กฟภ.ดำเนินการ", hireType: "self" },
];

type HireValue = {
  label: string;
  hireType?: "normal" | "special" | "self";
};
