import { Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { forwardRef } from 'react';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Props refers to open boolean, message, type of alert (error, warning, info, success), and onClose handler
// To use, just set alert attributes in parent function and an onClose handler
export default function ProxiAlert(props) {

    const closeAlert = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        props.setClose(prev => {
          const newAlert = JSON.parse(JSON.stringify(prev));
          newAlert.isAlert = false;
          return newAlert;
        });
      }

    return(
        <Snackbar open={props.attrib.isAlert} autoHideDuration={5000} onClose={closeAlert} 
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }} >
            <Alert onClose={closeAlert} severity={props.attrib.alertType} sx={{ width: '100%' }}>
                {props.attrib.msg}
            </Alert>
        </Snackbar>
    );
}