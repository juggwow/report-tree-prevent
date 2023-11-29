import AlertSnackBar from "@/components/alert-snack-bar";
import ChangePlanLVCard from "@/components/patrol-lv/change-plan-req-card";
import clientPromise from "@/lib/mongodb";
import { peaUser } from "@/types/next-auth";
import { ChangePlanLV } from "@/types/plan-lv";
import { ObjectId } from "mongodb";
import { getSession } from "next-auth/react";
import { useState } from "react";
import ChangePlanLVFormDialog from "@/components/patrol-lv/form-dialog";
import { AlertSnackBarType } from "@/types/snack-bar";

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

    const planLVCollection = mongoClient.db("patrol-LV").collection("plan");

    const query = {
      businessName: session.pea.karnfaifa,
      changePlanRequest: {
        $not: {
          $elemMatch: {
            status: "progress",
          },
        },
      },
    };

    const options = {
      projection: {
        _id: 1,
        feeder: 1,
        peaNo: 1,
        distanceCircuit: 1,
        businessArea: 1,
        businessName: 1,
      },
    };

    const docs = (await planLVCollection
      .aggregate([
        {
          $match: {
            businessName: session.pea.karnfaifa,
          },
        },
        {
          $unwind: "$changePlanRequest",
        },
        {
          $project: {
            _id: 1,
            status: "$changePlanRequest.status",
            userReq: "$changePlanRequest.userReq",
            reason: "$changePlanRequest.reason",
            oldPlan: "$changePlanRequest.oldPlan",
            changeReq: "$changePlanRequest.changeReq",
            dateReq: "$changePlanRequest.dateReq",
          },
        },
      ])
      .toArray()) as unknown as PlanLVChangeReq[];
    //const plan = await planLVCollection.find(query,options).toArray();
    let changePlanLVReq: PlanLVChangeReq[] = [];
    docs.forEach((val) => {
      changePlanLVReq.push({
        ...val,
        _id: val._id instanceof ObjectId ? val._id.toHexString() : val._id,
      });
    });

    return {
      props: { changePlanLVReq },
    };
  } catch (e) {
    console.error(e);
    return {
      props: { changePlanLVReq: [] },
    };
  }
}

export default function ChangePlanReqList({
  changePlanLVReq,
}: {
  changePlanLVReq: PlanLVChangeReq[];
}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [snackBar, setSnackBar] = useState<AlertSnackBarType>({
    open: false,
    sevirity: "success",
    massege: "",
  });

  const [changePlanRequire, setChangePlanRequire] = useState<ChangePlanLV>({
    plan_id: "",
    newPlan: {
      peaNo: "",
      feeder: "",
      distanceCircuit: 0,
    },
    oldPlan: {
      peaNo: "",
      feeder: "",
      distanceCircuit: 0,
    },
    reason: "",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log(changePlanRequire);

    const res = await fetch("/api/plan-lv/request-change-plan", {
      method: "PUT",
      body: JSON.stringify(changePlanRequire),
    });

    if (res.status != 200) {
      setSnackBar({ sevirity: "error", massege: "เกิดข้อผิดพลาด", open: true });
      return;
    }

    setSnackBar({ sevirity: "success", massege: "สำเร็จ", open: true });

    setOpenDialog(false);
  };

  return (
    <div className="grid grid-cols-6 gap-3 mx-auto m-3 p-3">
      {changePlanLVReq.map((val) => {
        return (
          <div
            key={val._id as string}
            className="col-span-6 sm:col-span-3 md:col-span-2"
          >
            <ChangePlanLVCard
              plan={val}
              onClickEdit={() => {
                setChangePlanRequire({
                  plan_id: String(val._id),
                  newPlan: val.changeReq,
                  oldPlan: val.oldPlan,
                  reason: val.reason,
                });
                setOpenDialog(true);
              }}
              onClickCancel={() => {}}
            />
          </div>
        );
      })}
      <ChangePlanLVFormDialog
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

interface PlanLVChangeReq {
  _id: ObjectId | string;
  status: "progress" | "success" | "reject";
  userReq: peaUser;
  reason: string;
  oldPlan: {
    peaNo: string;
    distanceCircuit: number;
    feeder: string;
  };
  changeReq: {
    peaNo: string;
    distanceCircuit: number;
    feeder: string;
  };
  dateReq: string;
}
