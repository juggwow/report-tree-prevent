import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Box, Chip, Skeleton } from '@mui/material';
import { useRef, useState } from 'react';
import { ImgMediaCardProp, RequestData } from '@/types/vine-be-gone-now';
import { useRouter } from 'next/router';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import EngineeringIcon from '@mui/icons-material/Engineering';



export default function MaintenanceImgMediaCard({data}:{data: ImgMediaCardProp | null }) {
    const router = useRouter()
    const [isLoaded,setIsLoaded]= useState(false)
    const imgRef= useRef<HTMLImageElement | null>(null)
    const handleOnload = ()=>{
        setIsLoaded(true)
        imgRef.current?.classList.remove("hidden")
    }
    if(!data){
        return (
            <Card sx={{ width: 345 }}>
                <Skeleton variant="rectangular" width={345} height={300} />
                <CardContent>
                    <Skeleton variant="rectangular" width={132} height={32} />
                    <Typography variant="body2" color="text.secondary" sx={{margin:"1rem 0 0.5rem 0"}}>
                        <Skeleton variant="text" />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        :<Skeleton variant="text" />
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="small" disabled>แผนที่</Button>
                    <Button size="small" disabled>แก้ไข</Button>
                </CardActions>
            </Card>
        )
    }
  return (
        <Card sx={{ width: 345 }}>
            <CardMedia
                ref={imgRef}
                onLoad={handleOnload}
                component="img"
                alt="green iguana"
                sx={{objectFit:"cover",height:"300px"}}
                className='hidden'
                image={data?data.uploadedImage.url:""}
            />
            <CardContent>
                <Chip
                    sx={{padding:"0 0.5rem"}}
                    label={data.maintenance?"แก้ไขแล้ว":"รอการแก้ไข"}
                    color={data.maintenance?"success":"warning"}
                    icon={data.maintenance?<DoneOutlineIcon/>:<EngineeringIcon/>}
                />
                
                <Typography variant="body2" color="text.secondary" sx={{margin:"1rem 0 0.5rem 0"}}>
                    สิ่งผิดปกติ: {data.riskPoint}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    หมายเลขเสา/สถานที่: {data.place}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" onClick={()=>window.open(`https://www.google.com/maps?q=${data.lat},${data.lon}`)}>แผนที่</Button>
                <Button size="small" onClick={()=>router.push(`/maintenance/pm-vine/${data.id as string}`)}>{data.maintenance?"รายละเอียดการแก้ไข":"แก้ไข"}</Button>
            </CardActions>
        </Card>
  );
}