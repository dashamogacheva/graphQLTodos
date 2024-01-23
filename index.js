const url = 'https://graphqlzero.almansi.me/api';

const addTaskForm = document.getElementById('addTaskForm');
const searchTaskForm = document.getElementById('searchTaskForm');
const todos = document.getElementById('todos');

addTaskForm.addEventListener('submit', addTaskHandler);
searchTaskForm.addEventListener('submit', searchTaskHandler);

const makeRequest = (query) => {
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({query})
    }).then(response => response.json())
}

function printTodos({id = '', title, completed = false, user = {}}) {
    const li = document.createElement("li");
    li.className = 'liStyles';
    li.innerHTML = `&nbsp; ${title} | ID: ${id} | by <b>${user.name}</b>`;
    li.setAttribute('data-id', id);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    if (completed) {
        checkbox.setAttribute('checked', 'true');
    }
    checkbox.addEventListener('change', handleTodoStatus);
    li.prepend(checkbox);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'deleteBtnTodoStyle';
    deleteBtn.innerHTML = "&times;";
    deleteBtn.addEventListener('click', handleDeleteTodo);
    li.append(deleteBtn);

    todos.prepend(li);
}

makeRequest(`query ToDos {
  todos {
    data {
      id
      title
      completed
      user {
        name
        address {
          city
        }
      }
    }
  }
}`).then(({data}) => data.todos.data.forEach((todo) => printTodos(todo)));

async function addTaskHandler(e) {
    e.preventDefault();
    if (addTaskForm.taskName.value) {
        const newTaskQuery = `mutation CreateTodo {
            createTodo (input:{title: "${addTaskForm.taskName.value}", completed: false}) {
                id
                title
                completed
            }
        }`;

        const data = await makeRequest(newTaskQuery);
        printTodos(data.data.createTodo);
        addTaskForm.reset();
    }
}

async function searchTaskHandler(e) {
    e.preventDefault();
    if (searchTaskForm.searchTaskName.value) {
        const newSearchQuery = `query SearchTasks {
            todos (options: {search: {q : "${searchTaskForm.searchTaskName.value}"}, , sort:{field: "id", order: ASC}}) {
                data {
                    id
                    title
                    completed
                    user {
                        name
                    }
                }
            }
        }`;

        const { data } = await makeRequest(newSearchQuery);
        todos.innerHTML = '';
        data.todos.data.forEach((todo) => printTodos(todo));
    }
}

async function handleDeleteTodo() {
    const todoId = this.parentElement.dataset.id;
    const deleteQuery = `mutation DeleteTodo {
        deleteTodo (id: "${todoId}")
    }`;

    const data = await makeRequest(deleteQuery);
    if (data.data.deleteTodo) {
        this.parentElement.remove();
    }
}

async function handleTodoStatus() {
    const todoId = this.parentElement.dataset.id;
    const changeStatusQuery = `mutation ChangeStatus {
        updateTodo(id: "${todoId}", input: { completed: ${this.checked} }) {
            completed
        }
    }`;
    const data = await makeRequest(changeStatusQuery);
    if (data.data.updateTodo.completed) {
        this.setAttribute('checked', "true");
    } else {
        this.removeAttribute('checked');
    }
}