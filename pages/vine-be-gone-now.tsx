import { Box, Button, Card, CardActions, CardContent, Grid, Typography } from "@mui/material";
import { useState, ChangeEvent } from "react";
import { styled } from "@mui/material/styles";
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import exifr from "exifr";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import { findAOJ } from "@/lib/find-AOJ";

export async function getServerSideProps(context:any) {
  // console.log(findAOJ(7.032826, 100.472274))
  // const test = "" 
  return {
    props: {}
  }
}

type Geolocation = {
  lat: string;
  long: string;
  source: "image" | "current";
};

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

export default function VineBeGoneNow() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [geolocation, setGeolocation] = useState<Geolocation | null>(null);

  const handleCancel = ()=>{
    setGeolocation(null),
    setSelectedImage(null)
  }


  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);

        exifr
          .gps(file)
          .then((val) => {
            if (val) {
              setGeolocation({
                lat: val.latitude.toFixed(6).toString(),
                long: val.longitude.toFixed(6).toString(),
                source: "image",
              });
            }
            else{
                navigator.geolocation.getCurrentPosition((geo) => {
                    if (geo) {
                      setGeolocation({
                        lat: geo.coords.latitude.toFixed(6).toString(),
                        long: geo.coords.longitude.toFixed(6).toString(),
                        source: "current",
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
            
                {geolocation && (
                  <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={1}>
                            <LocationOnIcon color="primary"/>
                        </Grid>
                        <Grid item xs={11}>
                            ตำแหน่งปัจจุบัน: {geolocation.lat},{geolocation.long}`
                        </Grid>
                        <Grid item xs={1}>
                            <BusinessIcon color="primary"/>
                        </Grid>
                        <Grid item xs={11}>
                            {"การไฟฟ้าส่วนภูมิภาคสาขาหาดใหญ่"}
                        </Grid>
                    </Grid>
                  </CardContent>
                )}
                <CardActions sx={{direction:"flex",justifyContent:"end"}}>
                    <Button onClick={handleCancel}>Cancel</Button>
                    {geolocation && <Button>Send</Button>}
                </CardActions>
                
            </Card>
      )}
    </Box>
  );
}
