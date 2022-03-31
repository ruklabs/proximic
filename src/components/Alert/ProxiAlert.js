import { Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { forwardRef } from 'react';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Props refers to open boolean, message, type of alert (error, warning, info, success), and onClose handler
// To use, just set alert attributes in parent function and an onClose handler
export default function ProxiAlert(props) {

    return(
        <Snackbar open={props.open} autoHideDuration={5000} onClose={props.onClose} 
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }} >
            <Alert onClose={props.onClose} severity={props.type} sx={{ width: '100%' }}>
                {props.message}
            </Alert>
        </Snackbar>
    );
}