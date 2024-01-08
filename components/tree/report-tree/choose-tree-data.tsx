import { SetPropsChooseTreeDataType } from "@/types/report-tree";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
} from "@mui/material";

export default function ChooseTreeData({
  chooseTreeData,
  setChooseTreeData,
  sendTreeData,
}: SetPropsChooseTreeDataType) {
  return (
    <>
      {chooseTreeData.length > 0 && (
        <div className="mx-auto mt-3 w-11/12 bg-white">
          <p className="m-3">แผนงานที่เลือก</p>
          <div className="flex flex-row flex-wrap gap-3 p-3">
            {chooseTreeData.map((val) => {
              return (
                <Card key={val.id as string}>
                  <CardContent>
                    <Typography
                      sx={{ fontSize: 14 }}
                      color="text.secondary"
                      gutterBottom
                    >
                      {val.zpm4Name}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 14 }}
                      color="text.secondary"
                      gutterBottom
                    >
                      แผนงานเดือน: {monthMap.get(val.month)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => {
                        setChooseTreeData(
                          chooseTreeData.filter((key) => {
                            return key.id != val.id;
                          }),
                        );
                      }}
                    >
                      ยกเลิกการเลือกแผนงานนี้
                    </Button>
                  </CardActions>
                </Card>
              );
            })}
          </div>
          <div className="flex flex-row flex-wrap gap-3 my-3 ml-3">
            <Button
              variant="outlined"
              disabled={chooseTreeData.length == 0}
              onClick={() => {
                window.confirm("ต้องการรายงานแผนงานใช่หรือไม่?")
                  ? sendTreeData()
                  : undefined;
              }}
            >
              ยืนยัน
            </Button>
            <Button
              id="cancelAllPlan"
              variant="outlined"
              disabled={chooseTreeData.length == 0}
              onClick={() => {
                window.confirm("คุณแน่ใจว่าต้องการจะยกเลิกแผนงานทั้งหมด")
                  ? setChooseTreeData([])
                  : undefined;
              }}
            >
              ยกเลิกการเลือกแผนงานทั้งหมด
            </Button>
          </div>
        </div>
      )}
    </>
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
