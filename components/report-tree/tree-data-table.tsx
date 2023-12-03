import { SetPropsTreeDataTableType, treeData } from "@/types/report-tree";
import { TextField, Autocomplete } from "@mui/material";
import CustomToolbar from "../data-grid-custom-toolbar";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";

export default function TreeDataTable({
  alignment,
  showElementChoose,
  order,
  filter,
  setFilter,
  showTreeData,
  chooseTreeData,
  setChooseTreeData,
}: SetPropsTreeDataTableType) {
  return (
    <div className="p-0 m-0">
      {showElementChoose ? (
        <div className="mx-auto py-3 w-11/12 bg-white">
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
                onChange={(e, v) =>
                  setFilter({ ...filter, month: v ? v.month : "" })
                }
                sx={{ width: "100%" }}
                renderInput={(params) => (
                  <TextField {...params} label="กรองเดือน" />
                )}
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
              if (row.zpm4Po) {
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
    </div>
  );
}

const month = [
  { label: "Q1", month: "Q1" },
  { label: "Q2", month: "Q2" },
  { label: "Q3", month: "Q3" },
  { label: "Q4", month: "Q4" },
];

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
    field: "businessName",
    headerName: "กฟฟ.",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "zpm4Po",
    headerName: "เลขใบสั่งซ่อม ZPM4/ใบสั่งจ้าง PO",
    disableColumnMenu: true,
    sortable: false,
    width: 300,
  },
];



function formatDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
