import { useState, useRef, useEffect, useContext } from 'react';
import styled from 'styled-components';

import { useAuth } from '../contexts/AuthContext';
import Lobby from './Lobby';
import SignIn from './SignIn';
import SignUp from './SignUp';

function App() {
  document.title = 'Proximic';

  const [isSignIn, setIsSignIn] = useState(true);

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
          <p>Welcome, user id: { currentUser.uid }</p>
          <p>Verified: {currentUser.emailVerified ? 'Yes' : 'Not Yet'}</p>
          <button type="button" onClick={formSignOff}>Sign Out</button>
        </aside>

        <Lobby />
      </main>
    )
  } else {
    if (isSignIn) return (
      <SignIn>
        <StyledForm action="">
          <label htmlFor="email">Email</label>
          <input ref={email} type="email" id="email" name="email" />
          <label htmlFor="pass">Password</label>
          <input ref={pass} type="password" id="pass" name="pass" />
          <button onClick={formSignIn} type="submit">Sign In</button>
          <StyledLink onClick={() => { setIsSignIn(false) }}>Don't have an account?</StyledLink>
        </StyledForm>
      </SignIn>
    );

    return (
      <SignUp>
        <StyledForm action="">
          <label htmlFor="username">Username</label>
          <input ref={username} type="text" id="username" name="username" />
          <label htmlFor="email">Email</label>
          <input ref={email} type="email" id="email" name="email" />
          <label htmlFor="pass">Password</label>
          <input ref={pass} type="password" id="pass" name="pass" />
          <label htmlFor="conpass">Confirm Password</label>
          <input ref={conpass} type="password" id="conpass" name="conpass" />
          <button onClick={formSignUp} type="submit">Sign Up</button>
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
