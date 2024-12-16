document.addEventListener('DOMContentLoaded', init);

let classes = []; // {className, location, startDate, endDate, days[], startTime, endTime}
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const startHour = 8;  // 8 AM
const endHour = 18;   // 6 PM
const increment = 30; // 30 min increments

let weekStart; 
initializeWeekStart();

function initializeWeekStart() {
    const currentDate = new Date();
    const currentDay = currentDate.getDay(); // 0=Sun,1=Mon...
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() + mondayOffset);
}

function init() {
    displayGreeting();
    displayCurrentDate();
    loadTasks();
    loadNotes();
    fetchQuote();

    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    document.getElementById('notesArea').addEventListener('input', saveNotes);
    document.getElementById('changeNameBtn').addEventListener('click', changeUserName);

    loadClasses();
    document.getElementById('classForm').addEventListener('submit', addClass);

    renderWeeklySchedule();
    renderClassList();

    document.getElementById('prevWeekBtn').addEventListener('click', showPreviousWeek);
    document.getElementById('nextWeekBtn').addEventListener('click', showNextWeek);
}

/** Greeting */
function displayGreeting() {
    const greetingEl = document.getElementById('greeting');
    const now = new Date();
    const hour = now.getHours();
    let greetingText = 'Good Evening';
    if (hour < 12) {
        greetingText = 'Good Morning';
    } else if (hour < 18) {
        greetingText = 'Good Afternoon';
    }

    let userName = localStorage.getItem('userName');
    if (!userName) {
        userName = prompt("Please enter your name:") || "User";
        localStorage.setItem('userName', userName);
    }

    greetingEl.textContent = `${greetingText}, ${userName}`;
}

function changeUserName() {
    const newName = prompt("Please enter your new name:");
    if (newName) {
        localStorage.setItem('userName', newName);
        displayGreeting();
    }
}

/** Current Date */
function displayCurrentDate() {
    const dateEl = document.getElementById('currentDate');
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
}

/** Tasks */
function addTask() {
    const newTaskInput = document.getElementById('newTaskInput');
    const taskText = newTaskInput.value.trim();
    if (taskText) {
        const tasks = getTasksFromStorage();
        tasks.push({ text: taskText, completed: false });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        newTaskInput.value = '';
        renderTasks(tasks);
    }
}

function renderTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        const textSpan = document.createElement('span');
        textSpan.textContent = task.text;

        const completeBtn = document.createElement('button');
        completeBtn.textContent = task.completed ? 'Uncomplete' : 'Complete';
        completeBtn.addEventListener('click', () => toggleTaskCompletion(index));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(index));

        li.appendChild(textSpan);
        li.appendChild(completeBtn);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);

        if (task.completed) {
            textSpan.style.textDecoration = 'line-through';
        }
    });
}

function toggleTaskCompletion(index) {
    const tasks = getTasksFromStorage();
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks(tasks);
}

function deleteTask(index) {
    const tasks = getTasksFromStorage();
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks(tasks);
}

function loadTasks() {
    const tasks = getTasksFromStorage();
    renderTasks(tasks);
}

function getTasksFromStorage() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

/** Notes */
function saveNotes() {
    const notes = document.getElementById('notesArea').value;
    localStorage.setItem('notes', notes);
}

function loadNotes() {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes !== null) {
        document.getElementById('notesArea').value = savedNotes;
    }
}

/** Quote */
function fetchQuote() {
    fetch('https://zenquotes.io/api/random')
        .then(response => response.json())
        .then(data => {
            const quoteEl = document.getElementById('quote');
            if (data && data[0]) {
                quoteEl.textContent = `"${data[0].q}" - ${data[0].a}`;
            } else {
                quoteEl.textContent = "Stay motivated!";
            }
        })
        .catch(() => {
            document.getElementById('quote').textContent = "Stay motivated!";
        });
}

