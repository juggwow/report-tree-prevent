import LoadingBackDrop from "@/components/loading-backdrop";
import type { NextPage } from "next";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

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
  const [progress, setProgress] = useState(false);

  return (
    <div className="flex flex-col bg-white p-3 mx-6 mt-24 rounded ">
      <div className="flex justify-center ">
        <Link
          href="/report-tree"
          onClick={() => setProgress(true)}
          type="button"
          className="btn btn-primary py-1 px-4 mt-6 border border-slate-300 rounded-full hover:bg-slate-50 hover:shadow-md"
        >
          ลงข้อมูล ZPM4/PO งานตัดต้นไม้
        </Link>
      </div>
      <div className="flex justify-center ">
        <Link
          href="/report-prevent"
          onClick={() => setProgress(true)}
          type="button"
          className="btn btn-primary py-1 px-4 my-6 border border-slate-300 rounded-full hover:bg-slate-50 hover:shadow-md"
        >
          ลงข้อมูล ZPM4 งบป้องกันระบบไฟฟ้า
        </Link>
      </div>

      <LoadingBackDrop progress={progress} setProgress={setProgress}/>
    </div>
  );
};

export default Home;
