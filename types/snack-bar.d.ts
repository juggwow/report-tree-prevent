import { AlertColor } from "@mui/material"

type AlertSnackBarType = {
    open: boolean
    sevirity: AlertColor
    massege: string
}

type SetPropsAlertSnackBar = {
    snackBar: AlertSnackBarType
    setSnackBar: React.Dispatch<React.SetStateAction<AlertSnackBar>>
}
