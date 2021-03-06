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

import upside3 from '../../resources/up-3.png';
import upside4 from '../../resources/up-4.png';
import downside3 from '../../resources/down-3.png';
import downside4 from '../../resources/down-4.png';

import leftside3 from '../../resources/leftside-3.png'; 
import rightside3 from '../../resources/rightside-3.png';
import leftside4 from '../../resources/leftside-4.png'; 
import rightside4 from '../../resources/rightside-4.png';

import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, onValue  } from 'firebase/database';
import { enterLobby, exitLobby, getLobby, getUsername, updatePlayer } from '../../endpoints';

import { join, setVol } from '../Voice/Voice2';

const DELTA = 1;
const BORDER_FLOOR = 0;
const BORDER_CEIL = 90;

let AGORAUID;

const ACTIVE_DIST= 15;

const distance = (x1, y1, x2, y2) => {
  const sum = Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2);
  return Math.sqrt(sum);
};

export default function Lobby(props) {
  const { currentUser } = useAuth();

  const [players, setPlayers] = useState({});
  const [myPlayer, setMyPlayer] = useState({});

  const rightSprites = [rightside, rightside2, rightside3, rightside4];
  const leftSprites = [leftside, leftside2, leftside3, leftside4];
  const upSprites = [upside, upside2, upside3, upside4];
  const downSprites = [downside, downside2, downside3, downside4];

  // refs must be used for position values can't use myPlayer values 
  // because event handlers won't change with normal variables / state variables
  // because they will be in a closure and always use their
  // initial values.
  const myPosX = useRef(0);
  const myPosY = useRef(0);

  useEffect(() => {
    // on mount
    join()
      .then(auid => {
        AGORAUID = auid;

    getUsername(currentUser.uid)
      .then(uname => {
        const p = new Player(uname, 50, 50, downSprites[props.sprite], AGORAUID);
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


      })
      .catch(err => {
        console.log("Lobby Mounting:", err);
      });

    // sync lobby
    onValue(ref(getDatabase(), 'lobby/'), snapshot => {
      const data = snapshot.val();

      // iterate through every player
      Object.keys(data).forEach(player => {
        if (player === currentUser.uid) return;

        const d = distance(myPosX.current, myPosY.current, data[player].x, data[player].y);
        const ratio = d / ACTIVE_DIST;
        console.log('ratio', ratio);

        if (ratio > 1) {
          // no volume
          setVol(data[player].auid, 0);
        } else {
          const vol = 100 - 100 * ratio;
          setVol(data[player].auid, vol);
        }
      });

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
      newPlayer.avatar = upSprites[props.sprite];
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
      newPlayer.avatar = downSprites[props.sprite];
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
      newPlayer.avatar = rightSprites[props.sprite];
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
      newPlayer.avatar = leftSprites[props.sprite];
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
    left: -15px;
    
    p {
      font-size: 12px;
      color: white;
      text-shadow: 1px 1px 2px black;
    }
  }
`;
