import { useState, useRef, useEffect } from 'react';
import { useKey } from 'react-use';
import styled from 'styled-components';

import Loader from '../Loader/Loader';
import Player from '../../classes/Player';
import Sprite from '../../classes/Sprite';
import pallet from '../../resources/pallet_town.png';
import leftside from '../../resources/leftside.png'; 
import rightside from '../../resources/rightside.png';
import downside from '../../resources/down.png';
import upside from '../../resources/up.png';


import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, set, onValue  } from 'firebase/database';
import { signal, enterLobby, exitLobby, getLobby, getUsername, updatePlayer } from '../../endpoints';


const DELTA = 1;
const BORDER_FLOOR = 0;
const BORDER_CEIL = 90;

export default function Lobby() {

  const { currentUser } = useAuth();
  const [username, setUsername] = useState('');

  const [players, setPlayers] = useState({});
  const [myPlayer, setMyPlayer] = useState({});

  // refs must be used for position values can't use myPlayer values 
  // because event handlers won't change with normal variables / state variables
  // because they will be in a closure and always use their
  // initial values.
  const myPosX = useRef(0);
  const myPosY = useRef(0);

  useEffect(() => {
    // on mount
    const p = new Player('temporary_username', 50, 50, downside);

    enterLobby(currentUser.uid, p);
    getUsername(currentUser.uid)
      .then(uname => {
        console.log('setting username');
        setUsername(uname);
      })
      .catch(err => {
        console.error('In mounting', err);
      });

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
    
    // makes sure that no instance of the player is left in the lobby database on exit
    window.addEventListener('beforeunload', e => {
      console.log('cleaning before unload');
      exitLobby(currentUser.uid);
    });

    // on dismount
    return () => {
      console.log('cleaning up');
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
      newPlayer.y = myPosY.current;
      newPlayer.avatar = upside;
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
      newPlayer.avatar = downside;
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
      newPlayer.avatar = rightside;
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
      newPlayer.avatar = leftside;
      return newPlayer;
    });
  }
  useKey('ArrowLeft', moveLeft);

  
  // only render game when assets are already loaded
  if (!currentUser.uid || !players || !username) {
    return (
      <StyledMain>
        <LobbyMap>
          <Loader />
        </LobbyMap>
      </StyledMain>
    );
  }

  return (
    <StyledMain>
      <LobbyMap>
        <StyledBackground src={pallet} alt='bg-map' />
        {
          Object.keys(players).map(k => {
            // position p (player) based on Player object
            return (
              <StyledAvatar key={k} x={players[k].x} y={players[k].y} zIndex={players[k].y}> 
                <Sprite src={players[k].avatar} states={4} tile={{ width: 20, height: 24 }} scale={2} framesPerStep={8} />
                <span>
                  <p>{'@' + username}</p>
                </span>
              </StyledAvatar>
            );
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
  margin: 50px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 800px;
  min-height: 50vh;
`;

const StyledBackground = styled.img`
  width: 100%;
`;

// absolute positioning to position player based on viewport height/width
// using left and top

// username styling is temporary and may be modified as needed by the frontend engineer (Ryo)
const StyledAvatar = styled.div`
  display: inline-block;
  position: absolute;
  z-index: ${props => props.zIndex};
  left: ${props => props.x}%;
  top: ${props => props.y}%;
  max-width: 10%;

  span {
    position: absolute;
    top: -20px;
    
    p {
      font-size: 16px;
      color: white;
      text-shadow: 1px 1px 2px black;
    }
  }
`;
