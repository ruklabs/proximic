import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TextField, Button } from '@mui/material';
import { withStyles } from '@mui/styles';
import styled from 'styled-components';
import Lobby from './Lobby';
import SignIn from './SignIn';
import SignUp from './SignUp';
import './App.css';
import pallet from '../resources/pallet_town.png';
import bluebg from '../resources/bg.png'; 
import logo from '../resources/logo.png';
import signin_img from '../resources/sign-in-img.jpg';
import signup_img from '../resources/sign-up-img.jpg';



function App() {
  document.title = 'Proximic';

  const [isSignIn, setIsSignIn] = useState(true);

  const email = useRef("");
  const pass = useRef("");
  const conpass = useRef("");

  const { currentUser, signIn, signUp } = useAuth();

  const user = currentUser;

  useEffect(() => {
    // on mount
  }, []);

  const formSignIn = (e) => {
    e.preventDefault();
    signIn(email.current.value, pass.current.value);
  };

  const formSignUp = (e) => {
    e.preventDefault();
    if (pass.current.value === conpass.current.value) {
      signUp(email.current.value, pass.current.value);
    } else {
      console.log('Your passwords are not the same');
    }
  };

  if (user) {
    // Done signing in
    return <Lobby />
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
