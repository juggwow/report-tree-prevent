import { Box, Button, Card, CardActions, CardContent, Grid, TextField, Typography } from "@mui/material";
import { useState, ChangeEvent, useRef, useEffect } from "react";
import { styled } from "@mui/material/styles";
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import exifr from "exifr";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import AlertSnackBar from "@/components/alert-snack-bar";
import { snackBar } from "@/types/report-prevent";
import LoadingBackDrop from "@/components/loading-backdrop";
import { signIn } from "next-auth/react";

type Karnfaifa = {
    businessName: string;
    fullName: string;
    aoj:string
}
type Geolocation = {
  lat: string;
  lon: string;
  karnfaifa: Karnfaifa | null;
};

type RequestData = Geolocation & {riskPoint: string; place: string; file: string}

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const findBusinessArea = async(lat:number,lon:number):Promise<Karnfaifa|null>=>{
  console.log(lat,lon)
  const res = await fetch('/api/lat-lon-to-aoj', {
    method: "POST",
    body: JSON.stringify({
      lat,
      lon
  })})
  if(res.status != 200){
    return null
  }
  return (await res.json()) as Karnfaifa
}

export async function getServerSideProps(context: any) {
  if(context.query.liff != "TRUE"){
    return {
      redirect: {
        desination: "/404?liff=TRUE"
      }
    }
  }

  return {
    props : null
  }
}

export default function VineBeGoneNow() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [geolocation, setGeolocation] = useState<Geolocation | null>(null);
  const [snackBar,setSnackBar] = useState<snackBar>({
    sevirity: "success",
    massege: "",
    open: false
  })
  const [progress,setProgress]= useState<boolean>(false)

  const formRef = useRef<HTMLFormElement|null>(null)

  const handleCancel = ()=>{
    setGeolocation(null)
    setSelectedImage(null)
    formRef.current?.reset()
  }

  const handleSubmit = async(e:ChangeEvent<HTMLFormElement>)=>{
    e.preventDefault()
    const form = formRef.current
    if(!form){
      setSnackBar({
        sevirity: "error",
        massege: "เกิดข้อผิดพลาด",
        open: true
      })
      return
    }

    if(!selectedImage || !geolocation){
      setSnackBar({
        sevirity: "error",
        massege: "เกิดข้อผิดพลาด",
        open: true
      })
      return
    }
    const body:RequestData = {
      ...geolocation,
      riskPoint : form['riskPoint'].value,
      place: form['place'].value,
      file: selectedImage
    }
    setProgress(true)
    const res = await fetch("/api/vine-be-gone-now/report-risk",{
      method: "POST",
      body: JSON.stringify(body)
    })
    setProgress(false)
    if(res.status != 200){
      setSnackBar({
        sevirity: "error",
        massege: "เกิดข้อผิดพลาด",
        open: true
      })
      return
    }

    handleCancel()
    setSnackBar({
      sevirity: "success",
      massege: "สำเร็จ",
      open: true
    })
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setGeolocation(null)
    setSelectedImage(null)  
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);

        exifr
          .gps(file)
          .then(async (val) => {
            if (val) {
              setGeolocation({
                lat: val.latitude.toFixed(6).toString(),
                lon: val.longitude.toFixed(6).toString(),
                karnfaifa: await findBusinessArea(val.latitude,val.longitude),
              });
            }
            else{
                navigator.geolocation.getCurrentPosition(async (geo) => {
                    if (geo) {
                      setGeolocation({
                        lat: geo.coords.latitude.toFixed(6).toString(),
                        lon: geo.coords.longitude.toFixed(6).toString(),
                        karnfaifa: await findBusinessArea(geo.coords.latitude,geo.coords.longitude),
                      });
                    }
                  });
            }
          })
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <Box sx={{maxWidth:"430px", margin:"1rem auto 0"}}>
      <Button
        component="label"
        variant="contained"
        sx={{width:"100%"}}
        startIcon={<AddAPhotoIcon />}
      >
        Take photo
        <VisuallyHiddenInput
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          capture="environment"
        />
      </Button>
      {selectedImage && (
        <Card sx={{width: "100%", margin: "1rem auto 0", padding: "1rem 0.5rem 0.5rem", fontSize:"14px"}}>
          <img
            src={selectedImage}
            alt="Selected"
            style={{ maxWidth: "100%", height: "300px", objectFit:"contain", margin: "auto" }}
          />
                {geolocation&&(
                  <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={1}>
                            <LocationOnIcon color="primary"/>
                        </Grid>
                        <Grid item xs={11}>
                            ตำแหน่งปัจจุบัน: {geolocation.lat},{geolocation.lon}
                        </Grid>
                        <Grid item xs={1}>
                            <BusinessIcon color="primary"/>
                        </Grid>
                        <Grid item xs={11}>
                            {geolocation.karnfaifa?geolocation.karnfaifa.fullName:"ตำแหน่งจุดเสี่ยงอยู่นอกพิ้นที่การไฟฟ้าเขต ยะลา"}
                        </Grid>
                        <Grid item xs={12} sx={{paddingTop: "0"}}>
                          <TextField name="riskPoint" required type="text" variant="standard" label="จุดเสี่ยงที่พบ" sx={{maxWidth:"100%", fontSize:"14px"}}/>
                        </Grid>
                        <Grid item xs={12} sx={{paddingTop: "0"}}>
                          <TextField name="place" required type="text" variant="standard" label="หมายเลขเสา/สถานที่" sx={{maxWidth:"100%" , fontSize:"14px"}}/>
                        </Grid>
                    </Grid>
                  </CardContent>
                )}
                <CardActions sx={{direction:"flex",justifyContent:"end"}}>
                    <Button onClick={handleCancel}>Cancel</Button>
                    {geolocation && geolocation.karnfaifa && <Button type="submit">Send</Button>}
                </CardActions>
            </Card>
      )}
    </Box>
    <AlertSnackBar setSnackBar={setSnackBar} snackBar={snackBar}/>
    <LoadingBackDrop setProgress={setProgress} progress={progress}/>
    </form>
  );
}
