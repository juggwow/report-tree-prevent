import NextAuth, { Account, DefaultSession, User } from "next-auth"
import { JWT } from "next-auth/jwt"

type peaUser ={
  firstname? : string
  karnfaifa? : string
  lastname? : string
  mobileno? : string
  role? : string
  userid? : string
}

declare module "next-auth" {
    interface Session {
        pea?: peaUser
        sub?: string
    }
}


declare module "next-auth/jwt" {
    interface JWT {
        pea?: peaUser
    }
}