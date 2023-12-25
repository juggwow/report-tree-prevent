import * as React from 'react';
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';



export default function ControlledOpenSpeedDial({userManual}:{userManual:string}) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const actions = [
    { icon: <CallRoundedIcon />, name: 'โทร', click: ()=> window.open("tel:0883874774")},
    { icon: <GroupRoundedIcon />, name: 'ไลน์',click: ()=> window.open("https://line.me/ti/p/~p.wiriyar")},
    { icon: <ArticleRoundedIcon />, name: 'คู่มือ',click: ()=> window.open(userManual)},
  ];

  return (
    <Box sx={{ height: 320, transform: 'translateZ(0px)', flexGrow: 1, position: 'fixed', bottom: 16, right: 16, }}>
      <SpeedDial
        id="speed-dial"
        ariaLabel="SpeedDial controlled open example"
        sx={{ position: 'absolute', bottom: 0, right: 0, }}
        icon={<SpeedDialIcon/>}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={action.click}
          />
        ))}
      </SpeedDial>
    </Box>
  );
}
