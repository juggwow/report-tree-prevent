import { getSession } from "next-auth/react";
import Link from "next/link";
import { NextPage } from "next";

type treeData = {
  id: string,
  zpm4Name : string,
  month: string,
  karnfaifa: string,
  zpm4PO: string,
}

interface Props {
  treeData: treeData[]
}

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

    const res = await fetch(`https://script.google.com/macros/s/AKfycby0DVu9COEYPZLlPkbJZEPrj1cWj2DW1WJasZQd6f6AhQLYDR2hcP8RDsOwmOIGaD909Q/exec?karnfaifa=${session.pea.karnfaifa}`)
    const treeData:treeData = await res.json()
    return {
      props: {treeData},
    };
  }

export default function ReportTree(props:Props) {
  return (
    <div className="flex flex-col p-4 min-h-screen">
      <div>รายงานต้นไม้</div>
      <ul>
        {props.treeData.map((val)=>{
          return (
            <li key={val.id}>{val.zpm4Name}</li>
          )
        })}
      </ul>
      <div>
        <Link href="/">กลับสู่หน้าหลัก</Link>
      </div>
    </div>
  );
}