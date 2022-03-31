import React, {useEffect, useState} from "react";


import sprite1 from '../../resources/sprite-1.png';
import sprite2 from '../../resources/sprite-2.png';

export default function ChangeAvatar(props) {

  const[curSprite, setState] = useState();

  
  const arr = [sprite1, sprite2];

  
  
  useEffect(() => {
    props.passChildData(curSprite);
  }, [curSprite]);

  return(
    <div className="card">
      <div>
        <img src={arr[curSprite]} />
        <input type="radio" value={0} required name="curSprite" onChange={e=>setState(e.target.value)} />purple guy
        <input type="radio" value={1} required name="curSprite" onChange={e=>setState(e.target.value)} />definitely not a pokemon trainer


        <button onClick={props.onClick}>Confirm</button>
      </div>
    </div>
  );
}