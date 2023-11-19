import { getCsrfToken, signIn } from "next-auth/react"
import { useEffect } from "react"

// export async function getServerSideProps(context: any){
//     const csrfToken = await getCsrfToken(context.res)
//     return {
//         props: {
//             csrfToken: csrfToken
//         }
//     }
// }

export default function LineLogin(){

    

    useEffect(()=>{
        signIn("line")
        
        return
    },[])
    return (
        <div></div>
    )
}