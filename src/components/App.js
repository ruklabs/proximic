import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import Lobby from './Lobby';
import SignIn from './SignIn';
import SignUp from './SignUp';

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
          <label htmlFor="email">Email</label>
          <input ref={email} type="email" id="email" name="email" />
          <label htmlFor="pass">Password</label>
          <input ref={pass} type="password" id="pass" name="pass" />
          <button onClick={formSignIn} type="button">Sign In</button>
          <StyledLink onClick={() => { setIsSignIn(false) }}>Don't have an account?</StyledLink>
        </StyledForm>
      </SignIn>
    );

    return (
      <SignUp>
        <StyledForm action="">
          <label htmlFor="email">Email</label>
          <input ref={email} type="email" id="email" name="email" />
          <label htmlFor="pass">Password</label>
          <input ref={pass} type="password" id="pass" name="pass" />
          <label htmlFor="conpass">Confirm Password</label>
          <input ref={conpass} type="password" id="conpass" name="conpass" />
          <button onClick={formSignUp} type="button">Sign Up</button>
          <StyledLink onClick={() => { setIsSignIn(true) }} >Already have an account?</StyledLink>
        </StyledForm>
      </SignUp>
    );
  }
}

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const StyledLink = styled.a`
  color: blue;
  
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

export default App;
