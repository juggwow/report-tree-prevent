import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import Link from 'next/link'

export default function NavBar() {
  const session = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        profileMenuElementRef.current &&
        !profileMenuElementRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  console.log(session);
  return (
    <div className="flex flex-row w-full justify-between items-center bg-slate-300 z-10">
      <h1 className="m-4">S3MADPM01</h1>
      <div className="flex flex-row items-center justify-end">
        <div className="my-auto mr-4">
          <span>{session.data?.pea?.firstname}</span>
          <div
            ref={profileMenuElementRef}
            className={
              showProfileMenu
                ? "absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                : " hidden"
            }
          >
            <Link href="/profile" onClick={()=>setShowProfileMenu(false)} className="block px-4 py-2 text-sm text-gray-700">
              แก้ไขข้อมูลส่วนตัว
            </Link>
            <Link href="/signout" onClick={()=>setShowProfileMenu(false)} className="block px-4 py-2 text-sm text-gray-700">
              ออกจากระบบ
            </Link>
          </div>
        </div>
        {session.data && session.data.user && session.data.user.image ? (
          <img
            onClick={() =>
              setShowProfileMenu(!showProfileMenu)
            }
            className=" rounded-full hover:cursor-pointer mr-4"
            src={session.data.user.image}
            height={50}
            width={50}
          />
        ) : undefined}
      </div>
    </div>
  );
}
