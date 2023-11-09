import { getSession } from "next-auth/react";
import Link from "next/link";

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

export default function ReportPrevent() {
  return (
    <div className="flex flex-col p-4 min-h-screen">
      <div>รายงานป้องกัน</div>
      <div>
        <Link href="/">กลับสู่หน้าหลัก</Link>
      </div>
    </div>
  );
}