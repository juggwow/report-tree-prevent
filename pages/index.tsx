import type { NextPage } from "next";
import { useEffect, useMemo, useState } from "react";
import { signIn, useSession, signOut, getSession } from "next-auth/react";
import { decode, getToken } from "next-auth/jwt";

type Myco = {
  lat: number;
  lng: number;
};

export async function getServerSideProps(context: any) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/signin",
      },
    };
  }

  if (!session.pea) {
    return {
      redirect: {
        destination: "/profile",
      },
    };
  }
  return {
    props: {},
  };
}

const Home: NextPage = () => {
  

  //สร้างเส้นทางบนแผนที่ google map
  // const calculateRoute = async()=>{
  //   const directionsService = new google.maps.DirectionsService()
  // const results = await directionsService.route({
  //   origin: "27.672932021393862,85.31184012689732",
  //   destination: "27.670719, 85.320251",
  //   // eslint-disable-next-line no-undef
  //   travelMode: google.maps.TravelMode.DRIVING,
  // })
  // setDirectionsResponse(results)
  // }

  // calculateRoute()

  return (
    <div className="flex flex-col">
      <div className="flex justify-center ">
        <p>This is Sidebar...</p>
      </div>
      <div className="flex justify-center ">
        <button
          onClick={() => signIn("google")}
          type="button"
          className="btn btn-primary"
        >
          Sign In with Google
        </button>
      </div>
      <div className="flex justify-center ">
        <button
          onClick={() => signIn("line")}
          type="button"
          className="btn btn-primary"
        >
          Sign In with Line
        </button>
      </div>
      <div className="flex justify-center ">
        <button
          onClick={() => {
            signOut();
          }}
          type="button"
          className="btn btn-primary"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Home;
