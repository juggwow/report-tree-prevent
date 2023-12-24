import AlertSnackBar from "@/components/alert-snack-bar";
import PreventDataTable from "@/components/prevent/report-prevent/prevent-data-table";
import ZPM4Number from "@/components/prevent/report-prevent/zpm4-number";
import clientPromise from "@/lib/mongodb";
import { Order, snackBar } from "@/types/report-prevent";
import { ObjectId } from "mongodb";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PreventData } from "@/types/report-prevent";
import ChoosePreventData from "@/components/prevent/report-prevent/choose-prevent-data";
import { useRouter } from "next/navigation";
import LoadingBackDrop from "@/components/loading-backdrop";

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
  
  try {

    const query = {
      businessName: session.pea.karnfaifa,
      changePlanRequest: {
        $not:{
          $elemMatch: {
            status: "progress",
          },
        }
      }
    }
    const options = {
      projection:{
        _id: 0,
        id: "$_id",
        businessName : 1,
        planName : 1,
        duration: 1,
        zpm4: 1,
        reportDate: 1,
        editDate: 1
      }
    }

    const mongoClient = await clientPromise
    const preventData = (await mongoClient.db("prevent").collection("plan").find(query,options).toArray()) as unknown as PreventData[]

    if (!preventData) {
        return {
          redirect: {
            destination: "/404",
          },
        };
    }
    
    preventData.forEach((val,i,arr)=>{
        arr[i].id = (val.id as ObjectId).toHexString()
      })
      return {
        props: { preventData },
      };
  } catch {
    return {
      redirect: {
        destination: "/404",
      },
    };
  }
}

export default function ReportPrevent({preventData}:{preventData:PreventData[]}) {

    const router = useRouter()
    const [order,setOrder] = useState<Order>({
        no : '',
        disable: false
    })

    const [snackBar,setSnackBar] = useState<snackBar>({
        open: false,
        sevirity: "success",
        massege: ''
    })

    const [choosePreventData,setChoosePreventData] = useState<PreventData[]>([])
    const [showElementChoose,setShowElementChoose] = useState<boolean>(false)
    const [filter,setFilter] = useState<PreventData>({
        id: "",
        businessName: "",
        planName: "",
        duration: "",
    })
    const [showPreventData,setShowPreventData] = useState<PreventData[]>(preventData) 
    const [progress,setProgress] = useState<boolean>(false)

    useEffect(() => {
      let filterData = preventData;
      let chooseID: string[] = [];
  
      choosePreventData.forEach((val) => {
        chooseID.push(val.id as string);
      });
  
      filterData = filterData.filter((val) => {
        return !chooseID.includes(val.id as string);
      });
  
      if (filter.duration != "") {
        filterData = filterData.filter((val) => {
          return val.duration == filter.duration;
        });
      }
  
      if (filter.planName != "") {
        filterData = filterData.filter((val) => {
          return val.planName.includes(filter.planName);
        });
      }
  
      setShowPreventData(filterData);
    }, [filter, choosePreventData]);

    async function sendPreventData() {
      setProgress(true);
      console.log(choosePreventData)
      try {
        const res = await fetch("/api/prevent/report-zpm4", {
          method: "POST",
          body: JSON.stringify(choosePreventData),
        });
        if (res.status == 200) {
          const data = await res.json()
          setSnackBar({
            open: true,
            sevirity: "success",
            massege: data.massege,
          });
          router.refresh();
        } else {
          setProgress(false);
          setSnackBar({
            open: true,
            sevirity: "error",
            massege: "เกิดข้อผิดพลาดบางอย่าง กรุณาลองอีกครั้ง",
          });
        }
      } catch {
        setProgress(false);
        setSnackBar({
          open: true,
          sevirity: "error",
          massege: "เกิดข้อผิดพลาดบางอย่าง กรุณาลองอีกครั้ง",
        });
      }
    }
  return (
    <div className="flex flex-col p-4 min-h-screen">
        <p className="m-3">รายผลการดำเนินงานกิจกรรมป้องกันระบบไฟฟ้า</p>
        <ZPM4Number
            order={order}
            setOrder={setOrder}
            setSnackBar={setSnackBar}
            showElementChoose={showElementChoose}
            setShowElementChoose={setShowElementChoose}
            choosePreventData={choosePreventData}
        />
        <PreventDataTable 
            showElementChoose = {showElementChoose}
            order = {order}
            filter = {filter}
            setFilter = {setFilter}
            showPreventData = {showPreventData}
            choosePreventData = {choosePreventData}
            setChoosePreventData = {setChoosePreventData}
        />
        <ChoosePreventData 
          choosePreventData={choosePreventData}
          setChoosePreventData={setChoosePreventData}
          sendPreventData={sendPreventData}
        />
      <div>
        <Link href="/">กลับสู่หน้าหลัก</Link>
      </div>
      <AlertSnackBar setSnackBar={setSnackBar} snackBar={snackBar} />
      <LoadingBackDrop progress={progress} setProgress={setProgress} />
    </div>
  );
}
