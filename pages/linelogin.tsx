import { getSession, signIn } from "next-auth/react";
import { useEffect } from "react";

export async function getServerSideProps({ query }: any) {
  const {link,liff} = query;
  
  return {
    props: {
      link: link ? `${link}${liff&&liff=="TRUE"?"&liff=TRUE":''}` : "/",
    },
  };
}

export default function LineLogin({ link }: { link: string }) {
  useEffect(() => {
    signIn("line", { callbackUrl: link });
    return;
  }, []);
  return <div>sign in...</div>;
}
