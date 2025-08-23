import { restoreFromFirebase, isFirebaseReady } from './firebase.js';

export async function restoreState(stateObj) {
  let restored = false;
  if (isFirebaseReady()) {
    try {
      const fromCloud = await restoreFromFirebase();
      if (fromCloud) Object.assign(stateObj, fromCloud);
      restored = true;
      setStatus('Restored from cloud');
    } catch {
      setStatus('Restore failed (cloud)');
    }
  }
  if (!restored) {
    try {
      const fromLocal = JSON.parse(localStorage.getItem('plannerState'));
      if (fromLocal) Object.assign(stateObj, fromLocal);
      setStatus('Restored from local');
    } catch {
      setStatus('Restore failed (local)');
    }
  }
}

function setStatus(msg) {
  const statusSpan = document.getElementById("status");
  if (statusSpan) statusSpan.textContent = msg;
  setTimeout(() => { if (statusSpan) statusSpan.textContent = ''; }, 2000);
}