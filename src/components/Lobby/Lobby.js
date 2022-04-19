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

import leftside2 from '../../resources/leftside-2.png'; 
import rightside2 from '../../resources/rightside-2.png';
import downside2 from '../../resources/down-2.png';
import upside2 from '../../resources/up-2.png';

import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, onValue  } from 'firebase/database';
import { signal, enterLobby, exitLobby, getLobby, getUsername, updatePlayer } from '../../endpoints';


const DELTA = 1;
const BORDER_FLOOR = 0;
const BORDER_CEIL = 90;

export default function Lobby(props) {
  const { currentUser } = useAuth();

  const [players, setPlayers] = useState({});
  const [myPlayer, setMyPlayer] = useState({});

  const rightSprites = [rightside, rightside2];
  const leftSprites = [leftside, leftside2];
  const upSprites = [upside, upside2];
  const downSprites = [downside, downside2];

  const curRightSide = rightSprites[props.sprite];
  const curLeftSide = leftSprites[props.sprite];
  const curUpSide = upSprites[props.sprite];
  const curDownSide = downSprites[props.sprite];

  // refs must be used for position values can't use myPlayer values 
  // because event handlers won't change with normal variables / state variables
  // because they will be in a closure and always use their
  // initial values.
  const myPosX = useRef(0);
  const myPosY = useRef(0);

  useEffect(() => {
    // on mount

    getUsername(currentUser.uid)
      .then(uname => {
        const p = new Player(uname, 50, 50, curDownSide);
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
      console.log('Cleaning before unload');
      exitLobby(currentUser.uid);
    });

    // on dismount
    return () => {
      console.log('Cleaning up');
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
      newPlayer.avatar = curUpSide;
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
      newPlayer.avatar = curDownSide;
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
      newPlayer.avatar = curRightSide;
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
      newPlayer.avatar = curLeftSide;
      return newPlayer;
    });
  }
  useKey('ArrowLeft', moveLeft);

  
  // only render game when assets are already loaded
  if (!currentUser.uid || !players) {
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
                  <p>{'@' + players[k].name}</p>
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
