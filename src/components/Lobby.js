import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import Player from '../classes/Player'; 

// Players are identified with currentUser.uid

export default function Lobby() {
  const { currentUser, signOff } = useAuth();

  const [players, setPlayers] = useState({});

  const [myPlayer, setMyPlayer] = useState({})

  // refs must be used for position values can't use myPlayer values 
  // because event handlers won't change with normal variables / state variables
  // because they will be in a closure and always use their
  // initial values.
  const myPosX = useRef(0);
  const myPosY = useRef(0);

  useEffect(() => {
    // on mount

    // value initializations
    // TODO: use account name for Player name
    // TODO: link firestore and storage
    // TODO: eventually get dictionary of players from realtime database and sync state across users in lobby
    setPlayers(() => {
        // players are 'keyed' with uid (from firebase/auth)
        // within the players dictionary
        const playersObj = {
          // this is temporary realy list is taken from realtime database
          [currentUser.uid]: new Player(currentUser.uid, 200, 200, '/TODO/')
        };

        // get my player object with the uid of signed in user
        setMyPlayer(() => {
          // initialize myPosX, myPosY references
          myPosX.current = playersObj[currentUser.uid].x;
          myPosY.current = playersObj[currentUser.uid].y;

          // initialize MyPlayer state
          return playersObj[currentUser.uid]
        });

        return playersObj;
      }
    );

    // event handlers
    document.addEventListener('keydown', (e) => {
      // TODO: Movement by Ryo
    });

    // on dismount
    return () => {

    };
  }, []);

  useEffect(() => {
    // if something changes with myPlayer
    // if myPlayer reference changes (update players dictionary) --> update entire lobby state
    setPlayers(prevPlayers => {
      const newPlayers = JSON.parse(JSON.stringify(prevPlayers));
      newPlayers[currentUser.uid].x = myPlayer.x;
      newPlayers[currentUser.uid].y = myPlayer.y;
      return newPlayers;
    });
  }, [myPlayer]);

  return (
    <StyledMain>
      <p>Welcome, user id: { currentUser.uid }</p>
      <p>Verified: {currentUser.emailVerified ? 'Yes' : 'Not Yet'}</p>
      <button onClick={signOff}>SignOff</button>
      <LobbyMap>
        {
          Object.values(players).map(p => {
            // position p (player) based on Player object
            // TODO: Fix IMG src and IMAGE DISPLAYING
            return (<StyledAvatar key={currentUser.uid} x={p.x} y={p.y} bg={'#54B3E9'} src={'/home/kirby/Downloads/cat.jpeg'} />);
          })
        }
      </LobbyMap>
    </StyledMain>
  );
}

const StyledMain = styled.main`
  display: flex;
  flex-direction: column;
`;

// LobbyMap is the holder of all players
// tiling / background images can be used here
const LobbyMap = styled.div`
  height: 100vh;
  border: 1px solid black;
`;

// absolute positioning to position player based on pixels
// using left and top
// TODO: Add background-image for avatar 
const StyledAvatar = styled.div`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: 50px;
  height: 50px;
  border-radius: 100%;
  box-sizing: border-box;
  border: 5px solid black;
  background-color: ${props => props.bg};
`;
