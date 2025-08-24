import { restoreFromFirebase, isFirebaseReady } from './firebase.js';

export async function restoreState(stateObj) {
  let restored = false;
  
  // Try to restore from Firebase first
  if (isFirebaseReady()) {
    try {
      const fromCloud = await restoreFromFirebase();
      if (fromCloud) {
        // Ensure all required properties exist
        Object.assign(stateObj, {
          learnerName: '',
          teacherName: '',
          school: '',
          subjectRows: [],
          periodRows: [],
          dailyRows: [],
          weeklyData: {},
          ...fromCloud
        });
        restored = true;
        setStatus('Restored from cloud');
        console.log('✅ State restored from Firebase');
      }
    } catch (error) {
      console.error('❌ Firebase restore failed:', error);
      setStatus('Restore failed (cloud)');
    }
  }
  
  // Fallback to localStorage if Firebase failed
  if (!restored) {
    try {
      const fromLocal = localStorage.getItem('plannerState');
      if (fromLocal) {
        const localData = JSON.parse(fromLocal);
        // Ensure all required properties exist
        Object.assign(stateObj, {
          learnerName: '',
          teacherName: '',
          school: '',
          subjectRows: [],
          periodRows: [],
          dailyRows: [],
          weeklyData: {},
          ...localData
        });
        setStatus('Restored from local');
        console.log('✅ State restored from localStorage');
        restored = true;
      }
    } catch (error) {
      console.error('❌ localStorage restore failed:', error);
      setStatus('Restore failed (local)');
    }
  }
  
  // Initialize with defaults if nothing was restored
  if (!restored) {
    Object.assign(stateObj, {
      learnerName: '',
      teacherName: '',
      school: '',
      subjectRows: [],
      periodRows: [],
      dailyRows: [],
      weeklyData: {}
    });
    setStatus('Initialized with defaults');
    console.log('🆕 State initialized with default values');
  }
  
  return restored;
}

function setStatus(msg) {
  const statusSpan = document.getElementById("status");
  if (statusSpan) statusSpan.textContent = msg;
  setTimeout(() => { if (statusSpan) statusSpan.textContent = ''; }, 2000);
}