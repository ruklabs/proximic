import styled from "styled-components";


// Takes advantage of the overflow: hidden attribute to move the 
// position of the image to simulate animation
export default function Tile(props) {

    const { src, tile, state, scale } = props;
    const left = tile.width * state

    return(
        <Container width={tile.width} height={tile.height} scale={scale}>
            <Image src={src} left={left} />
        </Container>
    );
}

const Container = styled.div`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  overflow: hidden;
  transform: scale(${({ scale }) => `${scale}, ${scale}`});
  transform-origin: top left;
`;

const Image = styled.img`
  transform: translate(-${({ left }) => left}px, 0);
`;