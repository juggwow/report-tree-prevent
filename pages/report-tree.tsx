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
  Autocomplete,
  Button,
  Card,
  CardActions,
  CardContent,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

type treeData = {
  id: string;
  zpm4Name: string;
  month: string;
  karnfaifa: string;
  zpm4Po: string;
};

interface Props {
  treeData: treeData[];
}

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
  },
];

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
  const [filter, setFilter] = useState<treeData>({
    id: "",
    karnfaifa: "",
    month: "",
    zpm4Name: "",
    zpm4Po: "",
  });

  const [showElementChoose,setShowElementChoose] = useState(false)
  const [order, setOrder] = useState({
    no: '',
    disable: false
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

  return (
    <div className="flex flex-col p-4 min-h-screen ">
      <p className="m-3">รายงานต้นไม้</p>
      <div className="mx-auto w-11/12 mb-3 bg-white grid grid-cols-1">
        <p className="m-3 col-span-1">การดำเนินการ</p>
        <div className="mx-3 mb-3 col-span-1">
          <ToggleButtonGroup
            disabled={order.disable}
            color="primary"
            value={alignment}
            exclusive
            onChange={(e, n) => setAlignment(n)}
            aria-label="Platform"
            sx={{ margin: "0 0 0.5rem 0.5rem" }}
          >
            <ToggleButton value="po">จ้างเหมา</ToggleButton>
            <ToggleButton value="zpm4">กฟภ.ดำเนินการ</ToggleButton>
          </ToggleButtonGroup>
        </div>
        <div className="mx-3 mb-3 col-span-1">
          <TextField
            disabled={order.disable}
            sx={{ maxWidth: "100%", margin: '0.5rem 0 0.5rem 0.5rem' }}
            label={
              alignment == "po" ? "กรุณากรอกหมายเลข PO" : "กรุณากรอกหมายเลข ZPM4"
            }
            helperText={
              alignment == "po" ? "หมายเลข PO จำนวน 10 ตัวเลข และขึ้นต้นด้วย 300" : "หมายเลข ZPM4 จำนวน 10 ตัวเลข และขึ้นต้นด้วย 400"
            }
            
            variant="outlined"
            value={order.no}
            onChange={(e) => setOrder({...order,no: e.target.value})}
            error={validatorOrder()}
          ></TextField>
        </div>
        <div className="mx-4 mb-3 col-span-1">
          {!validatorOrder()&&!showElementChoose&&
                <Button 
                  variant="outlined" 
                  onClick={()=>{
                    setOrder({...order,disable: true})
                    setShowElementChoose(true)
                  }
                }>
                  ยืนยัน
                </Button>
          }
          {
            !validatorOrder()&&showElementChoose&&
                <Button 
                  disabled={chooseTreeData.length>0}
                  variant="outlined" 
                  onClick={()=>{
                    setOrder({no: '',disable: false})
                    setShowElementChoose(false)
                  }
                }>
                  ยกเลิกหมายเลข {alignment=='po'?'PO':'ZPM4'}
                </Button>
          }
        </div>
      </div>

      {showElementChoose?
      <div className="mx-auto w-11/12 bg-white">
        <p className="m-3">เลือกแผนงาน</p>
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
          <div className="col-span-1 m-0 p-0">
            <Select
              value={filter.month}
              labelId="demo-simple-select-helper-label"
              id="demo-simple-select-helper"
              defaultValue="ไม่กรอง"
              onChange={(e) => setFilter({ ...filter, month: e.target.value })}
            >
              <MenuItem value={""}>ไม่กรอง</MenuItem>
              <MenuItem value={"Q1"}>Q1</MenuItem>
              <MenuItem value={"Q2"}>Q2</MenuItem>
              <MenuItem value={"Q3"}>Q3</MenuItem>
              <MenuItem value={"Q4"}>Q4</MenuItem>
            </Select>
          </div>
        </div>
        <DataGrid
          rows={
            showTreeData.length == 0
              ? [{ zpm4Name: "ไม่มีแผนงาน" }]
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
            setChooseTreeData([...chooseTreeData, row]);
          }}
        />
      </div>:undefined
      }
      {chooseTreeData.length>0&&
        <div className="mx-auto mt-3 w-11/12 bg-white">
          <p className="m-3">แผนงานที่เลือก</p>
          <div className="flex flex-row flex-wrap gap-3 p-3">
            { chooseTreeData.map(val=>{
              return(
                <Card key={val.id}>
                  <CardContent>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                      {val.zpm4Name}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small"
                      onClick={()=>{
                        setChooseTreeData(chooseTreeData.filter(key=>{
                          return key.id != val.id
                        }))
                      }}
                    >
                      ยกเลิกแผนงาน
                    </Button>
                  </CardActions>
                </Card>
                
              )
            })

            }
          </div>
        </div>
      }
      <div>
        <Link href="/">กลับสู่หน้าหลัก</Link>
      </div>
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
