import { signIn, getSession } from "next-auth/react";

export async function getServerSideProps(context: any) {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }
  return {
    props: {},
  };
}

export default function SignInPage() {
  return (
    <div className=" mx-auto mt-24 flex flex-col w-96 shadow-xl rounded-xl">
      <h1 className=" mx-4 mt-8 text-right text-3xl">ยินดีต้นรับสู่</h1>
      <h1 className=" mx-4 mt-4 text-right text-2xl border-slate-300">
        PEA S3 Strong Grid
      </h1>
      <h3 className=" mx-4 text-right text-2xl mt-8">เข้าสู่ระบบ</h3>
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
