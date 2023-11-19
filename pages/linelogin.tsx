import { getSession, signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect } from "react"

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

export default function LineLogin(){
    const searchParams = useSearchParams()
    const link = searchParams.get("link")
    useEffect(()=>{
        signIn("line",{callbackUrl: link?link:'/'})
        return
    },[])
    return (
        <div></div>
    )
}