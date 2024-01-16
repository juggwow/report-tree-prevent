import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Checkbox, Divider, FormControlLabel } from "@mui/material";
import {
  FormAddPlanTree,
  FormCancelPlanTree,
  FormChangePlanTree,
} from "@/types/report-tree";
import { ChangeEvent } from "react";

export default function ChangePlanTreeCard({
  plan,
  onClickEdit,
  onClickCancel,
}: {
  plan: FormChangePlanTree | FormAddPlanTree | FormCancelPlanTree;
  onClickEdit: () => void;
  onClickCancel: () => void;
}) {
  return (
    <Box>
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">
            {plan.typeReq == "add" ? "คำขอเพิ่มแผนงาน" : undefined}
            {plan.typeReq == "cancel"
              ? `คำขอยกเลิกแผนงาน: ${plan.oldPlan?.planName}`
              : undefined}
            {plan.typeReq == "change"
              ? `คำขอเปลี่ยนแปลงแผนงาน: ${plan.oldPlan?.planName}`
              : undefined}
          </Typography>
          <Typography color="text.secondary">
            ผู้ขอดำเนินการ: {plan.userReq?.firstname}
          </Typography>
          <Typography
            sx={{ fontSize: "0.75rem" }}
            color="text.secondary"
            gutterBottom
          >
            หมายเลขโทรศัพท์: {plan.userReq?.mobileno}
          </Typography>
          <Divider />
          {plan.typeReq == "change" || plan.typeReq == "cancel" ? (
            <>
              <Typography>แผนงานเดิม: {plan.oldPlan?.planName}</Typography>
              <Typography variant="body2" gutterBottom>
                <span>งบประมาณ: {plan.oldPlan?.budget}</span>
                <br />
                <span>
                  แผนงานเดือน:{" "}
                  {plan.oldPlan ? month.get(plan.oldPlan.month) : undefined}
                </span>
                <br />
                <span>ประเภทงาน: {hireMap.get(plan.oldPlan?.hireType)}</span>
                <br />
                <span>ระบบ: {plan.oldPlan?.systemVolt}</span>
                <br />
              </Typography>
              <Divider />
            </>
          ) : undefined}

          {plan.typeReq == "add" || plan.typeReq == "change" ? (
            <>
              <Typography>แผนงานใหม่: {plan.newPlan?.planName}</Typography>
              <Typography variant="body2" gutterBottom>
                <span>งบประมาณ: {plan.newPlan?.budget}</span>
                <br />
                <span>
                  แผนงานเดือน:{" "}
                  {plan.newPlan ? month.get(plan.newPlan.month) : undefined}
                </span>
                <br />
                <span>ประเภทงาน: {hireMap.get(plan.newPlan?.hireType)}</span>
                <br />
                <span>ระบบ: {plan.newPlan?.systemVolt}</span>
                <br />
              </Typography>
              <Divider />
            </>
          ) : undefined}
          <Divider />
          <Typography>เหตุผล: {plan.reason}</Typography>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={onClickEdit}>
            แก้ไขรายละเอียด
          </Button>
        </CardActions>
        <CardActions>
          <Button size="small" onClick={onClickCancel}>
            ยกเลิกการเปลี่ยนแผน
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}

const month = new Map([
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
