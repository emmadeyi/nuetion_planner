const listContainer = document.querySelector("[data-list]");
const newListForm = document.querySelector('[data-new-list-form]');
const newListInput = document.querySelector('[data-new-list-input]');
const deleteListButton = document.querySelector('[data-delete-list-button]');
const listDisplayContainer = document.querySelector('[data-list-display-container]');
const listTitleElement = document.querySelector('[data-list-title]');
const listCountElement = document.querySelector('[data-list-count]');
const tasksContainer = document.querySelector('[data-tasks]');
const taskTemplate = document.getElementById('task-template');
const newTaskForm = document.querySelector('[data-new-task-form]');
const newTaskInput = document.querySelector('[data-new-task-input]');
const clearCompleteTaskButton = document.querySelector('[data-clear-complete-task-button]');

// Local storage setup
const LOCAL_STORAGE_LIST_KEY = 'task.list';
const LOCAL_STORAGE_LIST_ID_KEY = 'task.selectedListId';

let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || []
let selectedListId = localStorage.getItem(LOCAL_STORAGE_LIST_ID_KEY);

listContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
        selectedListId = e.target.dataset.listId;
        saveAndRender();
    }
});

tasksContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'input') {
        const selectedList = lists.find(list => list.id === selectedListId);
        const selectedTask = selectedList.tasks.find(task => task.id === e.target.id);
        selectedTask.complete = e.target.checked;
        if (selectedTask.complete) {
            e.target.parentNode.childNodes[3].classList.add('complete-task');
        } else {
            e.target.parentNode.childNodes[3].classList.remove('complete-task');
        }

        saveToLocalStorage();
        renderTaskCount(selectedList);
    }
})

newListForm.addEventListener('submit', e => {
    e.preventDefault();
    // get input value
    const listName = newListInput.value;
    // validate input value
    if (listName === '' || listName == null) return
    // create new list
    const list = createList(listName);
    // clear input value
    newListInput.value = null;
    // add new list to lists array
    lists.push(list);
    // re-render 
    saveAndRender();
});

newTaskForm.addEventListener('submit', e => {
    e.preventDefault();
    // get input value
    const taskName = newTaskInput.value;
    // validate input value
    if (taskName === '' || taskName == null) return
    // create new list
    const task = createTask(taskName);
    // clear input value
    newTaskInput.value = null;
    // add new list to lists array
    const selectedList = lists.find(list => list.id === selectedListId);
    selectedList.tasks.push(task);
    // re-render 
    saveAndRender();
});

deleteListButton.addEventListener('click', e => {
    lists = lists.filter(list => list.id !== selectedListId);
    selectedListId = null;
    saveAndRender();
});

clearCompleteTaskButton.addEventListener('click', e => {
    const selectedList = lists.find(list => list.id === selectedListId);
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
    saveAndRender();
})

function createList(name) {
    // return new list object
    return {
        id: Date.now().toString(),
        name: name,
        tasks: []
    }
}

function createTask(name) {
    return {
        id: Date.now().toString(),
        name: name,
        complete: false
    }
}

function saveToLocalStorage() {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
    localStorage.setItem(LOCAL_STORAGE_LIST_ID_KEY, selectedListId);
}

function saveAndRender() {
    saveToLocalStorage();
    render();
}

function render() {
    // clear list container
    clearElement(listContainer);
    // populate DOM with list elements
    renderLists();

    const selectedList = lists.find(list => list.id === selectedListId);

    if (selectedListId == null) {
        listDisplayContainer.style.display = 'none'
    } else {
        listDisplayContainer.style.display = '';
        listTitleElement.innerText = selectedList.name;
        renderTaskCount(selectedList);
        clearElement(tasksContainer);
        renderTasks(selectedList);
    }
}

function renderTasks(selectedList) {
    selectedList.tasks.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true);
        const checkbox = taskElement.querySelector('input');
        checkbox.id = task.id;
        checkbox.checked = task.complete;
        const label = taskElement.querySelector('label');
        label.htmlFor = task.id
        const taskName = taskElement.querySelector('[data-task-name]');
        taskName.innerText = task.name;
        tasksContainer.appendChild(taskElement);
    })
}

function renderTaskCount(selectedList) {
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length;
    const taskString = incompleteTaskCount === 1 ? 'task' : 'tasks';
    listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`;
    listCountElement.style.display = ''
}

function renderLists() {
    lists.forEach(list => {
        // create a new li element
        const listElement = document.createElement('li');
        // add listID data attribute
        listElement.dataset.listId = list.id;
        // add list class name
        listElement.classList.add('list-name');
        // add list name to element
        listElement.innerHTML = list.name;
        // check for active list class
        if (list.id === selectedListId) {
            listElement.classList.add('active-list');
        }

        // append list to listcontainer
        listContainer.appendChild(listElement);
    })
}

function clearElement(element) {
    // check for child element and remove all
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}


render();