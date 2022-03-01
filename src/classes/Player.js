
export default class Player {
  constructor(name, posX, posY, imgPath) {
    this.name = name;
    this.x = posX;
    this.y = posY;

    this.avatar = imgPath;
  }
}
