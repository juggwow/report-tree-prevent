import { signIn, getSession } from "next-auth/react";
import HttpsRoundedIcon from "@mui/icons-material/HttpsRounded";
import { Button } from "@mui/material";

export async function getServerSideProps(context: any) {
  const session = await getSession(context);
  const link = context.query.link ? context.query.link : "/";

  if (session) {
    return {
      redirect: {
        destination: link,
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

export default function SignInPage({ link }: { link: string }) {
  return (
    <div className=" mx-auto mt-3 flex flex-col w-96 shadow rounded-xl bg-white">
      <HttpsRoundedIcon color="primary" sx={{ margin: "1rem auto 0 auto" }} />
      <p className="text-center mt-3">เข้าสู่ระบบ</p>
      <Button
        color="error"
        sx={{ margin: "1rem" }}
        variant="outlined"
        onClick={() => signIn("google", { callbackUrl: link })}
      >
        เข้าสู่ระบบด้วยบัญชี Google
      </Button>
      <Button
        color="success"
        sx={{ margin: "0 1rem 2rem" }}
        variant="outlined"
        onClick={() => signIn("line", { callbackUrl: link })}
      >
        เข้าสู่ระบบดัวยบัญชี Line
      </Button>
    </div>
  );
}
