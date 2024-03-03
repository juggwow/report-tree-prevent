import {
  ChangePlanWithStatus,
  FormAddPlanPreventWithStatus,
  FormCancelPlanPreventWithStatus,
  FormChangePlanPreventWithStatus,
  TotalBudgetEachTypePrevent,
} from "@/types/report-prevent";
import { Grid, Typography } from "@mui/material";
import { useMemo } from "react";

export default function PrintChangePlanPrevent({
  printPlan,
  budgets,
  version
}: {
  printPlan: ChangePlanWithStatus[];
  budgets: TotalBudgetEachTypePrevent[];
  version: string
}) {
  const addType: FormAddPlanPreventWithStatus[] = useMemo(() => {
    let arr: FormAddPlanPreventWithStatus[] = [];
    printPlan.forEach((val) => {
      if (val.typeReq == "add") {
        arr.push(val);
      }
    });
    return arr;
  }, [printPlan]);

  const changeType: FormChangePlanPreventWithStatus[] = useMemo(() => {
    let arr: FormChangePlanPreventWithStatus[] = [];
    printPlan.forEach((val) => {
      if (val.typeReq == "change") {
        arr.push(val);
      }
    });
    return arr;
  }, [printPlan]);

  let cancelType: FormCancelPlanPreventWithStatus[] = useMemo(() => {
    let arr: FormCancelPlanPreventWithStatus[] = [];
    printPlan.forEach((val) => {
      if (val.typeReq == "cancel") {
        arr.push(val);
      }
    });
    return arr;
  }, [printPlan]);

  const typeBudget = useMemo(() => {
    let animal = {
      new: 0,
      old: 0,
      change: 0,
    };
    let paint = {
      new: 0,
      old: 0,
      change: 0,
    };
    let water = {
      new: 0,
      old: 0,
      change: 0,
    };
    let etc = {
      new: 0,
      old: 0,
      change: 0,
    };

    budgets.forEach((val) => {
      if (val._id.includes("สัตว์")) {
        animal.old = val.totalBudget;
      }
      if (val._id.includes("หมาย")) {
        paint.old = val.totalBudget;
      }
      if (val._id.includes("น้ำ")) {
        water.old = val.totalBudget;
      }
      if (val._id.includes("อื่น")) {
        etc.old = val.totalBudget;
      }
    });

    printPlan.forEach((val) => {
      if (val.typeReq == "add" || val.typeReq == "change") {
        if (val.newPlan.typePrevent.includes("สัตว์")) {
          animal.change = animal.change + Number(val.newPlan.budget);
        }
        if (val.newPlan.typePrevent.includes("หมาย")) {
          paint.change = paint.change + Number(val.newPlan.budget);
        }
        if (val.newPlan.typePrevent.includes("น้ำ")) {
          water.change = water.change + Number(val.newPlan.budget);
        }
        if (val.newPlan.typePrevent.includes("อื่น")) {
          etc.change = etc.change + Number(val.newPlan.budget);
        }
      }

      if (val.typeReq == "cancel" || val.typeReq == "change") {
        if (val.oldPlan.typePrevent.includes("สัตว์")) {
          animal.change = animal.change - Number(val.oldPlan.budget);
        }
        if (val.oldPlan.typePrevent.includes("หมาย")) {
          paint.change = paint.change - Number(val.oldPlan.budget);
        }
        if (val.oldPlan.typePrevent.includes("น้ำ")) {
          water.change = water.change - Number(val.oldPlan.budget);
        }
        if (val.oldPlan.typePrevent.includes("อื่น")) {
          etc.change = etc.change - Number(val.oldPlan.budget);
        }
      }
    });

    animal.new = animal.old + animal.change;
    paint.new = paint.old + paint.change;
    water.new = water.old + water.change;
    etc.new = etc.old + etc.change;

    return { animal, paint, water, etc };
  }, [printPlan, budgets]);

  return (
    <div className="hidden" id="printable-content" style={{ width: "24cm" }}>
      <Grid container sx={{ marginTop: "16pt" }}>
        <Grid item xs={12} sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <Typography sx={{ fontSize: "16pt" }}>
            เอกสารแนบ สรุปขอเปลี่ยนแปลง / เพิ่ม / ยกเลิกแผนงานงบป้องกันระบบไฟฟ้า
          </Typography>
          <Typography sx={{ fontSize: "8pt" }}>ver: {version}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography sx={{ fontSize: "14pt", marginTop: "8pt" }}>
            สรุปจำนวนการขอเปลี่ยนแปลง/ เพิ่ม / ยกเลิกแผนงาน
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            จำนวนที่ขอเพิ่ม: {addType.length} แผนงาน
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            จำนวนที่ขอเปลี่ยน: {changeType.length} แผนงาน
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            จำนวนที่ขอยกเลิก: {cancelType.length} แผนงาน
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography sx={{ fontSize: "14pt", marginTop: "8pt" }}>
            สรุปงบประมาณจากการเปลี่ยนแปลง/ เพิ่ม/ ยกเลิก แผนงาน
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography sx={{ fontSize: "14pt", marginTop: "8pt" }}>
            ติดตั้งอุปกรณ์ป้องกันสัตว์
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณเดิม:{" "}
            {typeBudget.animal.old.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณใหม่:{" "}
            {typeBudget.animal.new.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            เปลี่ยนแปลง:{" "}
            {typeBudget.animal.change.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography sx={{ fontSize: "14pt", marginTop: "8pt" }}>
            ทำป้ายเตือน,พ่นหมายเลขเสาไฟฟ้า, ทาสีเสาไฟฟ้า
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณเดิม:{" "}
            {typeBudget.paint.old.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณใหม่:{" "}
            {typeBudget.paint.new.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            เปลี่ยนแปลง:{" "}
            {typeBudget.paint.change.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography sx={{ fontSize: "14pt", marginTop: "8pt" }}>
            ฉีดน้ำล้างลูกถ้วย
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณเดิม:{" "}
            {typeBudget.water.old.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณใหม่:{" "}
            {typeBudget.water.new.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            เปลี่ยนแปลง:{" "}
            {typeBudget.water.change.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography sx={{ fontSize: "14pt", marginTop: "8pt" }}>
            งานอื่นๆ (ทำผนังกั้นเสริมฐานเสาไฟฟ้า, แก้ไขค่ากราวด์ที่เกินมาตรฐาน
            ฯลฯ)
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณเดิม:{" "}
            {typeBudget.etc.old.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณใหม่:{" "}
            {typeBudget.etc.new.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            เปลี่ยนแปลง:{" "}
            {typeBudget.etc.change.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography sx={{ fontSize: "14pt", marginTop: "8pt" }}>
            รวม
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณเดิม:{" "}
            {(typeBudget.animal.old+typeBudget.etc.old+typeBudget.paint.old+typeBudget.water.old).toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณใหม่:{" "}
            {(typeBudget.animal.new+typeBudget.etc.new+typeBudget.paint.new+typeBudget.water.new).toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            เปลี่ยนแปลง:{" "}
            {(typeBudget.animal.change+typeBudget.etc.change+typeBudget.paint.change+typeBudget.water.change).toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        {changeType.length > 0 && (
          <>
            <Grid item xs={12}>
              <Typography sx={{ fontSize: "14pt", marginTop: "8pt" }}>
                รายการเปลี่ยนแปลงแผนงาน
              </Typography>
            </Grid>
            <Grid item xs={6} sx={{ border: "solid 1px", padding: "6pt" }}>
              <Typography sx={{ fontSize: "14pt" }}>แผนงานเดิม</Typography>
            </Grid>
            <Grid item xs={6} sx={{ border: "solid 1px", padding: "6pt" }}>
              <Typography sx={{ fontSize: "14pt" }}>แผนงานใหม่</Typography>
            </Grid>
            {changeType.map((val) => {
              return (
                <Grid
                  container
                  sx={{ margin: "0", padding: "0" }}
                  key={val._id as string}
                >
                  <Grid item xs={6} sx={{ border: "solid 1px" }}>
                    <Typography sx={{ fontSize: "14pt", padding: "6pt" }}>
                      <span>ชื่อแผนงาน: {val.oldPlan.planName}</span>
                      <br />
                      <span>ช่วงเวลาดำเนินการ: {val.oldPlan.duration}</span>
                      <br />
                      <span>
                        งบประมาณ:{" "}
                        {val.oldPlan.budget.toLocaleString("th-TH", {
                          style: "currency",
                          currency: "THB",
                        })}
                      </span>
                      <br />
                      <span>ประเภทงาน: {val.oldPlan.typePrevent}</span>
                      <br />
                      <span>
                        ปริมาณงานโดยสังเขป: {val.oldPlan.breifQuantity}
                      </span>
                      <br />
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ border: "solid 1px" }}>
                    <Typography sx={{ fontSize: "14pt", padding: "6pt" }}>
                      <span>ชื่อแผนงาน: {val.newPlan.planName}</span>
                      <br />
                      <span>ช่วงเวลาดำเนินการ: {val.newPlan.duration}</span>
                      <br />
                      <span>
                        งบประมาณ:{" "}
                        {val.newPlan.budget.toLocaleString("th-TH", {
                          style: "currency",
                          currency: "THB",
                        })}{" "}
                        บาท
                      </span>
                      <br />
                      <span>ประเภทงาน: {val.newPlan.typePrevent}</span>
                      <br />
                      <span>
                        ปริมาณงานโดยสังเขป: {val.newPlan.breifQuantity}
                      </span>
                      <br />
                      <span>เหตุผลในการขอเปลี่ยนแปลงแผนงาน: {val.reason}</span>
                    </Typography>
                  </Grid>
                </Grid>
              );
            })}
          </>
        )}

        {addType.length > 0 && (
          <Grid item xs={6}>
            <Typography sx={{ fontSize: "14pt", marginTop: "16pt" }}>
              รายการเพิ่มแผนงาน
            </Typography>
            {addType.map((val) => {
              return (
                <div key={val._id as string} className="m-0 p-0">
                  <Typography
                    sx={{
                      fontSize: "14pt",
                      border: "solid 1px",
                      padding: "6pt",
                      marginRight: "4pt",
                    }}
                  >
                    <span>ชื่อแผนงาน: {val.newPlan.planName}</span>
                    <br />
                    <span>ช่วงเวลาดำเนินการ: {val.newPlan.duration}</span>
                    <br />
                    <span>
                      งบประมาณ:{" "}
                      {val.newPlan.budget.toLocaleString("th-TH", {
                        style: "currency",
                        currency: "THB",
                      })}{" "}
                      บาท
                    </span>
                    <br />
                    <span>ประเภทงาน: {val.newPlan.typePrevent}</span>
                    <br />
                    <span>ปริมาณงานโดยสังเขป: {val.newPlan.breifQuantity}</span>
                    <br />
                    <span>เหตุผลในการขอเพิ่มแผนงาน: {val.reason}</span>
                  </Typography>
                </div>
              );
            })}
          </Grid>
        )}
        {cancelType.length > 0 && (
          <Grid item xs={6}>
            <Typography sx={{ fontSize: "14pt", marginTop: "16pt" }}>
              รายการยกเลิกแผนงาน
            </Typography>
            {cancelType.map((val) => {
              return (
                <div key={val._id as string} className="m-0 p-0">
                  <Typography
                    sx={{
                      fontSize: "14pt",
                      border: "solid 1px",
                      padding: "6pt",
                      marginLeft: "4pt",
                    }}
                  >
                    <span>ชื่อแผนงาน: {val.oldPlan.planName}</span>
                    <br />
                    <span>ช่วงเวลาดำเนินการ: {val.oldPlan.duration}</span>
                    <br />
                    <span>
                      งบประมาณ:{" "}
                      {val.oldPlan.budget.toLocaleString("th-TH", {
                        style: "currency",
                        currency: "THB",
                      })}
                    </span>
                    <br />
                    <span>ประเภทงาน: {val.oldPlan.typePrevent}</span>
                    <br />
                    <span>ปริมาณงานโดยสังเขป: {val.oldPlan.breifQuantity}</span>
                    <br />
                    <span>เหตุผลในการขอยกเลิกแผนงาน: {val.reason}</span>
                  </Typography>
                </div>
              );
            })}
          </Grid>
        )}
      </Grid>
    </div>
  );
}
