import { Autocomplete, Grid, Pagination, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from "react";
import MaintenanceImgMediaCard from '@/components/maintenance/pm-media-card';
import { ImgMediaCardProp, MaintenanceVineBeGoneData } from '@/types/vine-be-gone-now';



export default function MaintenanceVineBeGone() {
    
    const [page,setPage] = useState<number>(1)
    const [totalDocuments,setTotalDocuments] = useState(6)
    const [typeDoc,setTypeDoc] = useState<FilterOption>(filterOptions[2])
    const [showData,setShowData] = useState<null[] | ImgMediaCardProp[]>(createArrayObject(6,null))

    const handleChangeAutoComplete = (e:React.SyntheticEvent<Element, Event>,v: FilterOption | null)=>{
        setTypeDoc(v?v:filterOptions[2])
        setPage(1)
    }

    useEffect(() => {
        const getData = async()=>{
            const result = await fetch(`/api/maintenance/pm-vine?page=${page}&typeDoc=${typeDoc.value}`)
            const data = (await result.json()) as MaintenanceVineBeGoneData
            setShowData(data.filteredDocuments)
            setTotalDocuments(data.totalDocuments)
            console.log(data)
        }
        setShowData(createArrayObject(6,null))
        getData()
    }, [page,typeDoc]);


  return (
    <div className="flex  flex-col p-4 min-h-screen">
        <p className="m-3">รายการสิ่งผิดปกติ</p>
        <Grid container sx={{margin:"1rem auto 1rem",rowGap: "1rem",justifySelf:"center"}}>
            <Grid item xs={12} sx={{display:"flex",justifyContent:"end",alignItems:"center",gap:"1rem",flexWrap:"wrap"}}>
                <Autocomplete
                    onChange={handleChangeAutoComplete}
                    value={typeDoc}
                    defaultValue={filterOptions[2]}
                    disablePortal
                    options={filterOptions}
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} label="ตัวกรอง" />}
                />
                <Typography>จำนวน: {totalDocuments}</Typography>
                <Pagination count={Math.ceil(totalDocuments/6)} page={page} onChange={(e,v)=>setPage(v)} />
            </Grid>
            {showData.map((v,i)=>{return(
                <Grid key={i} item xs={12} sm={6} md={4} sx={{display:"flex",justifyContent:"center"}}> 
                    <MaintenanceImgMediaCard data={v}/>
                </Grid>
            )})}
            <Grid item xs={12} sx={{display:"flex",justifyContent:"end"}}>
                <Typography>จำนวน: {totalDocuments}</Typography>
                <Pagination count={Math.ceil(totalDocuments/6)} page={page} onChange={(e,v)=>setPage(v)} />
            </Grid>
        </Grid>
    </div>
  );
}
  
  function createArrayObject<T>(
    length: number,
    obj: T
  ): T[] {
    return Array.from({ length }, () => (obj)) as T[];
  }

type FilterOption = {
    label: string;
    value: "all"|"success"|"progress";
}

const filterOptions: FilterOption[] = [
    {label: "ทั้งหมด", value:"all"},
    {label: "แก้ไขแล้ว", value:"success"},
    {label: "รอการแก่ไข", value:"progress"},
] 

