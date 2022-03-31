import styled, { keyframes } from 'styled-components';

export default function Loader() {
  return (
    <StyledDiv>
      <span>P</span>
      <span>R</span>
      <span>O</span>
      <span>x</span>
      <span>I</span>
      <span>M</span>
      <span>I</span>
      <span>C</span>
    </StyledDiv>
  );
}

const wave = keyframes`
  0% {
    top: 0;
  }

  50% {
    top: -20px;
  }

  100% {
    top: 0px;
  }
`;

const StyledDiv = styled.div`
  span {
    font-size: 12px;
    color: white;
    position: relative;
    background-color: #DB8536;
    margin: 0 5px;
    padding: 5px;
    border-radius: 20px;
    animation-name: ${wave};
    animation-duration: 1s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }
  
  & :nth-child(1) {
    animation-delay: 0.0s;
  }
  & :nth-child(2) {
    animation-delay: 0.1s;
  }
  & :nth-child(3) {
    animation-delay: 0.2s;
  }

  & :nth-child(4) {
    animation-delay: 0.3s;
  }

  & :nth-child(5) {
    animation-delay: 0.4s;
  }
  & :nth-child(6) {
    animation-delay: 0.5s;
  }
  & :nth-child(7) {
    animation-delay: 0.6s;
  }
  & :nth-child(8) {
    animation-delay: 0.7s;
  }
`;
