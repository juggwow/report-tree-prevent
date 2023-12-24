import { SetPropsChoosePreventDataType } from "@/types/report-prevent";
import { SetPropsChooseTreeDataType } from "@/types/report-tree";
import { Card, CardContent, Typography, CardActions, Button } from "@mui/material";

export default function ChoosePreventData({choosePreventData,setChoosePreventData,sendPreventData}:SetPropsChoosePreventDataType){
    return(
        <>
        
      {choosePreventData.length > 0 && (
        <div className="mx-auto mt-3 w-11/12 bg-white">
          <p className="m-3">แผนงานที่เลือก</p>
          <div className="flex flex-row flex-wrap gap-3 p-3">
            {choosePreventData.map((val) => {
              return (
                <Card key={val.id as string}>
                  <CardContent>
                    <Typography
                      sx={{ fontSize: 14 }}
                      color="text.secondary"
                      gutterBottom
                    >
                      {val.planName}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => {
                        setChoosePreventData(
                          choosePreventData.filter((key) => {
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
              disabled={choosePreventData.length == 0}
              onClick={() => {
                window.confirm("ต้องการรายงานแผนงานใช่หรือไม่?")
                  ? sendPreventData()
                  : undefined;
              }}
            >
              ยืนยัน
            </Button>
            <Button
              id = "cancelAllPlan"
              variant="outlined"
              disabled={choosePreventData.length == 0}
              onClick={() => {
                window.confirm("คุณแน่ใจว่าต้องการจะยกเลิกแผนงานทั้งหมด")
                  ? setChoosePreventData([])
                  : undefined;
              }}
            >
              ยกเลิกการเลือกแผนงานทั้งหมด
            </Button>
          </div>
        </div>
      )}
        </>
    )
}