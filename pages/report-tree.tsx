import { getSession } from "next-auth/react";
import Link from "next/link";
import { NextPage } from "next";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import {
  Alert,
  AlertColor,
  Autocomplete,
  Backdrop,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  MenuItem,
  Select,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

type treeData = {
  id: string;
  zpm4Name: string;
  month: string;
  karnfaifa: string;
  zpm4Po: string;
  reportDate?: string;
  editDate?: string;
};

interface Props {
  treeData: treeData[];
}

export async function getServerSideProps(context: any) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/signin",
      },
    };
  }

  if (!session.pea) {
    return {
      redirect: {
        destination: "/profile",
      },
    };
  }

  const res = await fetch(
    `https://script.google.com/macros/s/AKfycby0DVu9COEYPZLlPkbJZEPrj1cWj2DW1WJasZQd6f6AhQLYDR2hcP8RDsOwmOIGaD909Q/exec?karnfaifa=${session.pea.karnfaifa}`,
  );
  const treeData: treeData = await res.json();
  return {
    props: { treeData },
  };
}

export default function ReportTree(props: Props) {
  const router = useRouter();

  const [filter, setFilter] = useState<treeData>({
    id: "",
    karnfaifa: "",
    month: "",
    zpm4Name: "",
    zpm4Po: "",
  });

  const [progress, setProgress] = useState(false);

  const [snackBar, setSnackBar] = useState({
    open: false,
    sevirity: "success" as AlertColor,
    massege: "",
  });

  const [showElementChoose, setShowElementChoose] = useState(false);
  const [order, setOrder] = useState({
    no: "",
    disable: false,
  });
  const [alignment, setAlignment] = useState("po");
  const [showTreeData, setShowTreeData] = useState<treeData[]>(props.treeData);
  const [chooseTreeData, setChooseTreeData] = useState<treeData[]>([]);

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

  useEffect(() => {
    let filterData = props.treeData;
    let chooseID: string[] = [];

    chooseTreeData.forEach((val) => {
      chooseID.push(val.id);
    });

    filterData = filterData.filter((val) => {
      return !chooseID.includes(val.id);
    });

    if (filter.month != "") {
      filterData = filterData.filter((val) => {
        return val.month == filter.month;
      });
    }

    if (filter.zpm4Name != "") {
      filterData = filterData.filter((val) => {
        return val.zpm4Name.includes(filter.zpm4Name);
      });
    }

    setShowTreeData(filterData);
  }, [filter, chooseTreeData]);

  async function sendTreeData() {
    setProgress(true)
    try {
      const res = await fetch(
        `https://script.google.com/macros/s/AKfycby0DVu9COEYPZLlPkbJZEPrj1cWj2DW1WJasZQd6f6AhQLYDR2hcP8RDsOwmOIGaD909Q/exec?karnfaifa=${chooseTreeData[0].karnfaifa}`,
        {
          method: "POST",
          body: JSON.stringify(chooseTreeData),
        },
      );
      const data = await res.json();
      if (data.massege == "success") {
        setSnackBar({
          open: true,
          sevirity: "success",
          massege: "รายงานใบสั่งซ่อม/ใบสั่งจ้างสำเร็จ",
        });
        router.refresh();
      }
    } catch {
      setProgress(false)
      setSnackBar({
        open: true,
        sevirity: "error",
        massege: "เกิดข้อผิดพลาดบางอย่าง กรุณาลองอีกครั้ง",
      });
    }
  }

  return (
    <div className="flex flex-col p-4 min-h-screen ">
      <p className="m-3">รายงานต้นไม้</p>
      <div className="mx-auto w-11/12 mb-3 bg-white grid grid-cols-1">
        <p className="m-3 col-span-1">การดำเนินการ</p>
        <div className="mx-3 mb-3 col-span-1">
          <ToggleButtonGroup
            onClick={()=>{
              order.disable?setSnackBar({open: true,sevirity: 'warning',massege:`คุณต้องยกเลิกหมายเลข ${alignment.toUpperCase()} ก่อนจึงจะเปลี่ยนแปลงได้`}):undefined
            }}
            disabled={order.disable}
            color="primary"
            value={alignment}
            exclusive
            onChange={(e, n) => n?setAlignment(n):alignment=='po'?setAlignment('zpm4'):setAlignment('po')}
            aria-label="Platform"
            sx={{ margin: "0 0 0.5rem 0.5rem" }}
          >
            <ToggleButton value="po">จ้างเหมา</ToggleButton>
            <ToggleButton value="zpm4">กฟภ.ดำเนินการ</ToggleButton>
          </ToggleButtonGroup>
        </div>
        <div className="mx-3 mb-3 col-span-1" 
            onMouseOver={()=>{
              order.disable?setSnackBar({open: true,sevirity: 'warning',massege:`คุณต้องกด "ยกเลิกหมายเลข ${alignment.toUpperCase()}" ก่อนจึงจะเปลี่ยนแปลงได้`}):undefined
            }}>
          <TextField
            disabled={order.disable}
            sx={{ maxWidth: "100%", margin: "0.5rem 0 0.5rem 0.5rem" }}
            label={
              alignment == "po"
                ? "กรุณากรอกหมายเลข PO"
                : "กรุณากรอกหมายเลข ZPM4"
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
            onMouseDownCapture={()=>{
              chooseTreeData.length > 0?setSnackBar({open: true,sevirity: 'warning',massege:`คุณต้องกด "ยกเลิกแผนงาน" ทั้งหมดก่อนจึงจะเปลี่ยนแปลงได้`}):undefined
            }}>
              <Button
                disabled={chooseTreeData.length > 0}
                variant="outlined"
                onClick={() => {
                  if(window.confirm("คุณต้องการยกเลิกหมายเลข PO/ZPM4?"))
                  {
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

      {showElementChoose ? (
        <div className="mx-auto w-11/12 bg-white">
          <p className="m-3">
            เลือกแผนงาน
            {alignment == "po"
              ? `ที่ได้จ้างกับใบสั่งจ้าง PO: ${order.no}`
              : `ที่ได้ดำเนินการจากใบสั่งซ่อม ZPM4: ${order.no}`}{" "}
          </p>
          <div className="grid grid-cols-4 gap-4 m-3">
            <div className="col-start-1 col-end-5 sm:col-end-4 m-0 p-0">
              <TextField
                sx={{ maxWidth: "100%" }}
                label="กรองตามชื่อแผนงาน"
                variant="outlined"
                onChange={(e) => {
                  setFilter({ ...filter, zpm4Name: e.target.value });
                }}
              ></TextField>
            </div>
            <div className="col-span-4 sm:col-span-1 flex flex-row m-0 p-0">
            <Autocomplete
  disablePortal
  id="combo-box-demo"
  options={month}
  onChange={(e,v)=>setFilter({ ...filter, month: v?v.month:'' })}
  sx={{ width: '100%' }}
  renderInput={(params) => <TextField {...params} label="กรองเดือน" />}
/>
            </div>
          </div>
          <DataGrid
            rows={
              showTreeData.length == 0
                ? [
                    {
                      id: "0",
                      zpm4Name: "ไม่มีแผนงาน",
                      karnfaifa: "",
                      zpm4Po: "",
                      month: "",
                    },
                  ]
                : showTreeData
            }
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10]}
            slots={{ toolbar: CustomToolbar }}
            slotProps={{
              toolbar: setFilter,
            }}
            sx={{ margin: "1rem" }}
            onRowClick={({ row }: { row: treeData }) => {
              console.log(row.zpm4Po);
              if (row.zpm4Po != "") {
                window.confirm(
                  `แผนงานนี้ คุณได้รายงานหมายเลขใบสั่งซ่อม/ใบสั่งจ้าง ${row.zpm4Po} มาก่อนหน้านี้แล้ว คุณต้องการแก้ใขใช่หรือไม่?`,
                )
                  ? setChooseTreeData([
                      ...chooseTreeData,
                      {
                        ...row,
                        zpm4Po: order.no,
                        editDate: formatDate(new Date()),
                      },
                    ])
                  : undefined;
              } else {
                setChooseTreeData([
                  ...chooseTreeData,
                  {
                    ...row,
                    zpm4Po: order.no,
                    reportDate: formatDate(new Date()),
                    editDate: formatDate(new Date()),
                  },
                ]);
              }
            }}
          />
        </div>
      ) : undefined}
      {chooseTreeData.length > 0 && (
        <div className="mx-auto mt-3 w-11/12 bg-white">
          <p className="m-3">แผนงานที่เลือก</p>
          <div className="flex flex-row flex-wrap gap-3 p-3">
            {chooseTreeData.map((val) => {
              return (
                <Card key={val.id}>
                  <CardContent>
                    <Typography
                      sx={{ fontSize: 14 }}
                      color="text.secondary"
                      gutterBottom
                    >
                      {val.zpm4Name}
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
              onClick={()=>{
                window.confirm('ต้องการรายงานแผนงานใช่หรือไม่?')?sendTreeData():undefined}}
            >
              ยืนยัน
            </Button>
            <Button
              variant="outlined"
              disabled={chooseTreeData.length == 0}
              onClick={() => {
                window.confirm('คุณแน่ใจว่าต้องการจะยกเลิกแผนงานทั้งหมด')?setChooseTreeData([]):undefined;
              }}
            >
              ยกเลิกการเลือกแผนงานทั้งหมด
            </Button>
          </div>
        </div>
      )}
      <Button variant="outlined" className="mx-auto mt-3 w-40" onClick={()=>{
        setProgress(true)
        if(order.no != ''){
          return window.confirm('คุณได้ใส่ข้อมูลไปบางส่วนหรือทั้งหมดแล้ว คุณแน่ใจว่าจะออกจากหน้านี้?')?router.push('/'):setProgress(false)
        }
        router.push('/')
      }}>
        กลับสู่หน้าหลัก
      </Button>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackBar.open}
        autoHideDuration={2000}
        onClose={() => setSnackBar({ ...snackBar, open: false })}
      >
        <Alert
          severity={snackBar.sevirity}
          onClose={() => setSnackBar({ ...snackBar, open: false })}
        >
          {snackBar.massege}
        </Alert>
      </Snackbar>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={progress}
        onClick={() => setProgress(false)}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

function formatDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const month = [
  { label: 'Q1', month: 'Q1' },
  { label: 'Q2', month: 'Q2' },
  { label: 'Q3', month: 'Q3' },
  { label: 'Q4', month: 'Q4' },
]


const columns: GridColDef[] = [
  {
    field: "zpm4Name",
    headerName: "ชื่อแผนงาน",
    width: 700,
    disableColumnMenu: true,
    sortable: false,
  },
  { field: "month", headerName: "ไตรมาส", disableColumnMenu: true },
  {
    field: "karnfaifa",
    headerName: "กฟฟ.",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "zpm4Po",
    headerName: "เลขใบสั่งซ่อม ZPM4/ใบสั่งจ้าง PO",
    disableColumnMenu: true,
    sortable: false,
    width: 300
  },
];
