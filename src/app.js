// Planoria Modular Planner - Main Application Logic
import { restoreState } from './restore.js';

// Global state object to manage all planner data
const plannerState = {
  learnerName: '',
  teacherName: '',
  school: '',
  subjectRows: [],
  periodRows: [],
  dailyRows: [],
  weeklyData: {}
};

// Auto-save timer
let autoSaveTimer = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Planoria Modular Planner initializing...');
  
  // Restore state from localStorage/Firebase
  await restoreState(plannerState);
  
  // Set up UI
  setupTabSwitching();
  setupEventListeners();
  setupAutoSave();
  
  // Restore UI data
  restoreAllUIData();
  
  // Initial render of all tables
  renderAllTables();
  
  console.log('✅ Planoria Modular Planner initialized');
});

// Tab switching functionality
function setupTabSwitching() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');
      
      // Save current tab data before switching
      saveCurrentTabData();
      
      // Update active states
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.style.display = 'none');
      
      this.classList.add('active');
      const targetContent = document.getElementById(`tab-${targetTab}`);
      if (targetContent) {
        targetContent.style.display = 'block';
      }
      
      // Re-render the active tab's table
      renderActiveTabTable(targetTab);
      
      console.log(`📋 Switched to ${targetTab} tab`);
    });
  });
}

// Save data from currently active tab
function saveCurrentTabData() {
  const activeTab = document.querySelector('.tab-btn.active');
  if (!activeTab) return;
  
  const tabType = activeTab.getAttribute('data-tab');
  
  switch(tabType) {
    case 'subject-planning':
      saveSubjectData();
      break;
    case 'period-planning':
      savePeriodData();
      break;
    case 'daily':
      saveDailyData();
      break;
  }
}

// Render table for the active tab
function renderActiveTabTable(tabType) {
  switch(tabType) {
    case 'subject-planning':
      renderSubjectTable();
      break;
    case 'period-planning':
      renderPeriodTable();
      break;
    case 'daily':
      renderDailyTable();
      break;
    case 'weekly':
      renderWeeklyTable();
      break;
  }
}

// Subject planning functionality
function saveSubjectData() {
  const table = document.getElementById('subject-table');
  const rows = table.querySelectorAll('tbody tr');
  
  plannerState.subjectRows = [];
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 4) {
      plannerState.subjectRows.push({
        subject: cells[0].querySelector('input')?.value || '',
        goal: cells[1].querySelector('input')?.value || '',
        resources: cells[2].querySelector('input')?.value || '',
        notes: cells[3].querySelector('textarea')?.value || ''
      });
    }
  });
}

function renderSubjectTable() {
  const tbody = document.querySelector('#subject-table tbody');
  tbody.innerHTML = '';
  
  // Add existing rows
  plannerState.subjectRows.forEach((rowData, index) => {
    addSubjectRow(rowData);
  });
  
  // Add empty row if no data
  if (plannerState.subjectRows.length === 0) {
    addSubjectRow();
  }
}

function addSubjectRow(data = {}) {
  const tbody = document.querySelector('#subject-table tbody');
  const row = document.createElement('tr');
  
  row.innerHTML = `
    <td><input type="text" value="${data.subject || ''}" placeholder="Subject name"></td>
    <td><input type="text" value="${data.goal || ''}" placeholder="Learning goal"></td>
    <td><input type="text" value="${data.resources || ''}" placeholder="Resources needed"></td>
    <td><textarea placeholder="Notes">${data.notes || ''}</textarea></td>
    <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
  `;
  
  tbody.appendChild(row);
}

// Period planning functionality
function savePeriodData() {
  const table = document.getElementById('period-table');
  const rows = table.querySelectorAll('tbody tr');
  
  plannerState.periodRows = [];
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 3) {
      plannerState.periodRows.push({
        period: cells[0].querySelector('input')?.value || '',
        activity: cells[1].querySelector('input')?.value || '',
        notes: cells[2].querySelector('textarea')?.value || ''
      });
    }
  });
}

function renderPeriodTable() {
  const tbody = document.querySelector('#period-table tbody');
  tbody.innerHTML = '';
  
  // Add existing rows
  plannerState.periodRows.forEach((rowData, index) => {
    addPeriodRow(rowData);
  });
  
  // Add empty row if no data
  if (plannerState.periodRows.length === 0) {
    addPeriodRow();
  }
}

function addPeriodRow(data = {}) {
  const tbody = document.querySelector('#period-table tbody');
  const row = document.createElement('tr');
  
  row.innerHTML = `
    <td><input type="text" value="${data.period || ''}" placeholder="Period/Time"></td>
    <td><input type="text" value="${data.activity || ''}" placeholder="Activity"></td>
    <td><textarea placeholder="Notes">${data.notes || ''}</textarea></td>
    <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
  `;
  
  tbody.appendChild(row);
}

// Daily schedule functionality
function saveDailyData() {
  const table = document.getElementById('daily-table');
  const rows = table.querySelectorAll('tbody tr');
  
  plannerState.dailyRows = [];
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 4) {
      plannerState.dailyRows.push({
        day: cells[0].querySelector('select')?.value || '',
        time: cells[1].querySelector('input')?.value || '',
        activity: cells[2].querySelector('input')?.value || '',
        progress: cells[3].querySelector('select')?.value || ''
      });
    }
  });
  
  // Update weekly data based on daily rows
  updateWeeklyFromDaily();
}

function renderDailyTable() {
  const tbody = document.querySelector('#daily-table tbody');
  tbody.innerHTML = '';
  
  // Add existing rows
  plannerState.dailyRows.forEach((rowData, index) => {
    addDailyRow(rowData);
  });
  
  // Add empty row if no data
  if (plannerState.dailyRows.length === 0) {
    addDailyRow();
  }
}

