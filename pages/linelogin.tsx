import { getSession, signIn } from "next-auth/react"
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
    useEffect(()=>{
        signIn("line")
        return
    },[])
    return (
        <div></div>
    )
}