import { ChangePlanWithStatus } from "@/types/report-prevent";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { ChangeEvent } from "react";

export default function ChangePlanPreventCard({
  isChecked,
  plan,
  onClickCancel,
  onClickEdit,
  onChangeSelectBox,
}: {
  isChecked: boolean;
  plan: ChangePlanWithStatus;
  onClickCancel: () => void;
  onClickEdit: () => void;
  onChangeSelectBox: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Box>
      <Card variant="outlined">
        <CardContent>
          <FormControlLabel
            control={
              <Checkbox
                id={plan._id as string}
                onChange={onChangeSelectBox}
                defaultChecked={isChecked}
              />
            }
            label="เลือกเพื่อพิมพ์เอกสารแนบ"
          />
          <Typography color="text.secondary">
            {plan.typeReq == "add" && "คำขอเพิ่มแผนงาน"}
            {plan.typeReq == "cancel" &&
              `คำขอยกเลิกแผนงาน: ${plan.oldPlan.planName}`}
            {plan.typeReq == "change" &&
              `คำขอเปลี่ยนแปลงแผนงาน: ${plan.oldPlan?.planName}`}
          </Typography>
          <Typography color="text.secondary">
            ผู้ขอดำเนินการ: {plan.userReq.firstname}
          </Typography>
          <Typography
            sx={{ fontSize: "0.75rem" }}
            color="text.secondary"
            gutterBottom
          >
            หมายเลขโทรศัพท์: {plan.userReq.mobileno}
          </Typography>
          <Divider />
          {(plan.typeReq == "change" || plan.typeReq == "cancel") && (
            <>
              <Typography>แผนงานเดิม: {plan.oldPlan.planName}</Typography>
              <Typography variant="body2" gutterBottom>
                <span>งบประมาณ: {plan.oldPlan.budget}</span>
                <br />
                <span>ช่วงที่ดำเนินการ: {plan.oldPlan.duration}</span>
                <br />
                <span>ประเภทงาน: {plan.oldPlan.typePrevent}</span>
                <br />
                <span>ปริมาณงานโดยสังเขป: {plan.oldPlan.breifQuantity}</span>
                <br />
              </Typography>
              <Divider />
            </>
          )}
          {(plan.typeReq == "change" || plan.typeReq == "add") && (
            <>
              <Typography>แผนงานใหม่: {plan.newPlan.planName}</Typography>
              <Typography variant="body2" gutterBottom>
                <span>งบประมาณ: {plan.newPlan.budget}</span>
                <br />
                <span>ช่วงที่ดำเนินการ: {plan.newPlan.duration}</span>
                <br />
                <span>ประเภทงาน: {plan.newPlan.typePrevent}</span>
                <br />
                <span>ปริมาณงานโดยสังเขป: {plan.newPlan.breifQuantity}</span>
                <br />
              </Typography>
              <Divider />
            </>
          )}
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