function addDailyRow(data = {}) {
  const tbody = document.querySelector('#daily-table tbody');
  const row = document.createElement('tr');
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayOptions = days.map(day => 
    `<option value="${day.toLowerCase()}" ${data.day === day.toLowerCase() ? 'selected' : ''}>${day}</option>`
  ).join('');
  
  const progressOptions = [
    '<option value="">Select Progress</option>',
    `<option value="excellent" ${data.progress === 'excellent' ? 'selected' : ''}>Excellent</option>`,
    `<option value="good" ${data.progress === 'good' ? 'selected' : ''}>Good</option>`,
    `<option value="needs-improvement" ${data.progress === 'needs-improvement' ? 'selected' : ''}>Needs Improvement</option>`
  ].join('');
  
  row.innerHTML = `
    <td><select>${dayOptions}</select></td>
    <td><input type="time" value="${data.time || ''}"></td>
    <td><input type="text" value="${data.activity || ''}" placeholder="Activity"></td>
    <td><select>${progressOptions}</select></td>
    <td><button class="remove-btn" onclick="removeRow(this)">Remove</button></td>
  `;
  
  tbody.appendChild(row);
}

// Weekly view functionality
function updateWeeklyFromDaily() {
  plannerState.weeklyData = {};
  
  plannerState.dailyRows.forEach(row => {
    if (!plannerState.weeklyData[row.day]) {
      plannerState.weeklyData[row.day] = [];
    }
    
    plannerState.weeklyData[row.day].push({
      time: row.time,
      activity: row.activity,
      progress: row.progress
    });
  });
  
  // Sort each day's activities by time
  Object.keys(plannerState.weeklyData).forEach(day => {
    plannerState.weeklyData[day].sort((a, b) => {
      return a.time.localeCompare(b.time);
    });
  });
}

function renderWeeklyTable() {
  const tbody = document.querySelector('#weekly-table tbody');
  tbody.innerHTML = '';
  
  // Always update weekly data from daily before rendering
  updateWeeklyFromDaily();
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach(day => {
    const dayData = plannerState.weeklyData[day] || [];
    const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
    
    if (dayData.length === 0) {
      // Add empty row for days with no data
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${dayCapitalized}</strong></td>
        <td>-</td>
        <td><em>No activities scheduled</em></td>
        <td>-</td>
      `;
      tbody.appendChild(row);
    } else {
      // Add row for each activity
      dayData.forEach((activity, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index === 0 ? `<strong>${dayCapitalized}</strong>` : ''}</td>
          <td>${activity.time}</td>
          <td>${activity.activity}</td>
          <td>${activity.progress ? activity.progress.charAt(0).toUpperCase() + activity.progress.slice(1) : '-'}</td>
        `;
        tbody.appendChild(row);
      });
    }
  });
}

// Generic row removal function
window.removeRow = function(button) {
  const row = button.closest('tr');
  row.remove();
  triggerAutoSave();
};

// Event listeners setup
function setupEventListeners() {
  // Add row buttons
  document.getElementById('add-subject-row').addEventListener('click', () => {
    addSubjectRow();
    triggerAutoSave();
  });
  
  document.getElementById('add-period-row').addEventListener('click', () => {
    addPeriodRow();
    triggerAutoSave();
  });
  
  document.getElementById('add-daily-row').addEventListener('click', () => {
    addDailyRow();
    triggerAutoSave();
  });
  
  // Form inputs for basic info
  ['input-learner', 'input-teacher', 'input-school'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', () => {
        const field = id.replace('input-', '');
        plannerState[field === 'learner' ? 'learnerName' : field === 'teacher' ? 'teacherName' : 'school'] = element.value;
        triggerAutoSave();
      });
    }
  });
}

// Auto-save functionality
function setupAutoSave() {
  // Listen for changes in table inputs
  document.addEventListener('input', function(e) {
    if (e.target.matches('#subject-table input, #subject-table textarea, #period-table input, #period-table textarea, #daily-table input, #daily-table select')) {
      triggerAutoSave();
    }
  });
  
  document.addEventListener('change', function(e) {
    if (e.target.matches('#subject-table select, #period-table select, #daily-table select')) {
      triggerAutoSave();
    }
  });
}

function triggerAutoSave() {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
  
  // Save current tab data
  saveCurrentTabData();
  
  // Show saving indicator
  setStatus('💾 Saving...', 'info');
  
  autoSaveTimer = setTimeout(() => {
    saveToLocalStorage();
    setStatus('✅ Saved', 'success');
    
    // Clear status after 2 seconds
    setTimeout(() => setStatus(''), 2000);
  }, 1000);
}

// Local storage functions
function saveToLocalStorage() {
  try {
    localStorage.setItem('plannerState', JSON.stringify(plannerState));
    console.log('💾 Data saved to localStorage');
  } catch (error) {
    console.error('❌ Failed to save to localStorage:', error);
    setStatus('❌ Save failed', 'error');
  }
}

function restoreAllUIData() {
  // Restore basic info
  const learnerInput = document.getElementById('input-learner');
  const teacherInput = document.getElementById('input-teacher');
  const schoolInput = document.getElementById('input-school');
  
  if (learnerInput) learnerInput.value = plannerState.learnerName || '';
  if (teacherInput) teacherInput.value = plannerState.teacherName || '';
  if (schoolInput) schoolInput.value = plannerState.school || '';
}

function renderAllTables() {
  renderSubjectTable();
  renderPeriodTable();
  renderDailyTable();
  renderWeeklyTable();
}

// Status message function
function setStatus(message, type = 'info') {
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = type;
  }
}

// Export functions for global access
window.plannerState = plannerState;
window.renderWeeklyTable = renderWeeklyTable;
window.triggerAutoSave = triggerAutoSave;