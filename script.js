let input = document.getElementById('text-input');
let button = document.getElementById('add-button');
let contentPage = document.getElementById('content-page');

let tasks = [];
let inputValue = '';
let itemEdit = null;

window.onload = function init() {
  input.addEventListener('change', updateValue);
  button.addEventListener('click', addItem);

  createRequest('http://localhost:8000/allTasks', 'GET', false);
};

const createRequest = (reqUrl, reqMethod, reqHeaders = false, reqText = null, reqIsCheck = null, reqId = null) => {
  let config = {};
  let body = {};
  let headers = {
    'Content-type': 'application/json;charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  };

  reqId ? body.id = reqId : body;
  reqText ? body.text = reqText : body;
  reqIsCheck != undefined ? body.isCheck = reqIsCheck : body;

  reqMethod ? config.method = reqMethod : config;
  reqHeaders ? config.headers = headers : config;
  Object.keys(body).length !== 0 ? config.body = JSON.stringify(body) : config;

  return  fetch(reqUrl, config)
            .then(response => response.json())
            .then(result => {
              tasks = result.data;
              render();
            });
};

const addItem = () => {
  if (inputValue) {
    createRequest('http://localhost:8000/createTask', 'POST', true, inputValue, false);
  } else {
    alert('Fill the input value please');
  }

  input.value = '';
  inputValue = '';
}

const updateValue = (event) => {
  inputValue = event.target.value;
}

const changeItemCheck = (index) => {
  const text = tasks[index].text;
  const id = tasks[index].id;
  const newCheck = !tasks[index].isCheck;

  createRequest('http://localhost:8000/updateTask', 'PATCH', true, text, newCheck, id);
}

const startEditItem = (index) => {
  itemEdit = index;
  
  render();
}

const finishEditItem = (index, text) => {
  itemEdit = null;

  const id = tasks[index].id;
  const check = tasks[index].isCheck;

  createRequest('http://localhost:8000/updateTask', 'PATCH', true, text, check, id);
}

const deleteItem = (index) => {
  const url = `http://localhost:8000/deleteTask?id=${tasks[index].id}`;

  createRequest(url, 'DELETE');
}

const createAndAppendNewElement = (parent, elem, elemClass) => {
  const newElement = document.createElement(elem);
  newElement.className = elemClass;
  parent.appendChild(newElement);

  return newElement;
}

const render = () => {
  contentPage.innerHTML = '';

  tasks.forEach( (item, index) => {
    const itemContainer = createAndAppendNewElement(contentPage, 'div', 'task-container');

    const checkbox = createAndAppendNewElement(itemContainer, 'input', 'task-checkbox');
    checkbox.type = 'checkbox';
    checkbox.checked = item.isCheck;
    checkbox.addEventListener('change', () => changeItemCheck(index));

    const text = createAndAppendNewElement(itemContainer, 'p', 'task-text');
    text.className = item.isCheck ? 'task-text task-text--done' : 'task-text';
    text.innerText = item.text;

    const editIcon = createAndAppendNewElement(itemContainer, 'img', 'task-image');
    editIcon.src = 'image/pencil.svg';
    editIcon.addEventListener('click', () => startEditItem(index));

    if (index === itemEdit) {
      text.parentNode.removeChild(text);
      editIcon.parentNode.removeChild(editIcon);

      const inputEdit = createAndAppendNewElement(itemContainer, 'input', 'task-input-edit');
      inputEdit.value = item.text;
      inputEdit.addEventListener('change', (e) => {
        item.text = e.target.value;
        finishEditItem(index, item.text);
      });

      const doneIcon = createAndAppendNewElement(itemContainer, 'img', 'task-image'); 
      doneIcon.src = 'image/tick.svg';
      doneIcon.addEventListener('click', () => finishEditItem(index, inputEdit.value));
    } 
    
    const deleteIcon = createAndAppendNewElement(itemContainer, 'img', 'task-image');
    deleteIcon.src = 'image/close.svg';
    deleteIcon.addEventListener('click', () => deleteItem(index));
  });
}

