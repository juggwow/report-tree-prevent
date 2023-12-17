import plan from "@/pages/plan-lv/plan";
import { ChangePlanLV } from "@/types/plan-lv";
import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, TextField } from "@mui/material";
import { useState } from "react";
import { AlertSnackBarType } from "@/types/snack-bar";
import { FormChangePlanTree } from "@/types/report-tree";

export default function ChangePlanTreeFormDialog({
    openDialog,setOpenDialog,handleSubmit,changePlanRequire,setChangePlanRequire,snackBar,setSnackBar,defaultValOldPlan}:{
        openDialog:boolean,
        setOpenDialog:React.Dispatch<React.SetStateAction<boolean>>,
        handleSubmit:(e: any) => Promise<void>,
        changePlanRequire:FormChangePlanTree,
        setChangePlanRequire:React.Dispatch<React.SetStateAction<FormChangePlanTree>>,
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
          {changePlanRequire.typeReq == 'cancel'?'เหตุผลการยกเลิกแผนงาน':undefined} <br />
          {changePlanRequire.typeReq == 'change'?`ข้อมูลขอเปลี่ยนแปลงแผนงาน ${changePlanRequire.oldPlan!.planName}`:undefined} <br />
            
            {changePlanRequire.typeReq == 'add'?'ข้อมูลขอเพิ่มแผนงาน':undefined} <br />
          </DialogTitle>
          <form
            onSubmit={handleSubmit}
          >
            <DialogContent>
              <DialogContentText id="alert-dialog-form">
                {changePlanRequire.typeReq!="cancel"?(<><TextField
                size="small"
                  sx={{ margin: "0.5rem 0 0 0",width:"90%" }}
                  required
                  id="outlined-required"
                  label={`ชื่อแผนงาน`}
                  defaultValue={ defaultValOldPlan?changePlanRequire.oldPlan!.planName:changePlanRequire.newPlan!.planName}
                  onChange={(e) =>
                    setChangePlanRequire({
                      ...changePlanRequire,
                      newPlan: {
                        ...changePlanRequire.newPlan!,
                        planName: e.target.value   ,
                      },
                    })
                  }
                  error={changePlanRequire.newPlan!.planName==''?true:false}
                />
                <TextField
                size="small"
                  type="number"
                  sx={{ margin: "0.5rem 0 0 0" }}
                  id="outlined-required"
                  label={`หนาแน่น`}
                  defaultValue={defaultValOldPlan?changePlanRequire.oldPlan!.qauntity.plentifully:changePlanRequire.newPlan!.qauntity!.plentifully}
                  onChange={(e) =>
                    setChangePlanRequire({
                      ...changePlanRequire,
                      newPlan: {
                        ...changePlanRequire.newPlan!,
                        qauntity:{
                            ...changePlanRequire.newPlan!.qauntity,
                            plentifully: Number(e.target.value)
                        },
                      },    
                    })
                  }
                />
                <TextField
                size="small"
                type="number"
                sx={{ margin: "0.5rem 0 0 0" }}
                id="outlined-required"
                label={`ปานกลาง`}
                defaultValue={defaultValOldPlan?changePlanRequire.oldPlan!.qauntity.moderate:changePlanRequire.newPlan!.qauntity!.moderate}
                onChange={(e) =>
                  setChangePlanRequire({
                    ...changePlanRequire,
                    newPlan: {
                      ...changePlanRequire.newPlan!,
                      qauntity:{
                          ...changePlanRequire.newPlan!.qauntity,
                          moderate: Number(e.target.value)
                      },
                    },    
                  })
                }
                />
                <TextField
                size="small"
                type="number"
                sx={{ margin: "0.5rem 0 0 0" }}
                id="outlined-required"
                label={`เบาบาง`}
                defaultValue={defaultValOldPlan?changePlanRequire.oldPlan!.qauntity.lightly:changePlanRequire.newPlan!.qauntity!.lightly}
                onChange={(e) =>
                  setChangePlanRequire({
                    ...changePlanRequire,
                    newPlan: {
                      ...changePlanRequire.newPlan!,
                      qauntity:{
                          ...changePlanRequire.newPlan!.qauntity,
                          lightly: Number(e.target.value)
                      },
                    },    
                  })
                }
                />
                <TextField
                size="small"
                type="number"
                sx={{ margin: "0.5rem 0 0 0" }}
                id="outlined-required"
                label={`โล่ง`}
                defaultValue={defaultValOldPlan?changePlanRequire.oldPlan!.qauntity.clear:changePlanRequire.newPlan!.qauntity!.clear}
                onChange={(e) =>
                  setChangePlanRequire({
                    ...changePlanRequire,
                    newPlan: {
                      ...changePlanRequire.newPlan!,
                      qauntity:{
                          ...changePlanRequire.newPlan!.qauntity,
                          clear: Number(e.target.value)
                      },
                    },    
                  })
                }
                />
                <TextField
                  size="small"
                  sx={{ margin: "0.5rem 0 0 0" }}
                  type="number"
                  required
                  id="outlined-required"
                  label={`งบประมาณ (บาท)`}
                  defaultValue={defaultValOldPlan?changePlanRequire.oldPlan?.budget:changePlanRequire.newPlan?.budget}
                  onChange={(e) =>
                    setChangePlanRequire({
                      ...changePlanRequire,
                      newPlan: {
                        ...changePlanRequire.newPlan!,
                        budget: Number(e.target.value),
                      },
                    })
                  }
                />
                <Autocomplete
                
                  size="small"
                  disablePortal
                  defaultValue={{label: defaultValOldPlan?changePlanRequire.oldPlan!.month:changePlanRequire.newPlan!.month,month: defaultValOldPlan?changePlanRequire.oldPlan!.month:changePlanRequire.newPlan!.month}}
                  id="combo-box-demo"
                  options={month}
                  sx={{ margin: "0.5rem 0 0 0",width: '100%' }}
                  renderInput={(params) => <TextField {...params} required error={changePlanRequire.newPlan!.month==''} label="แผนงานเดือน " />}
                  onChange={
                    (e,v)=>{
                      let month:string
                      v?month = v.month:month = ""
                      setChangePlanRequire({
                        ...changePlanRequire,
                        newPlan:{
                          ...changePlanRequire.newPlan!,
                          month: month
                      }
                    })}
                  }
                />
                <Autocomplete
                
                  size="small"
                  disablePortal
                  defaultValue={defaultValOldPlan?changePlanRequire.oldPlan!.systemVolt:changePlanRequire.newPlan!.systemVolt}
                  id="combo-box-demo"
                  options={["115kV","33kV","400/230V"]}
                  sx={{ margin: "0.5rem 0 0 0",width: '100%' }}
                  renderInput={(params) => <TextField {...params} required error={changePlanRequire.newPlan!.systemVolt==''} label="ระดับแรงดันของแผนงาน " />}
                  onChange={
                    (e,v)=>{
                      let systemVolt:string
                      v?systemVolt = v:systemVolt = ""
                      setChangePlanRequire({
                        ...changePlanRequire,
                        newPlan:{
                          ...changePlanRequire.newPlan!,
                          systemVolt
                      }
                    })}
                  }
                />
                <Autocomplete
                
                  size="small"
                  disablePortal
                  defaultValue={defaultValOldPlan?changePlanRequire.oldPlan!.hireType:changePlanRequire.newPlan!.hireType}
                  id="combo-box-demo"
                  options={["จ้างเหมาปกติ","จ้างเหมาลักษณะพิเศษ","กฟภ. ดำเนินการ"]}
                  sx={{ margin: "0.5rem 0 0 0",width: '100%' }}
                  renderInput={(params) => <TextField {...params} required error={changePlanRequire.newPlan!.hireType==''} label="การดำเนินการ" />}
                  onChange={
                    (e,v)=>{
                      let hireType:string
                      v?hireType = v:hireType = ""
                      setChangePlanRequire({
                        ...changePlanRequire,
                        newPlan:{
                          ...changePlanRequire.newPlan!,
                          hireType
                      }
                    })}
                  }
                /></>):undefined}
                
                <TextField
                size="small"
                  sx={{ margin: "0.5rem 0 0 0" }}
                  required
                  id="outlined-required"
                  label="เหตุผล"
                  defaultValue={defaultValOldPlan?"":changePlanRequire.reason}
                  onChange={(e) =>
                    setChangePlanRequire({
                      ...changePlanRequire,
                      reason: e.target.value
                    })
                  }
                  error={changePlanRequire.reason == ''}
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

const checkInvalidator = (changePlanRequire: FormChangePlanTree) => {
  if(changePlanRequire.typeReq != "cancel"){
    
    if (!changePlanRequire.newPlan){
      return true;
    }

    if(changePlanRequire.newPlan.budget == 0){
      return true
    }

    if(changePlanRequire.newPlan.hireType == ''){
      return true
    }

    if(changePlanRequire.newPlan.month == ''){
      return true
    }

    if(changePlanRequire.newPlan.systemVolt == ''){
      return true
    }

    if(changePlanRequire.newPlan.planName == ''){
      return true
    }
  }

  if(changePlanRequire.reason == ''){
    return true
  }

    return false;
};

const month = [
  {label:"มกราคม", month:"1"},
  {label:"กุมภาพันธ์", month:"2"},
  {label:"มีนาคม", month:"3"},
  {label:"เมษายน", month:"4"},
  {label:"พฤษภาคม", month:"5"},
  {label:"มิถุนายน", month:"6"},
  {label:"กรกฎาคม", month:"7"},
  {label:"สิงหาคม", month:"8"},
  {label:"กันยายน", month:"9"},
  {label:"ตุลาคม", month:"10"},
  {label:"พฤศจิกายน", month:"11"},
  {label:"ธันวาคม", month:"12"},

]

