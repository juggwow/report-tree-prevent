import LoadingBackDrop from "@/components/loading-backdrop";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ErrorPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(false);
  return (
    <div className="flex flex-col p-4 min-h-screen">
      <div>ไม่พบข้อมูล</div>
      <div className="flex flex-row justify-center">
        <Button
          variant="outlined"
          className="mt-3 w-40"
          onClick={() => {
            setProgress(true);
            router.push("/");
          }}
        >
          กลับสู่หน้าหลัก
        </Button>
      </div>
      <LoadingBackDrop progress={progress} setProgress={setProgress} />
    </div>
  );
}
