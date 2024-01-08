import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { ObjectId } from "mongodb";
import { peaUser } from "@/types/next-auth";
import { Divider } from "@mui/material";
import { ChangePlanLV } from "@/types/plan-lv";

export default function ChangePlanLVCard({
  plan,
  onClickEdit,
  onClickCancel,
}: {
  plan: PlanLVChangeReq;
  onClickEdit: () => void;
  onClickCancel: () => void;
}) {
  return (
    <Box>
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">
            ผู้ขอเปลี่ยนแผน: {plan.userReq.firstname}
          </Typography>
          <Typography
            sx={{ fontSize: "0.75rem" }}
            color="text.secondary"
            gutterBottom
          >
            หมายเลขโทรศัพท์: {plan.userReq.mobileno}
          </Typography>
          <Divider />
          <Typography>แผนงานเดิม: {plan.oldPlan.peaNo}</Typography>
          <Typography variant="body2" gutterBottom>
            <span>ฟีดเดอร์ที่เกาะ: {plan.oldPlan.feeder}</span>
            <br />
            <span>ความยาว: {plan.oldPlan.distanceCircuit}</span>
          </Typography>
          <Divider />
          <Typography>แผนงานใหม่: {plan.changeReq.peaNo}</Typography>
          <Typography variant="body2">
            <span>ฟีดเดอร์ที่เกาะ: {plan.changeReq.feeder}</span>
            <br />
            <span>ความยาว: {plan.changeReq.distanceCircuit}</span>
          </Typography>
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

interface PlanLVChangeReq {
  _id: ObjectId | string;
  status: "progress" | "success" | "reject";
  userReq: peaUser;
  reason: string;
  oldPlan: {
    peaNo: string;
    distanceCircuit: number;
    feeder: string;
  };
  changeReq: {
    peaNo: string;
    distanceCircuit: number;
    feeder: string;
  };
  dateReq: string;
}
