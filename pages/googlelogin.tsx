import { getSession, signIn } from "next-auth/react";
import { useEffect } from "react";

export async function getServerSideProps({ query }:any) {
  const link = query.link
  return {
    props :{
      link: link?link:"/"
    }
  }
}

export default function GoogleLogin({link}:{link:string}) {
  useEffect(() => {
    signIn("google", { callbackUrl: link });
    return;
  }, []);
  return <div>sign in...</div>;
}