/** Classes */
function addClass(e) {
    e.preventDefault();
    const className = document.getElementById('className').value.trim();
    const location = document.getElementById('location').value.trim();
    const startDateValue = document.getElementById('classStartDate').value;
    const endDateValue = document.getElementById('classEndDate').value;
    const days = Array.from(document.querySelectorAll('#classForm input[name="days"]:checked')).map(cb => cb.value);
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    if (!className || !location || !startDateValue || !endDateValue || days.length === 0 || !startTime || !endTime) {
        alert("Please fill in all class details.");
        return;
    }

    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);
    if (endDate < startDate) {
        alert("End date cannot be before start date.");
        return;
    }

    classes.push({
        className,
        location,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days,
        startTime,
        endTime
    });
    localStorage.setItem('classes', JSON.stringify(classes));

    document.getElementById('classForm').reset();
    renderWeeklySchedule();
    renderClassList();
}

function loadClasses() {
    classes = JSON.parse(localStorage.getItem('classes')) || [];
}

function deleteClass(index) {
    classes.splice(index, 1);
    localStorage.setItem('classes', JSON.stringify(classes));
    renderWeeklySchedule();
    renderClassList();
}

function renderClassList() {
    const classList = document.getElementById('classList');
    classList.innerHTML = '';
    classes.forEach((c, index) => {
        const li = document.createElement('li');
        const info = document.createElement('span');
        info.classList.add('class-info');

        const classStart = new Date(c.startDate);
        const classEnd = new Date(c.endDate);
        const startStr = classStart.toLocaleDateString(undefined, {year:'numeric', month:'numeric', day:'numeric'});
        const endStr = classEnd.toLocaleDateString(undefined, {year:'numeric', month:'numeric', day:'numeric'});
        info.textContent = `${c.className} @ ${c.location}, ${startStr} to ${endStr}, days: ${c.days.join(', ')}, ${formatTime(c.startTime)} - ${formatTime(c.endTime)}`;

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.classList.add('delete-class-btn');
        delBtn.addEventListener('click', () => deleteClass(index));

        li.appendChild(info);
        li.appendChild(delBtn);
        classList.appendChild(li);
    });
}

/** Week Navigation */
function showPreviousWeek() {
    weekStart.setDate(weekStart.getDate() - 7);
    renderWeeklySchedule();
}

function showNextWeek() {
    weekStart.setDate(weekStart.getDate() + 7);
    renderWeeklySchedule();
}

