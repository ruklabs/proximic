import { useState, useRef, useEffect } from 'react';
import { TextField, Button } from '@mui/material';
import { withStyles } from '@mui/styles';
import styled from 'styled-components';
import './App.css';

import Lobby from '../Lobby/Lobby';
import SignIn from '../SignIn/SignIn';
import SignUp from '../SignUp/SignUp';
import ProxiAlert from '../Alert/ProxiAlert';
import { useAuth } from '../../contexts/AuthContext';

import bluebg from '../../resources/bg.png'; 
import logo from '../../resources/logo.png';
import sprite_logo from '../../resources/sprite-icon.png';
import signin_img from '../../resources/sign-in-img.jpg';
import signup_img from '../../resources/sign-up-img.jpg';
import deafen_icon from '../../resources/icon_deafen.png';
import mute_icon from '../../resources/icon_mute.png';


function App() {
  document.title = 'Proximic';

  const [isSignIn, setIsSignIn] = useState(true);
  const [alertAttrib, setAlertAttrib] = useState({isAlert: false, msg: "", alertType: ""});

  const email = useRef("");
  const username = useRef("");
  const pass = useRef("");
  const conpass = useRef("");

  const { currentUser, signIn, signUp, signOff } = useAuth();

  useEffect(() => {
    // on mount
  }, []);

  const formSignIn = (e) => {
    e.preventDefault();
    signIn(email.current.value, pass.current.value);
  };

  const testAlert = () => {
    setAlertAttrib(prev => {
      const newAlert = JSON.parse(JSON.stringify(prev));
      newAlert.isAlert = true;
      newAlert.msg = "alert test!";
      newAlert.alertType = "error";
      return newAlert;
    });
  }

  const closeAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setAlertAttrib(prev => {
      const newAlert = JSON.parse(JSON.stringify(prev));
      newAlert.isAlert = false;
      return newAlert;
    });
  }

  const formSignUp = (e) => {
    e.preventDefault();

    if (pass.current.value === '' || conpass.current.value === '') return;

    if (pass.current.value === conpass.current.value) {
      signUp(email.current.value, username.current.value, pass.current.value);

    } else {
      console.log('Your passwords are not the same');
    }
  };

  const formSignOff = (e) => {
    e.preventDefault();
    signOff();
  };

  if (currentUser) {
    // Done signing in
    // const username = getUsername(currentUser.uid).then(e => e);
    return (
      <main>
        <aside>
          <img className="sprite-logo" src={sprite_logo}/>
          <p>{ currentUser.uid }</p>
          <p>Verified: {currentUser.emailVerified ? 'Yes' : 'Not Yet'}</p>
          <div className="audio-control">
            <img src={mute_icon} />
            <img src={deafen_icon} />
          </div>
          <ProxiButton onClick={formSignOff} type="button" variant="contained" >Sign Out</ProxiButton>
        </aside>

        <Lobby className="lobby"/>
      </main>
    )
  } else {
    // TODO: Remove ProxiAlert and 'Text Alert' button after testing
    if (isSignIn) return (
        <SignIn>
          <StyledForm action="">
            <div className='header-box'>
              <div className='header'>
                <img src={logo}/>
                <h1>PROXIMIC</h1>
              </div>
              <p>Real-life conversations online</p>
            </div>
            <div className='field-input'>
              <label htmlFor="email">E-mail</label>
              <ProxiTextField required inputRef={email} type="email" id="email" label="E-mail" variant="filled" />
            </div>
            <div className='field-input'>
              <label htmlFor="pass">Password</label>
              <ProxiTextField required inputRef={pass} type="password" id="password" label="Password" variant="filled" />
            </div>
            <ProxiButton onClick={formSignIn} type="button" variant="contained" >Sign In</ProxiButton>
            <StyledLink onClick={() => { setIsSignIn(false) }}>Don't have an account?</StyledLink>
            <ProxiButton onClick={testAlert} type="button" variant="contained" >Alert Test</ProxiButton>
          </StyledForm>
          <img className='main-image' src={signin_img} />
          <ProxiAlert open={alertAttrib.isAlert} message={alertAttrib.msg} type={alertAttrib.alertType} onClose={closeAlert}/>
        </SignIn>
    );

    return (
      <SignUp>
        <img className='main-image' src={signup_img} />
        <StyledForm action="">
          <h1>SIGN UP</h1>
          <div className='field-input'>
            <label htmlFor="email">E-mail</label>
            <ProxiTextField required inputRef={email} type="email" id="email" label="E-mail" variant="filled" />
          </div>
          <div className='field-input'>
            <label htmlFor="pass">Password</label>
            <ProxiTextField required inputRef={pass} type="password" id="password" label="Password" variant="filled" />
          </div>
          <div className='field-input'>
            <label htmlFor="conpass">Confirm Password</label>
            <ProxiTextField required inputRef={conpass} type="password" id="conpass" label="Confirm Password" variant="filled" />
          </div>
          <ProxiButton onClick={formSignUp} type="button" variant="contained" >Sign Up</ProxiButton>
          <StyledLink onClick={() => { setIsSignIn(true) }} >Already have an account?</StyledLink>
        </StyledForm>
        <ProxiAlert open={alertAttrib.isAlert} message={alertAttrib.msg} type={alertAttrib.alertType} onClose={closeAlert}/>
      </SignUp>
    );
  }
}

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 24px 56px;
  width: 50%;
  background-image: url('${bluebg}');
`;

const StyledLink = styled.a`
  margin: 0 auto;
  color: #DB8536;
  text-align: center;
  
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

const ProxiTextField = styled(TextField)({
  '& label.Mui-focused': {
    color: '#DB8536',
  },
  '& .css-cio0x1-MuiInputBase-root-MuiFilledInput-root:after': {
    borderBottomColor: '#DB8536',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: '#DB8536',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#FFFFFF',
    },
    '&:hover fieldset': {
      borderColor: '#FFFFFF',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#DB8536',
    },
  },
});

const ProxiButton = withStyles({
  root: {
    color: '#FFFFFF',
    backgroundColor: '#DB8536',
    '&:hover': {
      backgroundColor: '#ffffff',
      color: '#DB8536',
  },
}})(Button);

export default App;
