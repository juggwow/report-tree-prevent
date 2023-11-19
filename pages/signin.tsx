import { signIn, getSession } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className=" mx-auto mt-24 flex flex-col w-96 shadow rounded-xl bg-white">
      <p className=" mx-4 mt-8 text-right text-xl font-bold">ยินดีต้อนรับ</p>
      <p className=" mx-4 text-right text-2xl mt-8">กรุณาเข้าสู่ระบบ</p>
      <button
        data-testid="google"
        onClick={() => signIn("google")}
        className="mx-4 mt-8 py-1 border border-slate-300 rounded-full hover:bg-slate-50 hover:shadow-md "
      >
        เข้าสู่ระบบด้วยบัญชี Google
      </button>
      <button
        data-testid="line"
        onClick={() => signIn("line")}
        className="mx-4 mt-4 mb-8 py-1 border border-slate-300 rounded-full hover:bg-slate-50 hover:shadow-md "
      >
        เข้าสู่ระบบดัวยบัญชี Line
      </button>
    </div>
  );
}
