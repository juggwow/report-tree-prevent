import optionsKarnfaifa from "@/src/karnfaifa";
import sendProfileForm from "@/src/sendprofileform";
import { peaUser } from "@/types/next-auth";
import { getSession, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { TextField, Autocomplete, Button } from "@mui/material";
import AlertSnackBar from "@/components/alert-snack-bar";
import LoadingBackDrop from "@/components/loading-backdrop";
import { snackBar } from "@/types/report-tree";

export async function getServerSideProps(context: any) {
  const session = await getSession(context);
  const link = context.query.link ? context.query.link : "/";

  if (!session || !session.sub) {
    return {
      redirect: {
        destination: "/signout",
      },
    };
  }

  if (session.pea) {
    return {
      props: {
        pea: session.pea,
        link,
      },
    };
  }

  return {
    props: {
      pea: null,
      link,
    },
  };
}

export default function ProfilePage({
  pea,
  link,
}: {
  pea: peaUser | null;
  link: string;
}) {
  const router = useRouter();
  const [peaUser, setPeaUser] = useState<peaUser>(pea ? pea : {});
  const { data: session, update } = useSession();

  const [snackBar, setSnackBar] = useState<snackBar>({
    massege: "",
    open: false,
    sevirity: "success",
  });

  const [progress, setProgress] = useState(false);

  useEffect(() => {
    if (pea) {
      setPeaUser(pea);
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const path = await sendProfileForm(peaUser);
    if (path) {
      setSnackBar({
        massege: "แก้ไข/เพิ่มข้อมูลสำเร็จ",
        sevirity: "success",
        open: true,
      });
      setProgress(true);
      if (path == "/") {
        update();
      }
      if(link == "/"){
        router.push("/")
      }
      router.push(link);
    } else {
      setSnackBar({
        massege: "แก้ไข/เพิ่มข้อมูล ไม่สำเร็จ กรุณาติดต่อ 0883874774",
        sevirity: "error",
        open: true,
      });
    }
  };

  const validateChecker = () => {
    if (!peaUser) {
      return { pass: false, field: "form" };
    }

    if (
      !(peaUser.firstname && /^[\u0E00-\u0E7Fa-zA-Z]+$/.test(peaUser.firstname))
    ) {
      return { pass: false, field: "firstname" };
    }

    if (
      !(peaUser.lastname && /^[\u0E00-\u0E7Fa-zA-Z]+$/.test(peaUser.lastname))
    ) {
      return { pass: false, field: "lastname" };
    }

    if (!optionsKarnfaifa.includes(peaUser?.karnfaifa!)) {
      return { pass: false, field: "karnfaifa" };
    }

    if (!(peaUser.userid && /^\d{6,7}$/.test(peaUser.userid))) {
      return { pass: false, field: "userid" };
    }

    if (!(peaUser.mobileno && /^\d{10}$/.test(peaUser.mobileno))) {
      return { pass: false, field: "mobileno" };
    }

    return { pass: true, field: "" };
  };

  const { pass, field } = validateChecker();

  return (
    <div className=" mx-auto mt-3 flex flex-col w-96 shadow-xl rounded-xl bg-white">
      <h3 className=" mx-4 mt-8 text-center">
        <BorderColorIcon color="inherit" />
        {pea ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มข้อมูลผู้ใช้"}
      </h3>
      <form className="mx-4 my-8 flex flex-col" onSubmit={handleSubmit}>
        <Autocomplete
          disablePortal
          id="karnfaifa"
          options={optionsKarnfaifa}
          onChange={(e, v) => setPeaUser({ ...peaUser, karnfaifa: v ? v : "" })}
          defaultValue={peaUser?.karnfaifa}
          sx={{ width: "100%" }}
          renderInput={(params) => (
            <TextField
              required
              {...params}
              error={!optionsKarnfaifa.includes(peaUser?.karnfaifa!)}
              label="สังกัด"
            />
          )}
        />
        <TextField
          sx={{ maxWidth: "100%", marginTop: "1rem" }}
          id="firstname"
          label="ชื่อ"
          variant="outlined"
          defaultValue={peaUser?.firstname}
          required
          error={
            !(
              peaUser &&
              peaUser.firstname &&
              /^[\u0E00-\u0E7Fa-zA-Z]+$/.test(peaUser.firstname)
            )
          }
          onChange={(e) => {
            {
              setPeaUser({ ...peaUser, firstname: e.target.value });
            }
          }}
        />
        <TextField
          sx={{ maxWidth: "100%", marginTop: "1rem" }}
          label="สกุล"
          id="lastname"
          variant="outlined"
          defaultValue={peaUser?.lastname}
          required
          error={
            !(
              peaUser &&
              peaUser.lastname &&
              /^[\u0E00-\u0E7Fa-zA-Z]+$/.test(peaUser.lastname)
            )
          }
          onChange={(e) => {
            {
              setPeaUser({ ...peaUser, lastname: e.target.value });
            }
          }}
        />
        <TextField
          sx={{ maxWidth: "100%", marginTop: "1rem" }}
          id="userid"
          label="รหัสพนักงาน"
          variant="outlined"
          required
          defaultValue={peaUser.userid}
          error={
            !(peaUser && peaUser.userid && /^\d{6,7}$/.test(peaUser.userid))
          }
          onChange={(e) => {
            {
              setPeaUser({ ...peaUser, userid: e.target.value });
            }
          }}
          helperText={"เลขรหัสพนักงาน 6-7 หลัก"}
        />
        <TextField
          sx={{ maxWidth: "100%", marginTop: "1rem" }}
          id="mobileno"
          label="หมายเลขโทรศัพท์"
          variant="outlined"
          required
          defaultValue={peaUser.mobileno}
          error={
            !(peaUser && peaUser.mobileno && /^\d{10}$/.test(peaUser.mobileno))
          }
          onChange={(e) => {
            {
              setPeaUser({ ...peaUser, mobileno: e.target.value });
            }
          }}
          helperText={"เลขเบอร์มือถือ 10 หลัก โดยไม่ต้องใส่สัญลักษณ์"}
        />
        <div className=" mx-auto my-4 flex flex-row gap-4">
          <div
            onMouseOver={() => {
              if (!pass) {
                setSnackBar({
                  sevirity: "warning",
                  massege: "ข้อมูลผู้ใช้ไม่ถูกต้อง กรุณาตรวจสอบ",
                  open: true,
                });
                document.getElementById(field)?.classList.add("shake");
                setTimeout(() => {
                  document.getElementById(field)?.classList.remove("shake");
                }, 2000);
              }
            }}
          >
            <Button
              disabled={!pass}
              variant="outlined"
              className="mt-3"
              aria-label="submit"
              type="submit"
            >
              ยืนยัน
            </Button>
          </div>
          <Button
            variant="outlined"
            className="mt-3"
            onMouseOver={() => {}}
            onClick={() => {
              if (window.confirm("คุณต้องการจะออกจากหน้านี้?")) {
                setProgress(true);
                router.push("/");
              }
            }}
            type="button"
          >
            กลับสู่หน้าหลัก
          </Button>
        </div>
      </form>
      <AlertSnackBar setSnackBar={setSnackBar} snackBar={snackBar} />
      <LoadingBackDrop setProgress={setProgress} progress={progress} />
    </div>
  );
}
