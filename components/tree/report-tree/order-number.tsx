import { SetPropsOrderNumberType } from "@/types/report-tree";
import {
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Button,
} from "@mui/material";

export default function OrderNumber({
  order,
  setOrder,
  setSnackBar,
  alignment,
  setAlignment,
  showElementChoose,
  setShowElementChoose,
  chooseTreeData,
}: SetPropsOrderNumberType) {
  function validatorOrder(): boolean {
    if (alignment == "po" && !/^300\d{7}$/.test(order.no)) {
      return true;
    }

    if (alignment == "zpm4" && !/^400\d{7}$/.test(order.no)) {
      return true;
    }

    if (!alignment) {
      return true;
    }

    return false;
  }
  return (
    <div className="mx-auto w-11/12 mb-3 bg-white grid grid-cols-1">
      <p className="m-3 col-span-1">การดำเนินการ</p>
      <div className="mx-3 mb-3 col-span-1">
        <ToggleButtonGroup
          onClick={() => {
            if(order.disable){
              setSnackBar({
                open: true,
                sevirity: "warning",
                massege: `คุณต้องยกเลิกหมายเลข ${alignment.toUpperCase()} ก่อนจึงจะเปลี่ยนแปลงได้`,
              })
              if(document.getElementById("cancelZPM4")){
                document.getElementById("cancelZPM4")?.classList.add('shake')
                setTimeout(() => {
                  document.getElementById("cancelZPM4")?.classList.remove('shake');
                }, 2000);
              }
            }

          }}
          disabled={order.disable}
          color="primary"
          value={alignment}
          exclusive
          onChange={(e, n) =>
            n
              ? setAlignment(n)
              : alignment == "po"
              ? setAlignment("zpm4")
              : setAlignment("po")
          }
          aria-label="Platform"
          sx={{ margin: "0 0 0.5rem 0.5rem" }}
        >
          <ToggleButton value="po">จ้างเหมา</ToggleButton>
          <ToggleButton value="zpm4">กฟภ.ดำเนินการ</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div
        className="mx-3 mb-3 col-span-1"
        onMouseOver={() => {
          if(order.disable){
            setSnackBar({
              open: true,
              sevirity: "warning",
              massege: `คุณต้องยกเลิกหมายเลข ${alignment.toUpperCase()} ก่อนจึงจะเปลี่ยนแปลงได้`,
            })
            if(document.getElementById("cancelZPM4")){
              document.getElementById("cancelZPM4")?.classList.add('shake')
              setTimeout(() => {
                document.getElementById("cancelZPM4")?.classList.remove('shake');
              }, 2000);
            }
          }
        }}
      >
        <TextField
          disabled={order.disable}
          sx={{ maxWidth: "100%", margin: "0.5rem 0 0.5rem 0.5rem" }}
          label={
            alignment == "po" ? "กรุณากรอกหมายเลข PO" : "กรุณากรอกหมายเลข ZPM4"
          }
          helperText={
            alignment == "po"
              ? "หมายเลข PO จำนวน 10 ตัวเลข และขึ้นต้นด้วย 300"
              : "หมายเลข ZPM4 จำนวน 10 ตัวเลข และขึ้นต้นด้วย 400"
          }
          variant="outlined"
          value={order.no}
          onChange={(e) => setOrder({ ...order, no: e.target.value })}
          error={validatorOrder()}
        ></TextField>
      </div>
      <div className="mx-4 mb-3 col-span-1">
        {!validatorOrder() && !showElementChoose && (
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
        {!validatorOrder() && showElementChoose && (
          <div
            onMouseUp={() => {
              if(chooseTreeData.length){
                setSnackBar({
                  open: true,
                  sevirity: "warning",
                  massege: `คุณต้องกด "ยกเลิกแผนงานทั้งหมด" ก่อนจึงจะเปลี่ยนแปลงได้`,
                })
                document.getElementById("cancelAllPlan")?.focus()
                document.getElementById("cancelAllPlan")?.classList.add("shake")
                setTimeout(()=>{
                  document.getElementById("cancelAllPlan")?.classList.remove("shake")
                },2000)
              }
            }}
          >
            <Button
              disabled={chooseTreeData.length > 0}
              id="cancelZPM4"
              variant="outlined"
              onClick={() => {
                if (window.confirm("คุณต้องการยกเลิกหมายเลข PO/ZPM4?")) {
                  setOrder({ no: "", disable: false });
                  setShowElementChoose(false);
                }
              }}
            >
              ยกเลิกหมายเลข {alignment == "po" ? "PO" : "ZPM4"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
