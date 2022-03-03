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

    setMyPlayer(prevPlayer => {
      const newPlayer = JSON.parse(JSON.stringify(prevPlayer));
      newPlayer.y = myPosY.current;
      return newPlayer;
    });
  }
  useKey('ArrowUp', moveUp);

  const moveDown = () => {
    myPosY.current += delta;

    setMyPlayer(prevPlayer => {
      const newPlayer = JSON.parse(JSON.stringify(prevPlayer));
      newPlayer.y = myPosY.current;
      return newPlayer;
    });
  }
  useKey('ArrowDown', moveDown);

  const moveRight = () => {
    myPosX.current += delta;

    setMyPlayer(prevPlayer => {
      const newPlayer = JSON.parse(JSON.stringify(prevPlayer));
      newPlayer.x = myPosX.current;
      return newPlayer;
    });
  }
  useKey('ArrowRight', moveRight);

  const moveLeft = () => {
    myPosX.current -= delta;

    setMyPlayer(prevPlayer => {
      const newPlayer = JSON.parse(JSON.stringify(prevPlayer));
      newPlayer.x = myPosX.current;
      return newPlayer;
    });
  }
  useKey('ArrowLeft', moveLeft);

  useEffect(() => {
    // if something changes with myPlayer
    // if myPlayer reference changes (update players dictionary) --> update entire lobby state
    setPlayers(prevPlayers => {
      const newPlayers = JSON.parse(JSON.stringify(prevPlayers));
      console.log('myplayer>useEffect', myPlayer);
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
        <StyledBackground src={pallet} alt='bg-map' />
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
  justify-content: center;
  align-items: center;
`;

// LobbyMap is the holder of all players
// tiling / background images can be used here
const LobbyMap = styled.div`
  position: relative;
  background-color: grey;
  margin: 50px 0;
  background-color: grey;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 800px;
`;

const StyledBackground = styled.img`
  width: 100%;
`;

// absolute positioning to position player based on viewport height/width
// using left and top
const StyledAvatar = styled.img`
  display: inline-block;
  position: absolute;
  left: ${props => props.x}%;
  top: ${props => props.y}%;
  max-width: 10%;
`;
