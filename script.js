let functions = { main: [] };
let currentFunction = 'main';

function updateFunctionSelect() {
  const select = document.getElementById('functionSelect');
  select.innerHTML = '';
  for (const name in functions) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    if (name === currentFunction) option.selected = true;
    select.appendChild(option);
  }
}

window.onload = updateFunctionSelect

function createFunction() {
  const name = document.getElementById('newFunctionName').value.trim();
  if (name && !functions[name]) {
    saveCurrentWorkspace();
    functions[name] = [];
    currentFunction = name;
    loadWorkspace();
    updateFunctionSelect();
  }
}

document.getElementById('functionSelect').addEventListener('change', (e) => {
  saveCurrentWorkspace();
  currentFunction = e.target.value;
  loadWorkspace();
});

document.getElementById('deleteFunctionBtn').addEventListener('click', () => {
  if (currentFunction !== 'main') {
    delete functions[currentFunction];
    currentFunction = 'main';
    updateFunctionSelect();
    loadWorkspace();
  }
});

function saveCurrentWorkspace() {
  const workspace = document.getElementById('workspace');
  const blocks = Array.from(workspace.children);
  functions[currentFunction] = blocks.map(block => {
    const inputs = block.querySelectorAll('input, select');
    const inputValues = Array.from(inputs).map(input => input.value);
    return {
      html: block.outerHTML,
      values: inputValues
    };
  });
}

function loadWorkspace() {
  const workspace = document.getElementById('workspace');
  workspace.innerHTML = '';
  (functions[currentFunction] || []).forEach(({ html, values }) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const block = div.firstChild;
    if (!block) return;
    const inputs = block.querySelectorAll('input, select');
    inputs.forEach((input, index) => {
      input.value = values[index] || '';
    });
    addBlockListeners(block);
    workspace.appendChild(block);
  });
}

function createBlock(content) {
  const block = document.createElement('div');
  block.className = 'block';
  block.innerHTML = content;
  addBlockListeners(block);
  document.getElementById('workspace').appendChild(block);
}

function addBlockListeners(block) {
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-btn';
  removeBtn.textContent = '✕';
  removeBtn.onclick = () => block.remove();
  block.appendChild(removeBtn);

  block.draggable = true;
  block.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', '');
    block.classList.add('dragging');
  });
  block.addEventListener('dragend', () => {
    block.classList.remove('dragging');
  });

  block.addEventListener('dragover', (e) => e.preventDefault());
  block.addEventListener('drop', (e) => {
    e.preventDefault();
    const dragging = document.querySelector('.dragging');
    if (dragging && dragging !== block) {
      const workspace = document.getElementById('workspace');
      workspace.insertBefore(dragging, block);
    }
  });
}

function addSayBlock() {
  createBlock('<label>Текст:</label><input type="text" placeholder="Привет, мир!">');
}

function addTeleportBlock() {
  createBlock('<label>Координаты:</label><input type="text" placeholder="x y z">');
}

function addSummonBlock() {
  const mobs = [
    'minecraft:zombie', 'minecraft:skeleton', 'minecraft:creeper',
    'minecraft:spider', 'minecraft:enderman', 'minecraft:villager'
  ];
  const mobSelect = `<label>Моб:</label><select>${mobs.map(m => `<option value="${m}">${m}</option>`).join('')}</select>`;
  const coords = '<label>Координаты:</label><input type="text" placeholder="~ ~ ~">';
  createBlock(mobSelect + coords);
}

function addDelayBlock() {
  createBlock('<label>Задержка (в тиках):</label><input type="number" placeholder="20">');
}

function addCallFunctionBlock() {
  const select = document.createElement('select');
  for (const name in functions) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  }
  const wrapper = document.createElement('div');
  wrapper.innerHTML = '<label>Вызов функции:</label>';
  wrapper.appendChild(select);
  const div = document.createElement('div');
  div.appendChild(wrapper);
  createBlock(div.innerHTML);
}

function addConditionBlock() {
  createBlock('<label>Если игрок на координатах:</label><input type="text" placeholder="x y z">');
}

