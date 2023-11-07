import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="flex flex-col p-4 min-h-screen">
      <div>ไม่พบ</div>
      <div>
        <Link href="/">กลับสู่หน้าหลัก</Link>
      </div>
    </div>
  );
}
