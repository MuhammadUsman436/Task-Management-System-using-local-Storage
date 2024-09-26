
if ("Notification" in window && Notification.permission !== "denied") {
  Notification.requestPermission();
}

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || [];

const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const addTaskButton = document.getElementById("addTaskButton");
const prioritySelect = document.getElementById("priority");
const categoryInput = document.getElementById("categoryInput");
const filterSelect = document.getElementById("filter");
const categoryFilter = document.getElementById("categoryFilter");


function loadCategories() {
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach((ctg) => {
    const option = document.createElement("option");
    option.value = ctg;
    option.textContent = ctg;
    categoryFilter.appendChild(option);
  });
}


function renderTasks(filter = "all", categoryFilterValue = "all") {
  taskList.innerHTML = "";

  let filteredTasks = tasks.filter((task) => {
    const matchesStatus = filter === "all" || task.status === filter;
    const matchesCategory =
      categoryFilterValue === "all" || task.category === categoryFilterValue;
    return matchesStatus && matchesCategory;
  });

  filteredTasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = `list-group-item task-item ${task.status}`;
    li.draggable = true;
    li.dataset.index = index;

    li.innerHTML = `
    <span class="${task.priority} task-info" style="flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
      ${task.name} (${task.priority}) - ${task.category}
    </span>
    <div class="task-actions" style="display: flex; gap: 8px;">
      <button class="btn btn-sm btn-outline-success" onclick="toggleTask(${index})">
        ${task.status === "completed" ? "Mark Pending" : "Mark Completed"}
      </button>
      <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${index})">
        <i class="fas fa-trash"></i>
      </button>
      <button class="btn btn-sm btn-outline-primary" onclick="editTask(${index})">
        <i class="fas fa-edit"></i>
      </button>
    </div>
  `;


   
    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragover", handleDragOver);
    li.addEventListener("drop", handleDrop);

    taskList.appendChild(li);
  });
}


function addTask() {
  const taskName = taskInput.value.trim();
  const taskPriority = prioritySelect.value;
  const taskCategory = categoryInput.value.trim();

  if (taskName && taskCategory) {
    tasks.push({
      name: taskName,
      status: "pending",
      priority: taskPriority,
      category: taskCategory,
    });

    
    if (!categories.includes(taskCategory)) {
      categories.push(taskCategory);
      saveCategories();
      loadCategories();
    }

    taskInput.value = "";
    categoryInput.value = "";
    saveTasks();
    renderTasks();
  }
}


function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
  showNotification("Task Deleted", "A task has been removed.");
}


function toggleTask(index) {
  tasks[index].status =
    tasks[index].status === "completed" ? "pending" : "completed";
  saveTasks();
  renderTasks();
  showNotification("Task Updated", "Task status has been updated.");
}


function editTask(index) {
  const newTaskName = prompt("Edit task name:", tasks[index].name);
  if (newTaskName) {
    tasks[index].name = newTaskName.trim();
    saveTasks();
    renderTasks();
  }
}


function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}


function saveCategories() {
  localStorage.setItem("categories", JSON.stringify(categories));
}

filterSelect.addEventListener("change", () => {
  renderTasks(filterSelect.value, categoryFilter.value);
});

categoryFilter.addEventListener("change", () => {
  renderTasks(filterSelect.value, categoryFilter.value);
});


let draggedItemIndex;

function handleDragStart(e) {
  draggedItemIndex = e.target.dataset.index;
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  const droppedItemIndex = e.target.dataset.index;
  if (draggedItemIndex !== droppedItemIndex) {
    const draggedTask = tasks.splice(draggedItemIndex, 1)[0];
    tasks.splice(droppedItemIndex, 0, draggedTask);
    saveTasks();
    renderTasks();
  }
}


function showNotification(title, message) {
  if (Notification.permission === "granted") {
    new Notification(title, { body: message });
  }
}


loadCategories();
renderTasks();
addTaskButton.addEventListener("click", addTask);
