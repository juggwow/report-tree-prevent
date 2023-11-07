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
      clientId: "1661495631",
      clientSecret: "25a8e3cc63ee4c02653008dd2a228164",
    }),
    GoogleProvider({
      name: "google",
      clientId: "625444603857-4igpobrhuviu4c5abrsonvsdastn6qnq.apps.googleusercontent.com",
      clientSecret: "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",
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
