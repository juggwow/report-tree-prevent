import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useState, ChangeEvent, useRef, useEffect } from "react";
import { styled } from "@mui/material/styles";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import exifr from "exifr";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocationOffIcon from "@mui/icons-material/LocationOff";
import BusinessIcon from "@mui/icons-material/Business";
import AlertSnackBar from "@/components/alert-snack-bar";
import { snackBar } from "@/types/report-prevent";
import LoadingBackDrop from "@/components/loading-backdrop";
import Head from "next/head";
import { signIn, useSession } from "next-auth/react";
import {
  Karnfaifa,
  RequestData,
  Geolocation,
  ResponeUploadImageFail,
  ResponeUploadImageSuccess,
} from "@/types/vine-be-gone-now";

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

  return {
    props: {
      vine: true,
    },
  };
}

export default function VineBeGoneNow() {
  const { data, status } = useSession();
  if (status == "unauthenticated") {
    signIn("line", { callbackUrl: "/vine-be-gone-now?liff=TRUE" });
  }
  const [positionError, setPositionError] = useState<string>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [geolocation, setGeolocation] = useState<Geolocation | null>(null);
  const [snackBar, setSnackBar] = useState<snackBar>({
    sevirity: "success",
    massege: "",
    open: false,
  });
  const [progress, setProgress] = useState<boolean>(false);
  const [isCompletedUpload, setIsCompleteUpload] = useState<boolean>(false);

  const formRef = useRef<HTMLFormElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleCancel = () => {
    setIsCompleteUpload(false);
    setGeolocation(null);
    setSelectedImage(null);
    formRef.current?.reset();
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

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) {
      setSnackBar({
        sevirity: "error",
        massege: "เกิดข้อผิดพลาด ฟอร์มของคุณไม่ถูกต้อง",
        open: true,
      });
      return;
    }

    if (!selectedImage || !geolocation) {
      setSnackBar({
        sevirity: "error",
        massege: "เกิดข้อผิดพลาด ไม่มีรูปภาพ หรือไม่มีตำแหน่ง",
        open: true,
      });
      return;
    }

    setProgress(true);
    const uploadedImage = await uploadPhoto(selectedImage);
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

  const retrieveGeoArterPhotoUploap = () => {
    if (!imgRef.current) {
      return;
    }

    const gpsPromise = exifr.gps(imgRef.current);

    const timeoutPromise = new Promise<{}>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Timeout exceeded"));
      }, 5000);
    });

    Promise.race([gpsPromise, timeoutPromise])
      .then(async (val: { latitude?: number; longitude?: number }) => {
        if (val && val.latitude && val.longitude) {
          setGeolocation({
            lat: val.latitude.toFixed(6),
            lon: val.longitude.toFixed(6),
            karnfaifa: await findBusinessArea(val.latitude, val.longitude),
          });
          setIsCompleteUpload(true);
          setProgress(false);
        } else {
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
              setIsCompleteUpload(true);
              setProgress(false);
            },
            (error) => {
              handleGeolocationError(error);
              setGeolocation(null);
              setIsCompleteUpload(true);
              setProgress(false);
            },
          );
        }
      })
      .catch(async () => {
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
            setIsCompleteUpload(true);
            setProgress(false);
          },
          (error) => {
            handleGeolocationError(error);
            setGeolocation(null);
            setIsCompleteUpload(true);
            setProgress(false);
          },
        );
      });
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setGeolocation(null);
    setSelectedImage(null);
    setIsCompleteUpload(false);
    setProgress(true);
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        setTimeout(retrieveGeoArterPhotoUploap, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Head>
        <title>เถาวัลย์จงหายไป</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <form ref={formRef} onSubmit={handleSubmit}>
        <Box sx={{ maxWidth: "430px", margin: "1rem auto 0" }}>
          <Button
            component="label"
            variant="contained"
            sx={{ width: "100%" }}
            startIcon={<InsertPhotoIcon />}
          >
            Upload or Take Photo
            <VisuallyHiddenInput
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </Button>
          {selectedImage && (
            <Card
              sx={{
                width: "100%",
                margin: "1rem auto 0",
                padding: "1rem 0.5rem 0.5rem",
                fontSize: "14px",
              }}
            >
              <img
                ref={imgRef}
                src={selectedImage}
                alt="Selected"
                style={{
                  maxWidth: "100%",
                  height: "300px",
                  objectFit: "contain",
                  margin: "auto",
                }}
              />
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
              {!geolocation && isCompletedUpload && (
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={1}>
                      <LocationOffIcon color="error" />
                    </Grid>
                    <Grid item xs={11}>
                      ไฟล์รูปไม่มีตำแหน่ง และ {positionError}{" "}
                      กรุณาลองใหม่อีกครั้ง
                    </Grid>
                  </Grid>
                </CardContent>
              )}
              <CardActions sx={{ direction: "flex", justifyContent: "end" }}>
                {isCompletedUpload && (
                  <Button onClick={handleCancel}>Cancel</Button>
                )}
                {geolocation && geolocation.karnfaifa && isCompletedUpload && (
                  <Button type="submit">Send</Button>
                )}
              </CardActions>
            </Card>
          )}
        </Box>
        <AlertSnackBar setSnackBar={setSnackBar} snackBar={snackBar} />
        <LoadingBackDrop setProgress={setProgress} progress={progress} />
      </form>
    </>
  );
}
