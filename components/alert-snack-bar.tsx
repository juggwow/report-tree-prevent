import { SetPropsAlertSnackBar } from "@/types/snack-bar";
import { Snackbar, Alert } from "@mui/material";

export default function AlertSnackBar({snackBar,setSnackBar}:SetPropsAlertSnackBar){
    return(
        
      <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={snackBar.open}
      autoHideDuration={2000}
      onClose={() => setSnackBar({ ...snackBar, open: false })}
    >
      <Alert
        severity={snackBar.sevirity}
        onClose={() => setSnackBar({ ...snackBar, open: false })}
      >
        {snackBar.massege}
      </Alert>
    </Snackbar>
    )
}