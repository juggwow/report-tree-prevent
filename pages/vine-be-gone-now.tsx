import { useRef, useState, useCallback, useEffect, ChangeEvent } from "react";
import Webcam from "react-webcam";
import Head from "next/head";
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocationOffIcon from "@mui/icons-material/LocationOff";
import BusinessIcon from "@mui/icons-material/Business";
import { snackBar } from "@/types/report-prevent";
import { Box, Button, Card, CardContent, Grid, TextField, CardActions } from "@mui/material";
import {
  Karnfaifa,
  RequestData,
  Geolocation,
  ResponeUploadImageFail,
  ResponeUploadImageSuccess,
} from "@/types/vine-be-gone-now";
import { getSession, signIn, useSession } from "next-auth/react";
import AlertSnackBar from "@/components/alert-snack-bar";
import LoadingBackDrop from "@/components/loading-backdrop";

const videoConstraints = {
  width: 360,
  height: 360,
  facingMode: "environment"
};

const findBusinessArea = async (
  lat: number,
  lon: number,
): Promise<Karnfaifa | null> => {
  const res = await fetch("/api/lat-lon-to-aoj", {
    method: "POST",
    body: JSON.stringify({
      lat,
      lon,
    }),
  });
  if (res.status != 200) {
    return null;
  }
  return (await res.json()) as Karnfaifa;
};

const uploadPhoto = async (
  file: string,
): Promise<ResponeUploadImageSuccess | null> => {
  const uploadResult = await fetch(
    "https://script.google.com/macros/s/AKfycbyTltbACbFhsd7ubH22dGXUyI0OShWmJe551lVfUg7KhgZkpJTl4F6AwElGk09ZKZPw/exec",
    {
      method: "POST",
      body: file,
    },
  );
  const uploadedImage: ResponeUploadImageSuccess | ResponeUploadImageFail =
    await uploadResult.json();
  if ("error" in uploadedImage) {
    return null;
  }
  return uploadedImage;
};

export async function getServerSideProps(context: any) {
  const liff = context.query.liff;
  if (liff != "TRUE") {
    return {
      redirect: {
        destination: "/404",
      },
    };
  }

  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/linelogin?link=/test?liff=TRUE",
      },
    };
  }

  if (!session.pea) {
    return {
      redirect: {
        destination: "/profile?link=/test?liff=TRUE",
      },
    };
  }

  return {
    props: {
      vine: true,
    },
  };
}

