import { signOut } from "next-auth/react";
import { useRouter } from "next/router";

export default function Logout() {
  const router = useRouter();

  signOut({ redirect: false }).then(() => {
    router.push("/signin");
  });

  return <p>Logging out...</p>;
}
