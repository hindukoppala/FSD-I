
// ============================================
// Scheduler Application - logic.js
// ============================================

// Get HTML elements
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDate = document.getElementById("taskDate");
const taskTime = document.getElementById("taskTime");
const taskDescription = document.getElementById("taskDescription");

const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

const filterDate = document.getElementById("filterDate");
const clearFilter = document.getElementById("clearFilter");


// ============================================
// Load Tasks from Local Storage
// ============================================

let tasks = JSON.parse(localStorage.getItem("schedulerTasks")) || [];


// Variable used when editing a task
let editingTaskId = null;


// ============================================
// Save Tasks to Local Storage
// ============================================

function saveTasks() {
    localStorage.setItem("schedulerTasks", JSON.stringify(tasks));
}


// ============================================
// Display Tasks
// ============================================

function displayTasks(tasksToDisplay = tasks) {

    // Remove old task elements
    const taskElements = taskList.querySelectorAll(".task");

    taskElements.forEach(task => {
        task.remove();
    });


    // Show empty message when there are no tasks
    if (tasksToDisplay.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";


    // Sort tasks by date and time
    const sortedTasks = [...tasksToDisplay].sort((a, b) => {

        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);

        return dateA - dateB;
    });


    // Create task cards
    sortedTasks.forEach(task => {

        const taskElement = document.createElement("div");

        taskElement.className = "task";

        taskElement.innerHTML = `
            <h3>${escapeHTML(task.title)}</h3>

            <p class="task-date">
                📅 ${formatDate(task.date)}
            </p>

            <p>
                ⏰ ${formatTime(task.time)}
            </p>

            ${
                task.description
                    ? `<p class="task-description">
                        ${escapeHTML(task.description)}
                       </p>`
                    : ""
            }

            <div class="task-buttons">

                <button
                    class="edit-btn"
                    onclick="editTask('${task.id}')">
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTask('${task.id}')">
                    Delete
                </button>

            </div>
        `;

        taskList.appendChild(taskElement);
    });
}


// ============================================
// Add / Update Task
// ============================================

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();


    const title = taskTitle.value.trim();
    const date = taskDate.value;
    const time = taskTime.value;
    const description = taskDescription.value.trim();


    // Basic validation
    if (!title || !date || !time) {
        alert("Please fill in the task title, date and time.");
        return;
    }


    // If editing an existing task
    if (editingTaskId !== null) {

        const taskIndex = tasks.findIndex(
            task => task.id === editingTaskId
        );

        if (taskIndex !== -1) {

            tasks[taskIndex] = {
                id: editingTaskId,
                title: title,
                date: date,
                time: time,
                description: description
            };
        }

        editingTaskId = null;

        document.getElementById("addTaskBtn").textContent = "Add Task";

    }

    // Otherwise create a new task
    else {

        const newTask = {
            id: Date.now().toString(),
            title: title,
            date: date,
            time: time,
            description: description
        };

        tasks.push(newTask);
    }


    // Save tasks
    saveTasks();


    // Clear form
    taskForm.reset();


    // Display updated tasks
    applyFilter();
});


// ============================================
// Edit Task
// ============================================

function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }


    // Put task information into the form
    taskTitle.value = task.title;
    taskDate.value = task.date;
    taskTime.value = task.time;
    taskDescription.value = task.description;


    // Store editing ID
    editingTaskId = id;


    // Change button text
    document.getElementById("addTaskBtn").textContent = "Update Task";


    // Scroll to form
    document.querySelector(".task-form").scrollIntoView({
        behavior: "smooth"
    });
}


// ============================================
// Delete Task
// ============================================

function deleteTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }


    const confirmation = confirm(
        `Are you sure you want to delete "${task.title}"?`
    );


    if (!confirmation) {
        return;
    }


    // Remove task
    tasks = tasks.filter(task => task.id !== id);


    // Save changes
    saveTasks();


    // Display updated list
    applyFilter();
}


// ============================================
// Filter Tasks by Date
// ============================================

filterDate.addEventListener("change", function() {
    applyFilter();
});


function applyFilter() {

    const selectedDate = filterDate.value;


    // If no date selected, show all tasks
    if (!selectedDate) {
        displayTasks(tasks);
        return;
    }


    // Show only tasks matching selected date
    const filteredTasks = tasks.filter(
        task => task.date === selectedDate
    );


    displayTasks(filteredTasks);
}


// ============================================
// Clear Date Filter
// ============================================

clearFilter.addEventListener("click", function() {

    filterDate.value = "";

    displayTasks(tasks);
});


// ============================================
// Format Date
// ============================================

function formatDate(dateString) {

    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}


// ============================================
// Format Time
// ============================================

function formatTime(timeString) {

    const [hours, minutes] = timeString.split(":");

    const date = new Date();

    date.setHours(hours);
    date.setMinutes(minutes);


    return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}


// ============================================
// Escape HTML
// Prevents HTML injection in task text
// ============================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ============================================
// Initial Display
// ============================================

displayTasks();