export default function App() {
  
  const webcamRef = useRef<Webcam>(null);
  const [geolocation, setGeolocation] = useState<Geolocation>({
    lat: "0.0000",
    lon: "0.0000",
    karnfaifa: null
  });
  const [snackBar, setSnackBar] = useState<snackBar>({
    sevirity: "success",
    massege: "",
    open: false,
  });
  const [progress, setProgress] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [positionError, setPositionError] = useState<string>();

  const setLocation = useCallback(async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setGeolocation({
          lat: position.coords.latitude.toFixed(6).toString(),
          lon: position.coords.longitude.toFixed(6).toString(),
          karnfaifa: await findBusinessArea(
            position.coords.latitude,
            position.coords.longitude,
          ),
        });
      },
      (error) => {
        handleGeolocationError(error);
        setGeolocation({
          lat: "0.0000",
          lon: "0.0000",
          karnfaifa: null
        } );
      },
    );

  },[])

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setUrl(imageSrc);
    }
    console.log(imageSrc)
  }, [webcamRef]);

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProgress(true)

    const form = formRef.current;
    if (!form) {
      setSnackBar({
        sevirity: "error",
        massege: "เกิดข้อผิดพลาด ฟอร์มของคุณไม่ถูกต้อง",
        open: true,
      });
      return;
    }

    if (!url || !geolocation.karnfaifa) {
      setSnackBar({
        sevirity: "error",
        massege: "เกิดข้อผิดพลาด ไม่มีรูปภาพ หรือไม่มีตำแหน่ง",
        open: true,
      });
      return;
    }

    setProgress(true);
    const uploadedImage = await uploadPhoto(url);
    if (!uploadedImage) {
      setProgress(false);
      setSnackBar({
        sevirity: "error",
        massege: "เกิดข้อผิดพลาด ไม่สามารถอัปโหลดรูปภาพได้",
        open: true,
      });
      return;
    }

    const body: RequestData = {
      ...geolocation,
      riskPoint: form["riskPoint"].value,
      place: form["place"].value,
      uploadedImage,
    };
    const res = await fetch("/api/vine-be-gone-now/report-risk", {
      method: "POST",
      body: JSON.stringify(body),
    });
    setProgress(false);
    if (res.status != 200) {
      setSnackBar({
        sevirity: "error",
        massege: "เกิดข้อผิดพลาดกับระบบ",
        open: true,
      });
      return;
    }

    handleCancel();
    setSnackBar({
      sevirity: "success",
      massege: "สำเร็จ",
      open: true,
    });
  };

  const handleCancel = () => {
    setGeolocation({
      lat: "0.0000",
      lon: "0.0000",
      karnfaifa: null
    });
    setUrl(null);
    formRef.current?.reset();
    setLocation()
  };

  const handleGeolocationError = (error: GeolocationPositionError) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setPositionError("ผู้ใช้ปฏิเสธคำขอตำแหน่ง");
        break;
      case error.POSITION_UNAVAILABLE:
        setPositionError("ไม่พบข้อมูลตำแหน่ง");
        break;
      case error.TIMEOUT:
        setPositionError("หมดเวลาคำขอตำแหน่ง");
        break;
    }
  };

  useEffect(()=>{
    setLocation()
  },[])

  return (
    <>
      <Head>
        <title>เถาวัลย์จงหายไป</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <form onSubmit={handleSubmit} ref={formRef}>
        <Box sx={{ maxWidth: "430px", margin: "1rem auto 0", display:"flex", flexDirection:"column",alignItems:"center"}}>
        {!url?(
          <>
          <Button
            component="label"
            variant="contained"
            sx={{ width: "100%", marginBottom: "1rem" }}
            startIcon={<AddAPhotoIcon />}
            onClick={handleCapture}
          >
            Capture Photo
          </Button>
            
          
          <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
            />
          </>
        ):(<>
        <Button
            component="label"
            variant="contained"
            sx={{ width: "100%", marginBottom: "1rem" }}
            startIcon={<DeleteIcon />}
            onClick={() => {
              setUrl(null);
            }}
          >
            Delete Photo
          </Button>
        <div>
            <img src={url} alt="Screenshot" />
          </div>
          
        </>)}
        <Card
              sx={{
                width: "100%",
                margin: "1rem auto 0",
                padding: "1rem 0.5rem 0.5rem",
                fontSize: "14px",
              }}
            >
              {geolocation && (
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={1}>
                      <LocationOnIcon color="primary" />
                    </Grid>
                    <Grid item xs={11}>
                      ตำแหน่ง: {geolocation.lat},{geolocation.lon}
                    </Grid>
                    <Grid item xs={1}>
                      <BusinessIcon color="primary" />
                    </Grid>
                    <Grid item xs={11}>
                      {geolocation.karnfaifa
                        ? geolocation.karnfaifa.fullName
                        : "ตำแหน่งจุดเสี่ยงอยู่นอกพิ้นที่การไฟฟ้าเขต ยะลา"}
                    </Grid>
                    <Grid item xs={12} sx={{ paddingTop: "0" }}>
                      <TextField
                        disabled = {!geolocation.karnfaifa?true:false}
                        name="riskPoint"
                        required
                        type="text"
                        variant="standard"
                        label="จุดเสี่ยงที่พบ"
                        sx={{ maxWidth: "100%", fontSize: "14px" }}
                      />
                    </Grid>
                    <Grid item xs={12} sx={{ paddingTop: "0" }}>
                      <TextField
                        disabled = {!geolocation.karnfaifa?true:false}
                        name="place"
                        required
                        type="text"
                        variant="standard"
                        label="หมายเลขเสา/สถานที่"
                        sx={{ maxWidth: "100%", fontSize: "14px" }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              )}
              {positionError && (
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={1}>
                      <LocationOffIcon color="error" />
                    </Grid>
                    <Grid item xs={11}>
                      {positionError}{" "}
                    </Grid>
                  </Grid>
                </CardContent>
              )}
              <CardActions sx={{ direction: "flex", justifyContent: "end" }}>
                {geolocation.karnfaifa && url && !positionError && (
                  <Button type="submit">Send</Button>
                )}
              </CardActions>
            </Card>
        
        </Box>
      </form>
      <AlertSnackBar setSnackBar={setSnackBar} snackBar={snackBar}/>
      <LoadingBackDrop setProgress={setProgress} progress={progress}/>  
    </>
  );
};
