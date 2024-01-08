import {
  FormChangePlanTree,
  FormAddPlanTree,
  FormCancelPlanTree,
  MonthTotalBudget,
} from "@/types/report-tree";
import { Grid, Typography } from "@mui/material";

export default function PrintChangePlanTree({
  printPlan,
  monthTotalBudget,
}: {
  printPlan: (FormChangePlanTree | FormAddPlanTree | FormCancelPlanTree)[];
  monthTotalBudget: MonthTotalBudget[];
}) {
  let budget = {
    new: 0,
    old: 0,
    change: 0,
  };
  let quarterBudget = {
    Q1: {
      new: 0,
      old: 0,
      change: 0,
    },
    Q2: {
      new: 0,
      old: 0,
      change: 0,
    },
    Q3: {
      new: 0,
      old: 0,
      change: 0,
    },
    Q4: {
      new: 0,
      old: 0,
      change: 0,
    },
  };
  let changeType: FormChangePlanTree[] = [];
  let addType: FormAddPlanTree[] = [];
  let cancelType: FormCancelPlanTree[] = [];
  printPlan.forEach((val) => {
    if (val.typeReq == "add") {
      addType.push(val);
      if (
        val.newPlan.month == "1" ||
        val.newPlan.month == "2" ||
        val.newPlan.month == "3"
      ) {
        quarterBudget.Q1.change =
          quarterBudget.Q1.change + Number(val.newPlan.budget);
      }
      if (
        val.newPlan.month == "4" ||
        val.newPlan.month == "5" ||
        val.newPlan.month == "6"
      ) {
        quarterBudget.Q2.change =
          quarterBudget.Q2.change + Number(val.newPlan.budget);
      }
      if (
        val.newPlan.month == "7" ||
        val.newPlan.month == "8" ||
        val.newPlan.month == "9"
      ) {
        quarterBudget.Q3.change =
          quarterBudget.Q3.change + Number(val.newPlan.budget);
      }
      if (
        val.newPlan.month == "10" ||
        val.newPlan.month == "11" ||
        val.newPlan.month == "12"
      ) {
        quarterBudget.Q3.change =
          quarterBudget.Q3.change + Number(val.newPlan.budget);
      }
      budget.change = budget.change + Number(val.newPlan.budget);
    }

    if (val.typeReq == "change") {
      changeType.push(val);
      if (
        val.newPlan.month == "1" ||
        val.newPlan.month == "2" ||
        val.newPlan.month == "3"
      ) {
        quarterBudget.Q1.change =
          quarterBudget.Q1.change + Number(val.newPlan.budget);
      }
      if (
        val.newPlan.month == "4" ||
        val.newPlan.month == "5" ||
        val.newPlan.month == "6"
      ) {
        quarterBudget.Q2.change =
          quarterBudget.Q2.change + Number(val.newPlan.budget);
      }
      if (
        val.newPlan.month == "7" ||
        val.newPlan.month == "8" ||
        val.newPlan.month == "9"
      ) {
        quarterBudget.Q3.change =
          quarterBudget.Q3.change + Number(val.newPlan.budget);
      }
      if (
        val.newPlan.month == "10" ||
        val.newPlan.month == "11" ||
        val.newPlan.month == "12"
      ) {
        quarterBudget.Q4.change =
          quarterBudget.Q4.change + Number(val.newPlan.budget);
      }

      if (
        val.oldPlan.month == "1" ||
        val.oldPlan.month == "2" ||
        val.oldPlan.month == "3"
      ) {
        quarterBudget.Q1.change =
          quarterBudget.Q1.change - Number(val.oldPlan.budget);
      }
      if (
        val.oldPlan.month == "4" ||
        val.oldPlan.month == "5" ||
        val.oldPlan.month == "6"
      ) {
        quarterBudget.Q2.change =
          quarterBudget.Q2.change - Number(val.oldPlan.budget);
      }
      if (
        val.oldPlan.month == "7" ||
        val.oldPlan.month == "8" ||
        val.oldPlan.month == "9"
      ) {
        quarterBudget.Q3.change =
          quarterBudget.Q3.change - Number(val.oldPlan.budget);
      }
      if (
        val.oldPlan.month == "10" ||
        val.oldPlan.month == "11" ||
        val.oldPlan.month == "12"
      ) {
        quarterBudget.Q4.change =
          quarterBudget.Q4.change - Number(val.oldPlan.budget);
      }
      budget.change = budget.change + Number(val.newPlan.budget);
      budget.change = budget.change - Number(val.oldPlan.budget);
    }

    if (val.typeReq == "cancel") {
      cancelType.push(val);
      if (
        val.oldPlan.month == "1" ||
        val.oldPlan.month == "2" ||
        val.oldPlan.month == "3"
      ) {
        quarterBudget.Q1.change =
          quarterBudget.Q1.change - Number(val.oldPlan.budget);
      }
      if (
        val.oldPlan.month == "4" ||
        val.oldPlan.month == "5" ||
        val.oldPlan.month == "6"
      ) {
        quarterBudget.Q2.change =
          quarterBudget.Q2.change - Number(val.oldPlan.budget);
      }
      if (
        val.oldPlan.month == "7" ||
        val.oldPlan.month == "8" ||
        val.oldPlan.month == "9"
      ) {
        quarterBudget.Q3.change =
          quarterBudget.Q3.change - Number(val.oldPlan.budget);
      }
      if (
        val.oldPlan.month == "10" ||
        val.oldPlan.month == "11" ||
        val.oldPlan.month == "12"
      ) {
        quarterBudget.Q4.change =
          quarterBudget.Q4.change - Number(val.oldPlan.budget);
      }
      budget.change = budget.change - Number(val.oldPlan.budget);
    }
  });
  monthTotalBudget.forEach((val) => {
    budget.old = budget.old + val.totalBudget;
    if (val.month == 1 || val.month == 2 || val.month == 3) {
      quarterBudget.Q1.old = quarterBudget.Q1.old + val.totalBudget;
    }
    if (val.month == 4 || val.month == 5 || val.month == 6) {
      quarterBudget.Q2.old = quarterBudget.Q2.old + val.totalBudget;
    }
    if (val.month == 7 || val.month == 8 || val.month == 9) {
      quarterBudget.Q3.old = quarterBudget.Q3.old + val.totalBudget;
    }
    if (val.month == 10 || val.month == 11 || val.month == 12) {
      quarterBudget.Q4.old = quarterBudget.Q4.old + val.totalBudget;
    }
  });
  budget.new = budget.old + budget.change;
  quarterBudget.Q1.new = quarterBudget.Q1.old + quarterBudget.Q1.change;
  quarterBudget.Q2.new = quarterBudget.Q2.old + quarterBudget.Q2.change;
  quarterBudget.Q3.new = quarterBudget.Q3.old + quarterBudget.Q3.change;
  quarterBudget.Q4.new = quarterBudget.Q4.old + quarterBudget.Q4.change;

  return (
    <div className="hidden" id="printable-content" style={{ width: "24cm" }}>
      <Grid container sx={{ marginTop: "16pt" }}>
        <Grid item xs={12}>
          <Typography sx={{ fontSize: "16pt" }}>
            เอกสารแนบ สรุปขอเปลี่ยนแปลง / เพิ่ม / ยกเลิกแผนงาน ตัดต้นไม้
          </Typography>
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
            ไตรมาส 1
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณเดิม:{" "}
            {quarterBudget.Q1.old.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณใหม่:{" "}
            {quarterBudget.Q1.new.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            เปลี่ยนแปลง:{" "}
            {quarterBudget.Q1.change.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography sx={{ fontSize: "14pt", marginTop: "8pt" }}>
            ไตรมาส 2
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณเดิม:{" "}
            {quarterBudget.Q2.old.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณใหม่:{" "}
            {quarterBudget.Q2.new.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            เปลี่ยนแปลง:{" "}
            {quarterBudget.Q2.change.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography sx={{ fontSize: "14pt", marginTop: "8pt" }}>
            ไตรมาส 3
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณเดิม:{" "}
            {quarterBudget.Q3.old.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณใหม่:{" "}
            {quarterBudget.Q3.new.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            เปลี่ยนแปลง:{" "}
            {quarterBudget.Q3.change.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography sx={{ fontSize: "14pt", marginTop: "8pt" }}>
            ไตรมาส 4
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณเดิม:{" "}
            {quarterBudget.Q4.old.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณใหม่:{" "}
            {quarterBudget.Q4.new.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            เปลี่ยนแปลง:{" "}
            {quarterBudget.Q4.change.toLocaleString("th-TH", {
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
            {budget.old.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            งบประมาณใหม่:{" "}
            {budget.new.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ fontSize: "14pt" }}>
            เปลี่ยนแปลง:{" "}
            {budget.change.toLocaleString("th-TH", {
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
                      <span>
                        แผนงานเดือน: {monthMap.get(val.oldPlan.month)}
                      </span>
                      <br />
                      <span>งบประมาณ: {val.oldPlan.budget} บาท</span>
                      <br />
                      <span>
                        ประเภทงาน: {hireMap.get(val.oldPlan.hireType)}
                      </span>
                      <br />
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ border: "solid 1px" }}>
                    <Typography sx={{ fontSize: "14pt", padding: "6pt" }}>
                      <span>ชื่อแผนงาน: {val.newPlan.planName}</span>
                      <br />
                      <span>
                        แผนงานเดือน: {monthMap.get(val.newPlan.month)}
                      </span>
                      <br />
                      <span>งบประมาณ: {val.newPlan.budget} บาท</span>
                      <br />
                      <span>
                        ประเภทงาน: {hireMap.get(val.newPlan.hireType)}
                      </span>
                      <br />
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
                    <span>แผนงานเดือน: {monthMap.get(val.newPlan.month)}</span>
                    <br />
                    <span>งบประมาณ: {val.newPlan.budget} บาท</span>
                    <br />
                    <span>ประเภทงาน: {hireMap.get(val.newPlan.hireType)}</span>
                    <br />
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
                    <span>แผนงานเดือน: {monthMap.get(val.oldPlan.month)}</span>
                    <br />
                    <span>งบประมาณ: {val.oldPlan.budget} บาท</span>
                    <br />
                    <span>ประเภทงาน: {hireMap.get(val.oldPlan.hireType)}</span>
                    <br />
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

const hireMap = new Map([
  ["self", "กฟภ. ดำเนินการเอง"],
  ["normal", "จ้างเหมาปกติ"],
  ["special", "จ้างเหมาลักษณะพิเศษ"],
]);
