import { peaUser } from "@/types/next-auth";
import { signOut } from "next-auth/react";

const sendProfileForm = async (peaUser?: peaUser): Promise<string | null> => {
  if (!window.confirm("ข้อมูลผู้ใช้ถูกต้อง?")) {
    return null;
  }

  if (!peaUser?.karnfaifa || peaUser.karnfaifa == "") {
    window.alert("กรุณาเลือกสังกัด");
    return null;
  }

  const res = await fetch("api/profile", {
    method: "POST",
    body: JSON.stringify(peaUser),
  });

  if (res.status != 200 && res.status != 401) {
    window.alert("บางอย่างผิดพลาด ติดต่อ 099-0210912");
    return null;
  }

  //ถ้าส่งไปแล้วไม่มี session จะให้ logout ออก และ ไปหน้า login
  if (res.status == 401) {
    signOut({ redirect: false });
    return "/signin";
  }

  return "/";
};

export default sendProfileForm;
