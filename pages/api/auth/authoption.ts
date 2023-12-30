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
      clientId: process.env.NEXTAUTH_LINE_CLIENT_ID as string,
      clientSecret: process.env.NEXTAUTH_LINE_CLIENT_SECRET as string,
    }),
    GoogleProvider({
      name: "google",
      clientId: process.env.NEXTAUTH_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.NEXTAUTH_GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({
      token,
      trigger,
    }: {
      token: JWT;
      trigger?: "signIn" | "update" | "signUp" | undefined;
    }): Promise<JWT> {
      if (trigger == "update") {
        delete token.pea;
      }
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
    async redirect(params) {
      const { url, baseUrl } = params;
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  // events: {
  //   updateUser:
  // }
};

export default authOptions;
