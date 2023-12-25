import { SetPropsTreeDataTableType, treeData } from "@/types/report-tree";
import { TextField, Autocomplete, Switch, FormControlLabel } from "@mui/material";
import CustomToolbar from "../../data-grid-custom-toolbar";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import formatDate from "@/lib/format-date";
import { PreventData, SetPropsPreventDataTableType } from "@/types/report-prevent";
import { useState } from "react";

export default function PreventDataTable({
  showElementChoose,
  order,
  filter,
  setFilter,
  showPreventData,
  choosePreventData,
  setChoosePreventData,
}: SetPropsPreventDataTableType) {
  
  let autoComplete:string[] = []
  showPreventData.forEach(val=>autoComplete.push(val.duration))
  autoComplete = autoComplete.filter((val,i,arr)=>{
    return arr.indexOf(val) === i
  })
  return (
    <div className="p-0 m-0">
      {showElementChoose ? (
        <div className="mx-auto py-3 w-11/12 bg-white">
          <p className="m-3">
            เลือกแผนงาน
            {`ที่ได้ดำเนินการจากใบสั่งซ่อม ZPM4: ${order.no}`}{" "}
          </p>
          <div className="grid grid-cols-4 gap-4 m-3">
            <div className="col-start-1 col-end-5 sm:col-end-3 m-0 p-0">
              <TextField
                sx={{ maxWidth: "100%" }}
                label="กรองตามชื่อแผนงาน"
                variant="outlined"
                onChange={(e) => {
                  setFilter({ ...filter, planName: e.target.value });
                }}
              ></TextField>
            </div>
            <div className="col-span-2 sm:col-span-1 flex flex-row m-0 p-0">
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={autoComplete}
                onChange={(e, v) =>
                  setFilter({ ...filter, duration: v ? v : "" })
                }
                sx={{ width: "100%" }}
                renderInput={(params) => (
                  <TextField {...params} label="กรองช่วงเวลา" />
                )}
              />
            </div>
            <div className="col-span-2 sm:col-span-1 flex flex-row m-0 p-0">
              <FormControlLabel control={<Switch defaultChecked onChange={(e)=>setFilter({...filter,hasZPM4: e.target.checked})}/>} label="รวมที่ลงข้อมูลแล้ว"/>
            </div>
          </div>
          <DataGrid
            rows={
              showPreventData.length == 0
                ? [
                    {
                      id: "0",
                      planName: "ไม่มีแผนงาน",
                      businessName: "",
                      zpm4: "",
                      duration: "",
                    },
                  ]
                : showPreventData
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
            onRowClick={({ row }: { row: PreventData }) => {
              console.log(row.zpm4);
              if (row.zpm4) {
                window.confirm(
                  `แผนงานนี้ คุณได้รายงานหมายเลขใบสั่งซ่อม/ใบสั่งจ้าง ${row.zpm4} มาก่อนหน้านี้แล้ว คุณต้องการแก้ใขใช่หรือไม่?`,
                )
                  ? setChoosePreventData([
                      ...choosePreventData,
                      {
                        ...row,
                        zpm4: order.no,
                        editDate: formatDate(new Date()),
                      },
                    ])
                  : undefined;
              } else {
                setChoosePreventData([
                  ...choosePreventData,
                  {
                    ...row,
                    zpm4: order.no,
                    reportDate: formatDate(new Date()),
                    editDate: formatDate(new Date()),
                  },
                ]);
              }
            }}
          />
        </div>
      ) : undefined}
    </div>
  );
}

const columns: GridColDef[] = [
  {
    field: "planName",
    headerName: "ชื่อแผนงาน",
    width: 600,
    disableColumnMenu: true,
    sortable: false,
  },
  { field: "duration", headerName: "ช่วงที่ดำเนินการ", disableColumnMenu: true, width: 150 },
  {
    field: "businessName",
    headerName: "กฟฟ.",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "zpm4",
    headerName: "เลขใบสั่งซ่อม ZPM4",
    disableColumnMenu: true,
    sortable: false,
    width: 300,
  },
];




