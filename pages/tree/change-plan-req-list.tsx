import AlertSnackBar from "@/components/alert-snack-bar";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getSession } from "next-auth/react";
import { useState } from "react";
import { AlertSnackBarType } from "@/types/snack-bar";
import { FormChangePlanTree } from "@/types/report-tree";
import ChangePlanTreeFormDialog from "@/components/tree/change-plan/form-dialog";
import ChangePlanTreeCard from "@/components/tree/change-plan/change-plan-tree-req-card";
import { useRouter } from "next/router";

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
    const mongoClient = await clientPromise;

    const planTreeCollection = mongoClient.db("tree").collection("plan");

    let docs = await planTreeCollection.aggregate([
        {
          $match: {
            businessName: session.pea.karnfaifa,
          },
        },
        {
          $unwind: {
            path: "$changePlanRequest",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            "changePlanRequest.typeReq": { $in: ["change", "add"] },
          },
        },
        {
          $project: {
            _id: 1,
            status: "$changePlanRequest.status",
            userReq: "$changePlanRequest.userReq",
            reason: "$changePlanRequest.reason",
            oldPlan: "$changePlanRequest.oldPlan",
            newPlan: "$changePlanRequest.newPlan",
            typeReq: "$changePlanRequest.typeReq",
            dateReq: "$changePlanRequest.dateReq",
          },
        },
      ]).toArray() as FormChangePlanTree[];
      
    //const plan = await planLVCollection.find(query,options).toArray();
    let changePlanTreeReq: FormChangePlanTree[] = [];
    docs.forEach((val) => {
      changePlanTreeReq.push({
        ...val,
        _id: val._id instanceof ObjectId ? val._id.toHexString() : val._id,
      });
    });

    docs = await planTreeCollection.aggregate([
        {
          $match: {
            businessName: session.pea.karnfaifa,
          },
        },
        {
          $unwind: {
            path: "$changePlanRequest",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            "changePlanRequest.typeReq": "cancel",
          },
        },
        {
          $project: {
            _id: 1,
            status: "$changePlanRequest.status",
            userReq: "$changePlanRequest.userReq",
            reason: "$changePlanRequest.reason",
            oldPlan: {
                planName: "$planName",
                qauntity:{
                    plentifully: "$qauntity.plentifully",
                    moderate: "$qauntity.moderate",
                    lightly: "$qauntity.lightly",
                    clear: "$qauntity.clear"
                },
                budget: "$budget",
                systemVolt: "$systemVolt",
                month: "$month",
                hireType: "$hireType"
            },
            typeReq: "$changePlanRequest.typeReq",
            dateReq: "$changePlanRequest.dateReq",
          },
        },
      ]).toArray() as FormChangePlanTree[];

    docs.forEach((val) => {
        changePlanTreeReq.push({
          ...val,
          _id: val._id instanceof ObjectId ? val._id.toHexString() : val._id,
        });
    });

    return {
      props: { changePlanTreeReq },
    };
  } catch (e) {
    console.error(e);
    return {
      props: { changePlanTreeReq: [] },
    };
  }
}

export default function ChangePlanReqList({
  changePlanTreeReq,
}: {
  changePlanTreeReq: FormChangePlanTree[];
}) {
  const router = useRouter()
  const [openDialog, setOpenDialog] = useState(false);
  const [snackBar, setSnackBar] = useState<AlertSnackBarType>({
    open: false,
    sevirity: "success",
    massege: "",
  });

  const [changePlanRequire, setChangePlanRequire] = useState<FormChangePlanTree>({
    _id: "",
    oldPlan: {
        planName: "",
        qauntity: {
            plentifully: 0,
            moderate: 0,
            lightly: 0,
            clear: 0
        },
        budget: 0,
        systemVolt: "33kV",
        month: "",
        hireType: "normal"
    },
    newPlan: {
        planName: "",
        qauntity: {
            plentifully: 0,
            moderate: 0,
            lightly: 0,
            clear: 0
        },
        budget: 0,
        systemVolt: "33kV",
        month: "",
        hireType: "normal"
    },
    typeReq: "change"
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await fetch("/api/tree/request-change-plan", {
      method: "PUT",
      body: JSON.stringify(changePlanRequire),
    });
    if (res.status != 200) {
      setSnackBar({ sevirity: "error", massege: "เกิดข้อผิดพลาด", open: true });
      return;
    }
    console.log(changePlanRequire)
    setSnackBar({ sevirity: "success", massege: "สำเร็จ", open: true });
    setOpenDialog(false);
    router.reload()
  };

  const handleEdit = async(changePlanRequire:FormChangePlanTree)=>{
    {
                setChangePlanRequire(changePlanRequire);
                setOpenDialog(true);
              }
  }

  const handleCancel = async(changePlanRequire:FormChangePlanTree)=>{
                const res = await fetch("/api/tree/request-change-plan", {
                  method: "PATCH",
                  body: JSON.stringify(changePlanRequire),
                });
                if (res.status != 200) {
                  setSnackBar({ sevirity: "error", massege: "เกิดข้อผิดพลาด", open: true });
                  return;
                }
                console.log(changePlanRequire)
                setOpenDialog(false);

                setSnackBar({ sevirity: "success", massege: "สำเร็จ", open: true });
                router.reload()
  }

  return (
    <div className="grid grid-cols-6 gap-3 mx-auto m-3 p-3">
      {changePlanTreeReq.map((val) => {
        return (
          <div
            key={val._id as string}
            className="col-span-6 sm:col-span-3 md:col-span-2"
          >
            <ChangePlanTreeCard
              plan={val}
              onClickEdit={() => handleEdit(val) }
              onClickCancel={() => handleCancel(val) 
                
              }
            />
          </div>
        );
      })}
      <ChangePlanTreeFormDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        handleSubmit={handleSubmit}
        changePlanRequire={changePlanRequire}
        setChangePlanRequire={setChangePlanRequire}
        setSnackBar={setSnackBar}
        snackBar={snackBar}
        defaultValOldPlan={false}
      />
      <AlertSnackBar setSnackBar={setSnackBar} snackBar={snackBar} />
    </div>
  );
}

