import { SetPropsOrderNumberType } from "@/types/report-prevent";
import {
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Button,
} from "@mui/material";

export default function ZPM4Number({
  order,
  setOrder,
  setSnackBar,
  showElementChoose,
  setShowElementChoose,
  choosePreventData,
}: SetPropsOrderNumberType) {
  return (
    <div className="mx-auto w-11/12 mb-3 bg-white grid grid-cols-1">
      <p className="m-3 col-span-1">การดำเนินการ</p>
      <div className="mx-3 mb-3 col-span-1">
        <TextField
          onMouseOver={() => {
            if (order.disable) {
              setSnackBar({
                open: true,
                sevirity: "warning",
                massege: `คุณต้องกด "ยกเลิกหมายเลข ZPM4" ก่อนจึงจะเปลี่ยนแปลงได้`,
              });
              if (document.getElementById("cancelZPM4")) {
                document.getElementById("cancelZPM4")?.classList.add("shake");
                setTimeout(() => {
                  document
                    .getElementById("cancelZPM4")
                    ?.classList.remove("shake");
                }, 2000);
              }
            }
          }}
          disabled={order.disable}
          sx={{ maxWidth: "100%", margin: "0.5rem 0 0.5rem 0.5rem" }}
          label={"กรุณากรอกหมายเลข ZPM4"}
          helperText={"หมายเลข ZPM4 จำนวน 10 ตัวเลข และขึ้นต้นด้วย 400"}
          variant="outlined"
          value={order.no}
          onChange={(e) => setOrder({ ...order, no: e.target.value })}
          error={!/^400\d{7}$/.test(order.no)}
        ></TextField>
      </div>
      <div className="mx-4 mb-3 col-span-1">
        {/^400\d{7}$/.test(order.no) && !showElementChoose && (
          <Button
            variant="outlined"
            onClick={() => {
              setOrder({ ...order, disable: true });
              setShowElementChoose(true);
            }}
          >
            ยืนยัน
          </Button>
        )}
        {/^400\d{7}$/.test(order.no) && showElementChoose && (
          <div
            onMouseUp={() => {
              if (choosePreventData.length) {
                setSnackBar({
                  open: true,
                  sevirity: "warning",
                  massege: `คุณต้องกด "ยกเลิกแผนงานทั้งหมด" ก่อนจึงจะเปลี่ยนแปลงได้`,
                });
                document.getElementById("cancelAllPlan")?.focus();
                document
                  .getElementById("cancelAllPlan")
                  ?.classList.add("shake");
                setTimeout(() => {
                  document
                    .getElementById("cancelAllPlan")
                    ?.classList.remove("shake");
                }, 2000);
              }
            }}
          >
            <Button
              disabled={choosePreventData.length > 0}
              variant="outlined"
              id="cancelZPM4"
              onClick={() => {
                if (window.confirm("คุณต้องการยกเลิกหมายเลข PO/ZPM4?")) {
                  setOrder({ no: "", disable: false });
                  setShowElementChoose(false);
                }
              }}
            >
              ยกเลิกหมายเลข {"ZPM4"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
