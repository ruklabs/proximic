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

import signin_img from '../../resources/sign-in-img.jpg';
import signup_img from '../../resources/sign-up-img.jpg';

import deafen_icon from '../../resources/icon_deafen.png';
import mute_icon from '../../resources/icon_mute.png';


import sprite from '../../resources/sprite.gif';
import sprite2 from '../../resources/sprite2.gif';
import sprite3 from '../../resources/sprite3.gif';
import sprite4 from '../../resources/sprite4.gif';

import Voice2 from '../Voice/Voice2';

const sprites = [sprite, sprite2, sprite3, sprite4];
const spriteSelect = Math.floor((Math.random() * 4));

function App() {
  document.title = 'Proximic';

  const [isSignIn, setIsSignIn] = useState(true);
  const [alertAttrib, setAlertAttrib] = useState({isAlert: false, msg: "", alertType: ""});
  const [passValid, setPassValid] = useState({isValid: true, errText: ""});
  const [conPassValid, setConPassValid] = useState({isValid: true, errText: ""});
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

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
    
    
    (async () => {
      let result = await signIn(email.current.value, pass.current.value);

      if (!result) {
        setAlertAttrib(prev => {
          const newAlert = JSON.parse(JSON.stringify(prev));
          newAlert.isAlert = true;
          newAlert.msg = "Invalid email and/or password!";
          newAlert.alertType = "error";
          return newAlert;
        });
      }

    })()
  };


  const formSignUp = (e) => {
    e.preventDefault();

    if (pass.current.value === '' || conpass.current.value === '') return;

    if (pass.current.value.length >= 6) {
      setPassValid(prev => {
        const newFormValid = JSON.parse(JSON.stringify(prev));
        newFormValid.isValid = true;
        newFormValid.errText = "";
        return newFormValid;
      });
    } else {
      setPassValid(prev => {
        const newFormValid = JSON.parse(JSON.stringify(prev));
        newFormValid.isValid = false;
        newFormValid.errText = "Password must have more than 6 characters.";
        return newFormValid;
      });
    }

    if (pass.current.value === conpass.current.value) {
      setConPassValid(prev => {
        const newFormValid = JSON.parse(JSON.stringify(prev));
        newFormValid.isValid = true;
        newFormValid.errText = "";
        return newFormValid;
      });

      (async () => {
        await signUp(email.current.value, username.current.value, pass.current.value);
      })();
    } else {
      console.log('Your passwords are not the same');
      setConPassValid(prev => {
        const newFormValid = JSON.parse(JSON.stringify(prev));
        newFormValid.isValid = false;
        newFormValid.errText = "Passwords do not match.";
        return newFormValid;
      });
    }
  };

  const formSignOff = (e) => {
    e.preventDefault();
    signOff();
  };


  
    
  const muteVolume = () => {
    // Place backend interface function for muting here
    setIsMuted(prev => {
      return !prev;
    });
  }

  const deafenSound = () => {
    // Place backend interface function for deafening here
    setIsDeafened(prev => {
      return !prev;
    });
  }


  if (currentUser) {
    return (
    <main>
      <aside>
        <img className="sprite-logo" src={sprites[spriteSelect]}/>
        <p>{ currentUser.uid }</p>
        <p>Verified: {currentUser.emailVerified ? 'Yes' : 'Not Yet'}</p>
        <div className="audio-control">
          <img src={mute_icon} onClick={() => muteVolume()} style={isMuted ? {filter: `grayscale(0%)`}: {filter: `grayscale(100%)`}}/>
          <img src={deafen_icon} onClick={() => deafenSound()} style={isDeafened ? {filter: `grayscale(0%)`}: {filter: `grayscale(100%)`}}/>
        <Voice2 user={currentUser}/>
        </div>
        <ProxiButton onClick={formSignOff} type="button" variant="contained" >Sign Out</ProxiButton>
      </aside>

      <Lobby className="lobby" sprite={spriteSelect} />
    </main>
    )
  } else {
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
          </StyledForm>
          <img className='main-image' src={signin_img} />
          <ProxiAlert attrib={alertAttrib} setClose={setAlertAttrib}/>
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
            <label htmlFor="username">Username</label>
            <ProxiTextField required inputRef={username} type="text" id="username" label="Username" variant="filled" />
          </div>
          <div className='field-input'>
            <label htmlFor="pass">Password</label>
            <ProxiTextField required inputRef={pass} type="password" id="password" label="Password" variant="filled" 
            error={!passValid.isValid} helperText={passValid.errText} />
          </div>
          <div className='field-input'>
            <label htmlFor="conpass">Confirm Password</label>
            <ProxiTextField required inputRef={conpass} type="password" id="conpass" label="Confirm Password" variant="filled" 
              error={!conPassValid.isValid} helperText={conPassValid.errText} />
          </div>
          <ProxiButton onClick={formSignUp} type="button" variant="contained" >Sign Up</ProxiButton>
          <StyledLink onClick={() => { setIsSignIn(true) }} >Already have an account?</StyledLink>
        </StyledForm>
        <ProxiAlert attrib={alertAttrib} setClose={setAlertAttrib}/>
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