function addKillBlock() {
  const block = document.createElement('div');
  block.classList.add('block');

  block.innerHTML = `
    <label>Убить:</label>
    <select id="targetSelect">
      <option value="@a">@a (Все игроки)</option>
      <option value="@p">@p (Ближайший игрок)</option>
      <option value="@r">@r (Случайный игрок)</option>
      <option value="@e">@e (Все сущности)</option>
    </select>
    <select id="entitySelect" style="display:none; margin-left:10px;">
      <option value="zombie">Zombie</option>
      <option value="skeleton">Skeleton</option>
      <option value="creeper">Creeper</option>
      <option value="cow">Cow</option>
      <option value="pig">Pig</option>
      <!-- Добавь нужные сущности -->
    </select>
  `;

  const targetSelect = block.querySelector('#targetSelect');
  const entitySelect = block.querySelector('#entitySelect');

  targetSelect.addEventListener('change', () => {
    if (targetSelect.value === '@e') {
      entitySelect.style.display = 'inline-block';
    } else {
      entitySelect.style.display = 'none';
    }
  });

  document.getElementById('workspace').appendChild(block);
}



function addExecuteBlock() {
  const structure = `
    <label>Execute:</label>
    <select>
      <option value="if">if</option>
      <option value="unless">unless</option>
    </select>
    <input type="text" placeholder="entity @p, block ~ ~-1 ~ minecraft:stone и т.п.">
    <select>
      <option value="run">run</option>
    </select>
    <input type="text" placeholder="say Hello или другая команда">
  `;
  createBlock(structure);
}

function addKillListBlock() {
  createBlock('<label>Список целей (через запятую):</label><input type="text" placeholder="@e[type=zombie],@e[type=skeleton]">');
}

function addBlockButtons() {
  const toolbox = document.querySelector('.toolbox');

  const killButton = document.createElement('button');
  killButton.textContent = 'Убить';
  killButton.onclick = addKillBlock;
  toolbox.appendChild(killButton);

  const killListButton = document.createElement('button');
  killListButton.textContent = 'Убить список';
  killListButton.onclick = addKillListBlock;
  toolbox.appendChild(killListButton);

  const executeButton = document.createElement('button');
  executeButton.textContent = 'Execute';
  executeButton.onclick = addExecuteBlock;
  toolbox.appendChild(executeButton);
}

window.addEventListener('DOMContentLoaded', addBlockButtons);


function addCommandBlock() {
  createBlock('<label>Пользовательская команда:</label><input type="text" placeholder="say Привет">');
}

function downloadDatapack() {
  saveCurrentWorkspace();
  const zip = new JSZip();
  const namespace = "custom";
  const datapack = zip.folder("data").folder(namespace).folder("functions");

  const mcmeta = {
    pack: {
      pack_format: 26,
      description: "Generated by Minecraft Datapack Builder"
    }
  };
  zip.file("pack.mcmeta", JSON.stringify(mcmeta, null, 2));

  for (const name in functions) {
    const lines = [];
    const htmlList = functions[name];
    let delayedLines = [];
    let hasDelay = false;

  htmlList.forEach(({ html, values }) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const block = div.firstChild;
    if (!block) return;
    const label = block.querySelector('label')?.textContent || '';
    const inputs = block.querySelectorAll('input, select');
    inputs.forEach((input, index) => input.value = values[index] || '');

    if (label.includes("Убить")) {
      let target = inputs[0].value;
      if (target === '@e' && inputs.length > 1 && inputs[1].value) {
        target += `[type=${inputs[1].value}]`;
      }
      (hasDelay ? delayedLines : lines).push(`kill ${target}`);
    } else if (label.includes("Текст")) {
      (hasDelay ? delayedLines : lines).push(`say ${inputs[0].value}`);
    } else if (label.includes("Координаты:") && inputs.length === 1) {
      (hasDelay ? delayedLines : lines).push(`tp @p ${inputs[0].value}`);
    } else if (label.includes("Моб")) {
      (hasDelay ? delayedLines : lines).push(`summon ${inputs[0].value} ${inputs[1].value}`);
    } else if (label.includes("Задержка")) {
      const delayTicks = parseInt(inputs[0].value) || 0;
      hasDelay = true;
      lines.push(`schedule function ${namespace}:${name}_delayed ${delayTicks}t`);
    } else if (label.includes("Вызов функции")) {
      (hasDelay ? delayedLines : lines).push(`function ${namespace}:${inputs[0].value}`);
    } else if (label.includes("Если игрок")) {
      (hasDelay ? delayedLines : lines).push(`execute if entity @a[x=${inputs[0].value}] run say Игрок найден`);
    } else if (label.includes("Пользовательская")) {
      (hasDelay ? delayedLines : lines).push(inputs[0].value);
    }
  });

    datapack.file(`${name}.mcfunction`, lines.join("\n"));
    if (hasDelay && delayedLines.length > 0) {
      datapack.file(`${name}_delayed.mcfunction`, delayedLines.join("\n"));
    }
  }

  zip.generateAsync({ type: "blob" }).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", "datapack.zip");
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1000);
  });
}
