import Tile from "./Tile.js";
import { useState, useEffect } from "react";

export default function Sprite(props) {

    const [state, setState] = useState(0);
    var tick = 0;
    var frame = 0;

    const animate = () => {
        const { framesPerStep, states } = props;
        
        if (tick === framesPerStep) {
            tick = 0;
            setState(state => (state + 1) % states);
        }
        tick += 1;

        frame = requestAnimationFrame(animate);
    }

    useEffect(() => {
        // animate on mount
        animate();

        // on dismount
        return () => cancelAnimationFrame(frame);
    }, []);

    
    return ( 
        <Tile src={props.src} state={state} tile={props.tile} scale={props.scale} /> 
    );

}