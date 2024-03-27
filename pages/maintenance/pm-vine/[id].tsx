import { Box, Button, Card, CardActions, CardMedia, Grid } from "@mui/material";
import React, { ChangeEvent, useEffect, useState } from "react";
import MaintenanceImgMediaCard from "@/components/maintenance/pm-media-card";
import {
  ImgMediaCardProp,
  MaintenanceVineBeGoneData,
  RequestData,
  RequestDataMaintenance,
  ResponeUploadImageFail,
  ResponeUploadImageSuccess,
} from "@/types/vine-be-gone-now";
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next/types";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MapIcon from "@mui/icons-material/Map";
import EngineeringIcon from "@mui/icons-material/Engineering";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/router";
import uploadPhoto from "@/src/uploadimage";
import AlertSnackBar from "@/components/alert-snack-bar";
import LoadingBackDrop from "@/components/loading-backdrop";
import { url } from "inspector";
import { snackBar } from "@/types/report-prevent";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

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

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/signin?link=/maintenance/pm-vine",
      },
    };
  }

  if (!session.pea) {
    return {
      redirect: {
        destination: "/profile?link=/maintenance/pm-vine",
      },
    };
  }
  const mongoClient = await clientPromise;

  await mongoClient.connect();

  try {
    const id = context.params?.id;
    if (!id || Array.isArray(id)) {
      return {
        redirect: {
          destination: "/404",
        },
      };
    }

    const vineBeGoneCollection = mongoClient
      .db("vine-be-gone")
      .collection("risk");
    const query = {
      _id: new ObjectId(id),
    };
    const options = {
      projection: {
        _id: 0,
        id: "$_id",
        riskPoint: 1,
        place: 1,
        lat: 1,
        lon: 1,
        uploadedImage: 1,
        maintenance: 1,
      },
    };

    let doc = (await vineBeGoneCollection.findOne(
      query,
      options,
    )) as null | ImgMediaCardProp;
    if (!doc) {
      await mongoClient.close();
      return {
        redirect: {
          destination: "/404",
        },
      };
    }

    doc.id = (doc.id as ObjectId).toHexString();
    await mongoClient.close();
    return {
      props: {
        doc,
      },
    };
  } catch (err) {
    await mongoClient.close();
    return {
      redirect: {
        destination: "/404",
      },
    };
  }
}

export default function MaintenanceDetail({ doc }: { doc: ImgMediaCardProp }) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [snackBar, setSnackBar] = useState<snackBar>({
    sevirity: "success",
    massege: "",
    open: false,
  });
  const [progress, setProgress] = useState<boolean>(false);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedImage(null);
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (id: string) => {
    if (!selectedImage) {
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
      setProgress(false);
      return;
    }

    const body: RequestDataMaintenance = {
      uploadedImage,
    };
    const res = await fetch(`/api/vine-be-gone-now/maintenance-vine/${id}`, {
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

    setSnackBar({
      sevirity: "success",
      massege: "สำเร็จ",
      open: true,
    });
  };

  return (
    <Box
      sx={{
        maxWidth: "430px",
        margin: "1rem auto 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Card
        sx={{
          width: "100%",
          margin: "1rem auto 0",
          padding: "1rem 0.5rem 0.5rem",
          fontSize: "14px",
        }}
      >
        <Grid container spacing={2}>
          <Grid
            item
            xs={1}
            sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
          >
            <LocationOnIcon color="primary" />
          </Grid>
          <Grid
            item
            xs={11}
            sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
          >
            <Button
              sx={{ padding: "0" }}
              onClick={() =>
                window.open(
                  `https://www.google.com/maps?q=${doc.lat},${doc.lon}`,
                )
              }
            >
              ตำแหน่ง: {doc.lat},{doc.lon}
            </Button>
          </Grid>

          <Grid item xs={1}>
            <EngineeringIcon color="primary" />
          </Grid>
          <Grid item xs={11}>
            จุดเสี่ยงที่พบ: {doc.riskPoint}
          </Grid>
          <Grid item xs={1}>
            <MapIcon color="primary" />
          </Grid>
          <Grid item xs={11}>
            หมายเลขเสา/สถานที่: {doc.riskPoint}
          </Grid>
          <Grid item xs={1}>
            <PhotoCameraIcon color="primary" />
          </Grid>
          <Grid item xs={11}>
            ภาพก่อนการแก้ไข
          </Grid>
          <Grid item xs={12}>
            <CardMedia
              sx={{ margin: "1rem 0 0 0" }}
              crossOrigin="anonymous"
              component="img"
              alt="green iguana"
              image={`https://drive.lienuc.com/uc?id=${doc.uploadedImage.id}`}
            />
          </Grid>
          <Grid item xs={1}>
            <PhotoCameraIcon color="primary" />
          </Grid>
          <Grid item xs={11}>
            ภาพหลังการแก้ไข
          </Grid>
          <Grid item xs={12}>
            {!doc.maintenance && !selectedImage && (
              <Button
                component="label"
                variant="contained"
                sx={{ width: "100%", margin: "1rem 0" }}
                startIcon={<InsertPhotoIcon />}
              >
                Upload รูปภาพที่แก้ไขแล้ว
                <VisuallyHiddenInput
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
            )}
            {!doc.maintenance && selectedImage && (
              <CardMedia
                sx={{ margin: "1rem 0 0 0" }}
                component="img"
                alt="green iguana"
                image={selectedImage}
              />
            )}
            {doc.maintenance && (
              <CardMedia
                crossOrigin="anonymous"
                sx={{ margin: "1rem 0 0 0" }}
                component="img"
                alt="green iguana"
                image={`https://drive.lienuc.com/uc?id=${doc.maintenance.image.id}`}
              />
            )}
          </Grid>
        </Grid>

        <CardActions sx={{ direction: "flex", justifyContent: "end" }}>
          {selectedImage && (
            <Button
              onClick={() => {
                setSelectedImage(null);
              }}
            >
              Cancel
            </Button>
          )}
          {selectedImage && !doc.maintenance && (
            <Button onClick={() => handleSend(doc.id as string)}>Send</Button>
          )}
        </CardActions>
      </Card>
      <Button
        variant="outlined"
        sx={{ margin: "1rem 0 0 0" }}
        onClick={() => router.push("/maintenance/pm-vine")}
      >
        ย้อนกลับ
      </Button>
      <AlertSnackBar setSnackBar={setSnackBar} snackBar={snackBar} />
      <LoadingBackDrop setProgress={setProgress} progress={progress} />
    </Box>
  );
}
