import optionsKarnfaifa from "@/src/karnfaifa";
import sendProfileForm from "@/src/sendprofileform";
import { peaUser } from "@/types/next-auth";
import { getSession, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export async function getServerSideProps(context: any) {
  const session = await getSession(context);

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
      },
    };
  }

  return {
    props: {
      pea: null,
    },
  };
}

export default function ProfilePage({ pea }: { pea: peaUser | null }) {
  const router = useRouter();
  const [peaUser, setPeaUser] = useState<peaUser>();
  const { data: session, update } = useSession();

  useEffect(() => {
    if (pea) {
      setPeaUser(pea);
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const path = await sendProfileForm(peaUser);
    if (path) {
      if (path == "/") {
        update();
      }
      router.push(path);
    }
  };

  const profileTextForm = [
    {
      placeholder: "ชื่อ",
      type: "text",
      handleChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setPeaUser({ ...peaUser, firstname: e.target.value });
      },
      value: peaUser?.firstname,
      pattern: "w",
    },
    {
      placeholder: "สกุล",
      type: "text",
      handleChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setPeaUser({ ...peaUser, lastname: e.target.value });
      },
      value: peaUser?.lastname,
    },
    {
      placeholder: "รหัสพนักงาน",
      type: "number",
      handleChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setPeaUser({ ...peaUser, userid: e.target.value });
      },
      value: peaUser?.userid,
    },
    {
      placeholder: "หมายเลขโทรศัพท์",
      type: "number",
      handleChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setPeaUser({ ...peaUser, mobileno: e.target.value });
      },
      value: peaUser?.mobileno,
    },
  ];

  return (
    <div className=" mx-auto mt-24 flex flex-col w-96 shadow-xl rounded-xl">
      <h3 className=" mx-4 mt-8 text-right text-2xl">แก้ไขข้อมูลผู้ใช้งาน</h3>
      <form className="mx-4 my-8 flex flex-col" onSubmit={handleSubmit}>
        <span className="ml-5 mt-2 -mb-2 z-10 bg-white max-w-max text-xs text-gray-500">
          สังกัด
        </span>
        <select
          onChange={(e) => {
            setPeaUser({ ...peaUser, karnfaifa: e.target.value });
          }}
          required
          className="px-3 py-1 border border-slate-300 rounded-full focus:outline-slate-400 focus:shadow-lg  "
        >
          {peaUser?.karnfaifa ? (
            <option className="text-xs text-white" value={peaUser.karnfaifa}>
              {peaUser.karnfaifa}
            </option>
          ) : (
            <option></option>
          )}
          {optionsKarnfaifa.map((item, index) => {
            return (
              <option key={index} value={item} className="text-xs">
                {item}
              </option>
            );
          })}
        </select>
        {profileTextForm.map((item, index) => {
          return (
            <div className="m-0 p-0 flex flex-col" key={index}>
              <label
                htmlFor={item.placeholder}
                className="ml-5 mt-2 -mb-2 z-10 bg-white max-w-max text-xs text-gray-500"
              >
                {item.placeholder}
              </label>
              <input
                id={item.placeholder}
                required
                value={item.value}
                onChange={(e) => item.handleChange(e)}
                type={item.type}
                width={"auto"}
                className="px-3 py-1 border border-slate-300 rounded-full focus:outline-slate-400 focus:shadow-lg "
              />
            </div>
          );
        })}
        <div className=" ml-auto my-4 flex flex-row gap-4">
          <button
            aria-label="back"
            onClick={() => {
              if (window.confirm("คุณต้องการจะออกจากหน้านี้?")) {
                router.push("/");
              }
            }}
            type="button"
            className="px-4 py-1 rounded-full border border-slate-300 hover:bg-slate-100 hover:shadow-lg"
          >
            กลับสู่หน้าหนัก
          </button>
          <button
            aria-label="submit"
            type="submit"
            className="px-4 py-1 rounded-full border border-slate-300 hover:bg-slate-100 hover:shadow-lg"
          >
            ยืนยัน
          </button>
        </div>
      </form>
    </div>
  );
}
