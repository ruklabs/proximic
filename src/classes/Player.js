
export default class Player {
  constructor(name, posX, posY, imgPath, agoraUid) {
    this.name = name;
    this.x = posX;
    this.y = posY;
    this.auid = agoraUid;

    this.avatar = imgPath;
  }
}
