import plan from "@/pages/plan-lv/plan";
import { ChangePlanLV } from "@/types/plan-lv";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";
import { AlertSnackBarType } from "@/types/snack-bar";

export default function ChangePlanLVFormDialog({
    openDialog,setOpenDialog,handleSubmit,changePlanRequire,setChangePlanRequire,snackBar,setSnackBar,defaultValOldPlan}:{
        openDialog:boolean,
        setOpenDialog:React.Dispatch<React.SetStateAction<boolean>>,
        handleSubmit:(e: any) => Promise<void>,
        changePlanRequire:ChangePlanLV,
        setChangePlanRequire:React.Dispatch<React.SetStateAction<ChangePlanLV>>,
        snackBar:AlertSnackBarType,
        setSnackBar:React.Dispatch<React.SetStateAction<AlertSnackBarType>>
        defaultValOldPlan:Boolean
    }){
        
  
    return(
        
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            ข้อมูลขอเปลี่ยนแปลงแผนงาน <br />
            {changePlanRequire.oldPlan.peaNo}
          </DialogTitle>
          <form
            onSubmit={handleSubmit}
          >
            <DialogContent>
              <DialogContentText id="alert-dialog-form">
                <TextField
                  sx={{ margin: "1rem 0 0 0" }}
                  required
                  id="outlined-required"
                  label={`PEA-NO (ของเดิม ${changePlanRequire.oldPlan.peaNo})`}
                  defaultValue={defaultValOldPlan?changePlanRequire.oldPlan.peaNo:changePlanRequire.newPlan.peaNo}
                  onChange={(e) =>
                    setChangePlanRequire({
                      ...changePlanRequire,
                      newPlan: {
                        ...changePlanRequire.newPlan,
                        peaNo: e.target.value   ,
                      },
                    })
                  }
                  error={!/^\d{2}-\d{6}$/.test(changePlanRequire.newPlan.peaNo)}
                  helperText={`ตัวอย่าง รูปแบบ PEA NO. 12-123456, PEA NO. เดิม: ${changePlanRequire.oldPlan.peaNo}`}
                />
                <TextField
                  sx={{ margin: "1rem 0 0 0" }}
                  required
                  id="outlined-required"
                  label={`Feeder แรงสูงที่เกาะ (ของเดิม ${changePlanRequire.oldPlan.feeder})`}
                  defaultValue={defaultValOldPlan?changePlanRequire.oldPlan.feeder:changePlanRequire.newPlan.feeder}
                  onChange={(e) =>
                    setChangePlanRequire({
                      ...changePlanRequire,
                      newPlan: {
                        ...changePlanRequire.newPlan,
                        feeder: e.target.value,
                      },
                    })
                  }
                  error={
                    !/^[A-Z]{3}\d{2}$/.test(changePlanRequire.newPlan.feeder)
                  }
                  helperText={`ตัวอย่าง รูปแบบ Feeder XYZ01, Feeder ที่เกาะเดิม: ${changePlanRequire.oldPlan.feeder}`}
                />
                <TextField
                  type="number"
                  sx={{ margin: "1rem 0 0 0" }}
                  required
                  id="outlined-required"
                  label={`ความยาวระบบ (วงจร-กม.) (ของเดิม ${changePlanRequire.oldPlan.distanceCircuit} วงจร-กม.)`}
                  defaultValue={defaultValOldPlan?changePlanRequire.oldPlan.distanceCircuit:changePlanRequire.newPlan.distanceCircuit}
                  onChange={(e) =>
                    setChangePlanRequire({
                      ...changePlanRequire,
                      newPlan: {
                        ...changePlanRequire.newPlan,
                        distanceCircuit: e.target.value,
                      },
                    })
                  }
                  error={Number(changePlanRequire.newPlan.distanceCircuit) <= 0}
                  helperText={`ความยาวต้องมากกว่า 0 วงจร-กม., ความยาวเดิม: ${changePlanRequire.oldPlan.distanceCircuit}`}
                />
                <TextField
                  sx={{ margin: "1rem 0 0 0" }}
                  required
                  id="outlined-required"
                  label="เหตุผลในการเปลี่ยนแผนงาน"
                  defaultValue={defaultValOldPlan?"":changePlanRequire.reason}
                  onChange={(e) =>
                    setChangePlanRequire({
                      ...changePlanRequire,
                      reason: e.target.value
                    })
                  }
                  error={changePlanRequire.reason == ''}
                  helperText="เช่น สัปเปลี่ยนหม้อแปลง หม้อแปลงผู้ใช้ไฟ เป็นต้น"
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
    )
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
    if(changePlanRequire.reason == ''){
      return true;
    }
    return false;
  };