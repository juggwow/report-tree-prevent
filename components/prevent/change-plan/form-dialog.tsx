import { ChangePlanRequirePrevent, snackBar } from "@/types/report-prevent";
import { SelfProceed, HireNormal, HireSpecial } from "@/types/report-tree";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  Autocomplete,
  DialogActions,
  Button,
} from "@mui/material";

export default function ChangePlanPreventFormDialog({
  openDialog,
  setOpenDialog,
  handleSubmit,
  changePlanRequire,
  setChangePlanRequire,
  setSnackBar,
  snackBar,
}: {
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: (e: any) => Promise<void>;
  changePlanRequire: ChangePlanRequirePrevent;
  setChangePlanRequire: React.Dispatch<
    React.SetStateAction<ChangePlanRequirePrevent>
  >;
  setSnackBar: React.Dispatch<React.SetStateAction<snackBar>>;
  snackBar: snackBar;
}) {
  return (
    <Dialog
      open={openDialog}
      onClose={() => setOpenDialog(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {changePlanRequire.typeReq == "cancel" && "เหตุผลการยกเลิกแผนงาน"}
        <br />
        {changePlanRequire.typeReq == "change" &&
          `ข้อมูลขอเปลี่ยนแปลงแผนงาน ${changePlanRequire.oldPlan!.planName}`}
        <br />
        {changePlanRequire.typeReq == "add" && "ข้อมูลขอเพิ่มแผนงาน"}
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
                  value={changePlanRequire.newPlan.typePrevent}
                  id="combo-box-demo"
                  options={typePrevent}
                  sx={{ margin: "0.5rem 0 0 0", width: "100%" }}
                  renderInput={(params) => (
                    <TextField {...params} required label="ประเภทแผนงาน" />
                  )}
                  onChange={(e, v) => {
                    let type = "";
                    if (!v || v == "") {
                      type = "ติดตั้งอุปกรณ์ป้องกันสัตว์";
                    } else {
                      type = v;
                    }
                    setChangePlanRequire({
                      ...changePlanRequire,
                      newPlan: {
                        ...changePlanRequire.newPlan,
                        typePrevent: type,
                      },
                    });
                  }}
                />
                <TextField
                  size="small"
                  sx={{ margin: "0.5rem 0 0 0" }}
                  id="outlined-required"
                  label={`งบประมาณ (บาท)`}
                  value={changePlanRequire.newPlan.budget}
                  required
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
                  error={Number(changePlanRequire.newPlan.budget) <= 0}
                />
                <TextField
                  size="small"
                  sx={{ margin: "0.5rem 0 0 0", width: "90%" }}
                  required
                  id="outlined-required"
                  label={`ปริมาณงานโดยสังเขป`}
                  value={changePlanRequire.newPlan.breifQuantity}
                  onChange={(e) =>
                    setChangePlanRequire({
                      ...changePlanRequire,
                      newPlan: {
                        ...changePlanRequire.newPlan!,
                        breifQuantity: e.target.value,
                      },
                    })
                  }
                  error={
                    changePlanRequire.newPlan.breifQuantity == "" ? true : false
                  }
                />
                <TextField
                  size="small"
                  sx={{ margin: "0.5rem 0 0 0", width: "90%" }}
                  required
                  id="outlined-required"
                  label={`ช่วงเวลาดำเนินการ`}
                  value={changePlanRequire.newPlan.duration}
                  onChange={(e) =>
                    setChangePlanRequire({
                      ...changePlanRequire,
                      newPlan: {
                        ...changePlanRequire.newPlan!,
                        duration: e.target.value,
                      },
                    })
                  }
                  error={
                    changePlanRequire.newPlan.duration == "" ? true : false
                  }
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

const typePrevent = [
  "ติดตั้งอุปกรณ์ป้องกันสัตว์",
  "ทำป้ายเตือน,พ่นหมายเลขเสาไฟฟ้า, ทาสีเสาไฟฟ้า",
  "ฉีดน้ำล้างลูกถ้วย",
  "งานอื่นๆ (ทำผนังกั้นเสริมฐานเสาไฟฟ้า, แก้ไขค่ากราวด์ที่เกินมาตรฐาน ฯลฯ)",
];

const checkInvalidator = (
  changePlanRequire: ChangePlanRequirePrevent,
): boolean => {
  if (changePlanRequire.reason == "") {
    return true;
  }
  if (
    changePlanRequire.typeReq == "add" ||
    changePlanRequire.typeReq == "change"
  ) {
    if (
      changePlanRequire.newPlan.breifQuantity == "" ||
      changePlanRequire.newPlan.duration == "" ||
      changePlanRequire.newPlan.planName == ""
    ) {
      return true;
    }
    let budget = toBugetNumber(changePlanRequire.newPlan.budget);
    if (budget <= 0) {
      return true;
    }
  }
  return false;
};

const toBugetNumber = (budget: string | number): number => {
  if (typeof budget == "string") {
    budget = Number(budget);
  }
  return budget;
};
