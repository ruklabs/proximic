import { getDatabase, ref, set, update, remove, get, child, onValue  } from 'firebase/database';

export function writeUserData(userId, username, email) {
  const db = getDatabase();
  set(ref(db, 'users/' + userId), {
    username,
    email
  });
}

export async function getUsername(userId) {
  try {
    const dbRef = ref(getDatabase());
    const response = await get(child(dbRef, `users/${userId}`));
    if (response.exists()) {
      return response.val().username;
    }

    console.log('no username');
    return null;
  } catch (err) {
    console.error(err);
  }
}

export async function enterLobby(userId, initialplayer) {
  // adds the user to the current lobby state
  console.log('Entering lobby');
  try {
    const db = getDatabase();
    set(ref(db, `lobby/${userId}`), initialplayer);
  } catch (err) {
    console.log('enterLobby', err);
  }
}

export function updatePlayer(userId, player) {
  const db = getDatabase();
  update(ref(db, 'lobby/' + userId), {...player});
}

export async function getLobby() {
  console.log('Getting lobby');
  const dbRef = ref(getDatabase());

  try {
    const response = await get(child(dbRef, `lobby/`))
    if (response.exists()) {
      return response.val();
    }

    console.log('Lobby does not exist');
    return null;
  } catch (err) {
    console.error(err);
  }
}

export function exitLobby(userId) {
  // removes user from lobby upon leave
  const db = getDatabase();
  remove(ref(db, `lobby/${userId}`));
}

export function signal() {
  const db = getDatabase();
  set(ref(db, `ItsWorking/`), true);
}
