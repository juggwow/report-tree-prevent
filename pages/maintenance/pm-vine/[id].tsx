import {
  Autocomplete,
  Grid,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import MaintenanceImgMediaCard from "@/components/maintenance/pm-media-card";
import {
  ImgMediaCardProp,
  MaintenanceVineBeGoneData,
} from "@/types/vine-be-gone-now";
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next/types";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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
      mongoClient.close();
      return {
        redirect: {
          destination: "/404",
        },
      };
    }

    doc.id = (doc.id as ObjectId).toHexString();
    mongoClient.close();
    return {
      props: {
        doc,
      },
    };
  } catch (err) {
    mongoClient.close();
    return {
      redirect: {
        destination: "/404",
      },
    };
  }
}

export default function MaintenanceDetail({ doc }: { doc: ImgMediaCardProp }) {
  return <>{JSON.stringify(doc)}</>;
}
