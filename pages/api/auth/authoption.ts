import { AuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import LineProvider from "next-auth/providers/line";
import setJWT from "@/src/nextauth/setjwt";

const authOptions: AuthOptions = {
  // Configure one or more authentication providers
  providers: [
    LineProvider({
      name: "line",
      clientId: process.env.NEXT_PUBLIC_LINE_CLIENT_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_LINE_CLIENT_SECRET as string,
    }),
    GoogleProvider({
      name: "google",
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token }: { token: JWT }): Promise<JWT> {
      return await setJWT(token);
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      if (token) {
        session.pea = token.pea;
        session.sub = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