/** Render Weekly Schedule */
function renderWeeklySchedule() {
    const scheduleGrid = document.getElementById('scheduleGrid');
    scheduleGrid.innerHTML = '';

    // Calculate dates for Monday-Friday
    const weekDates = daysOfWeek.map((day, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
    });

    const mondayOfWeek = weekDates[0];
    const fridayOfWeek = weekDates[4];

    // Draw day labels (in the first row)
    // We'll place them absolutely by making first row special: Let's just add them outside increments
    // Actually, let's just put them as a top row by using a loop for day labels:
    // Instead of top row in CSS grid, we place them absolutely at top. Or we can place them using a pseudo-row.
    // For simplicity, create elements for time labels and day labels:

    // Time & Day Labels (Use absolute positioning: We'll place them at top and left)
    // Actually, let's place them in the grid using the first increment as a reference:
    // We'll place times along the left (timeCol), and days along top row at row 1 (8:00 am)
    // We'll just place them above the first time slot row by offsetting times.

    // Let's insert time labels in the time column
    // from 8:00 am to 6:00 pm in increments of 30 min
    const totalIncrements = ((endHour - startHour) * 60) / increment; // 20 increments for 10 hours
    for (let i = 0; i <= totalIncrements; i++) {
        const timeDiv = document.createElement('div');
        timeDiv.classList.add('time-label');
        timeDiv.style.gridRow = i+1; // Each increment is one row
        const timeValue = addMinutes(startHour*60, i*increment);
        timeDiv.textContent = formatTimeObj(timeValue);
        scheduleGrid.appendChild(timeDiv);
    }

    // Add day labels at the top row (row = 1)
    // We'll place day labels on top of the first time slot row. 
    // Let’s place them at row 1 but in the respective columns:
    daysOfWeek.forEach((day, i) => {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day-label');
        dayDiv.textContent = `${weekDates[i].toLocaleDateString(undefined,{weekday:'long'})} (${(weekDates[i].getMonth()+1)}/${weekDates[i].getDate()})`;

        // We'll position day labels just above the 8:00 am label.
        // We can do this by absolute positioning at the top, or we can reserve a top row.
        // Let's absolutely position them inside scheduleGrid:
        dayDiv.style.position = 'absolute';
        dayDiv.style.left = `calc(60px + ${i} * ((100% - 60px)/5))`;
        dayDiv.style.width = `calc((100% - 60px)/5)`;
        dayDiv.style.textAlign = 'center';
        dayDiv.style.background = '#f4f4f4';
        dayDiv.style.borderBottom = '1px solid #ddd';
        dayDiv.style.fontWeight = 'bold';
        dayDiv.style.padding = '5px 0';
        dayDiv.style.top = '0';
        scheduleGrid.appendChild(dayDiv);
    });

    // We need to offset class blocks because day labels are placed at the top.
    // Let's add padding-top to scheduleGrid so first time slot shows below day labels.
    scheduleGrid.style.paddingTop = '30px';

    // Now place classes
    classes.forEach(cls => {
        const classStartDate = new Date(cls.startDate);
        const classEndDate = new Date(cls.endDate);

        // Class appears if it overlaps current week: startDate <= Friday and endDate >= Monday
        if (classStartDate <= fridayOfWeek && classEndDate >= mondayOfWeek) {
            cls.days.forEach(day => {
                const dayIndex = daysOfWeek.indexOf(day);
                if (dayIndex !== -1) {
                    // The class is on this day
                    // Determine time rows
                    const startPos = timeToRow(cls.startTime);
                    const endPos = timeToRow(cls.endTime);

                    // Create class block
                    const classBlock = document.createElement('div');
                    classBlock.classList.add('class-block');
                    classBlock.textContent = `${cls.className}@${cls.location} (${formatTime(cls.startTime)} - ${formatTime(cls.endTime)})`;

                    // Position class block
                    const dayColumnWidth = (scheduleGrid.clientWidth - 60); 
                    // wait until rendered? Might be 0 if done too soon. Let's assume fixed width or handle on resize.
                    // Alternatively, use offsetWidth.
                    const actualWidth = scheduleGrid.offsetWidth - 60;
                    const colWidth = actualWidth / 5;

                    classBlock.style.top = `${(startPos-1)*30 + 30}px`; 
                    // (startPos-1)*30 gives top offset, +30 for day labels padding
                    classBlock.style.left = `${60 + dayIndex*colWidth}px`;
                    // Height = number of increments between startPos and endPos * 30px
                    const height = (endPos - startPos)*30;
                    classBlock.style.height = `${height}px`;

                    scheduleGrid.appendChild(classBlock);
                }
            });
        }
    });
}

/** Time Utilities */
function formatTime(timeStr) {
    const [hour, minute] = timeStr.split(':').map(Number);
    return formatHourMin(hour, minute);
}

function formatTimeObj(totalMin) {
    // totalMin from midnight
    const h = Math.floor(totalMin/60);
    const m = totalMin%60;
    return formatHourMin(h,m);
}

function formatHourMin(h,m) {
    let displayHour = h;
    let ampm = 'am';
    if (h === 0) {
        displayHour = 12;
    } else if (h === 12) {
        ampm = 'pm';
    } else if (h > 12) {
        displayHour = h - 12;
        ampm = 'pm';
    }
    return `${displayHour}:${m.toString().padStart(2,'0')} ${ampm}`;
}

function addMinutes(baseHourMin, addMin) {
    return baseHourMin*60 + addMin; // Not used directly, simplified approach:
    // Actually we didn't define baseHourMin. Let's fix this function:
    // Actually let's define a helper differently:
    // We'll never call addMinutes(baseHourMin...). Let's define from scratch:
    // We have startHour. Let's define a function:
}

function timeToRow(timeStr) {
    // Convert "HH:MM" to a row index
    const [H,M] = timeStr.split(':').map(Number);
    const totalMins = H*60 + M;
    const startMins = startHour*60;
    const incrementsFromStart = Math.floor((totalMins - startMins)/increment) + 1;
    return incrementsFromStart;
}

function addMinutes(hourMin, addedMin) {
    return hourMin + addedMin;
}

/** End of Code */
