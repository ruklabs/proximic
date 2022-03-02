import { useState, useRef, useEffect } from 'react';
import { useKey } from 'react-use';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import Player from '../classes/Player';
import pallet from '../resources/pallet_town.png';
import sprite from '../resources/spellun-sprite.png'; 

// Players are identified with currentUser.uid

export default function Lobby() {
  const { currentUser, signOff } = useAuth();

  const [players, setPlayers] = useState({});

  const [myPlayer, setMyPlayer] = useState({});

  // refs must be used for position values can't use myPlayer values 
  // because event handlers won't change with normal variables / state variables
  // because they will be in a closure and always use their
  // initial values.
  const myPosX = useRef(0);
  const myPosY = useRef(0);
  const delta = 1;

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
          [currentUser.uid]: new Player(currentUser.uid, 50, 50, sprite)
        };

        // get my player object with the uid of signed in user
        setMyPlayer(() => {
          // initialize myPosX, myPosY references
          myPosX.current = playersObj[currentUser.uid].x;
          myPosY.current = playersObj[currentUser.uid].y;

          // initialize MyPlayer state
          return playersObj[currentUser.uid];
        });

        return playersObj;
      }
    );

    // on dismount
    return () => {

    };
  }, []);

  // keyboard event handlers
  const moveUp = () => {
    myPosY.current -= delta;
    setMyPlayer(myPlayer => myPlayer.y = myPosY.current);
  }
  useKey('ArrowUp', moveUp);

  const moveDown = () => {
    myPosY.current += delta;
    setMyPlayer(myPlayer => myPlayer.y = myPosY.current);
  }
  useKey('ArrowDown', moveDown);

  const moveRight = () => {
    myPosX.current += delta;
    setMyPlayer(myPlayer => myPlayer.x = myPosX.current);
  }
  useKey('ArrowRight', moveRight);

  const moveLeft = () => {
    myPosX.current -= delta;
    setMyPlayer(myPlayer => myPlayer.x = myPosX.current);
  }
  useKey('ArrowLeft', moveLeft);

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
        <img src={pallet} alt='bg-map' />
        {
          Object.values(players).map(p => {
            // position p (player) based on Player object
            return (<StyledAvatar key={currentUser.uid} x={p.x} y={p.y} src={sprite} />);
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
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  width: 80vh;
`;

// absolute positioning to position player based on viewport height/width
// using left and top
const StyledAvatar = styled.div`
  position: absolute;
  left: ${props => props.x}vw;
  top: ${props => props.y}vh;
  width: 7vh;
  height: 7vh;
`;
