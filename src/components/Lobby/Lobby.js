import { useState, useRef, useEffect } from 'react';
import { useKey } from 'react-use';
import styled from 'styled-components';

import { useAuth } from '../../contexts/AuthContext';
import Player from '../../classes/Player';
import { getDatabase, ref, set, onValue  } from 'firebase/database';
import { enterLobby, exitLobby, getLobby, getUsername, updatePlayer } from '../../endpoints';

import pallet from '../../resources/pallet_town.png';
import sprite from '../../resources/spellun-sprite.png'; 

const DELTA = 1;
const BORDER_FLOOR = 0;
const BORDER_CEIL = 90;

export default function Lobby() {
  const { currentUser } = useAuth();
  const [players, setPlayers] = useState({});
  const [myPlayer, setMyPlayer] = useState({});

  // refs must be used for position values can't use myPlayer values 
  // because event handlers won't change with normal variables / state variables
  // because they will be in a closure and always use their
  // initial values.
  const entered = useRef(false);
  const myPosX = useRef(0);
  const myPosY = useRef(0);

  useEffect(() => {
    // on mount
    const p = new Player('temporary_username', 50, 50, sprite);

    enterLobby(currentUser.uid, p);

    getLobby()
      .then(playersObj => {
        setPlayers(playersObj);
        setMyPlayer(playersObj[currentUser.uid]);

        // initialize myPosX, myPosY references
        myPosX.current = playersObj[currentUser.uid].x;
        myPosY.current = playersObj[currentUser.uid].y;
      })
      .catch(err => {
        console.error('In mounting', err);
      });

    // sync lobby
    onValue(ref(getDatabase(), 'lobby/'), snapshot => {
      const data = snapshot.val();
      setPlayers(data);
    });

    // on dismount
    return () => {
      exitLobby(currentUser.uid);
    };
  }, []);


  useEffect(() => {
    updatePlayer(currentUser.uid, myPlayer);
  }, [myPlayer]);


  // keyboard event handlers
  const moveUp = () => {
    if (myPosY.current - DELTA < BORDER_FLOOR) return;
    myPosY.current -= DELTA;

    setMyPlayer(prevPlayer => {
      const newPlayer = JSON.parse(JSON.stringify(prevPlayer));
      newPlayer.y = myPosY.current
      return newPlayer;
    });


  }
  useKey('ArrowUp', moveUp);

  const moveDown = () => {
    if (myPosY.current + DELTA > BORDER_CEIL) return;
    myPosY.current += DELTA;

    setMyPlayer(prevPlayer => {
      const newPlayer = JSON.parse(JSON.stringify(prevPlayer));
      newPlayer.y = myPosY.current;
      return newPlayer;
    });
  }
  useKey('ArrowDown', moveDown);

  const moveRight = () => {
    if (myPosX.current + DELTA > BORDER_CEIL) return;
    myPosX.current += DELTA;

    setMyPlayer(prevPlayer => {
      const newPlayer = JSON.parse(JSON.stringify(prevPlayer));
      newPlayer.x = myPosX.current;
      return newPlayer;
    });
  }
  useKey('ArrowRight', moveRight);

  const moveLeft = () => {
    if (myPosX.current - DELTA < BORDER_FLOOR) return;
    myPosX.current -= DELTA;

    setMyPlayer(prevPlayer => {
      const newPlayer = JSON.parse(JSON.stringify(prevPlayer));
      newPlayer.x = myPosX.current;
      return newPlayer;
    });
  }
  useKey('ArrowLeft', moveLeft);


  return (
    <StyledMain>
      <LobbyMap>
        <StyledBackground src={pallet} alt='bg-map' />
        {
          Object.keys(players).map(k => {
            // position p (player) based on Player object
            return (<StyledAvatar key={k} x={players[k].x} y={players[k].y} src={sprite} />);
          })
        }
      </LobbyMap>
    </StyledMain>
  );
}

// TODO: Migrate all css rules to css file

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
