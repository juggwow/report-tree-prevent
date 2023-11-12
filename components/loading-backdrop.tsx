import { Backdrop, CircularProgress } from "@mui/material";

export default function LoadingBackDrop({progress,setProgress}:SetPropsLoadingBackDrop){
    return (
        
      <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={progress}
      onClick={() => setProgress(false)}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
    )
}