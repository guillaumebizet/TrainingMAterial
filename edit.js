let editingIndex = null;

function loadQuestionList() {
  const list = document.getElementById('question-list');
  list.innerHTML = '';
  questions.forEach((q, index) => {
    const div = document.createElement('div');
    div.className = 'question-item';
    div.innerHTML = `
      <div class="question-block">
        <h3>${q.question.fr} / ${q.question.us}</h3>
        <div class="options">
          ${q.type === 'Choix simple' ? renderRadioOptions(q.options.fr, q.options.us, q.correct) : renderCheckboxOptions(q.options.fr, q.options.us, q.correct)}
        </div>
        <p>Lot: ${q.lot} | Type: ${q.type}</p>
        <div class="actions">
          <button onclick="editQuestion(${index})">Modifier</button>
          <button onclick="deleteQuestion(${index})">Supprimer</button>
        </div>
      </div>
    `;
    list.appendChild(div);
  });
}

function renderRadioOptions(optionsFr, optionsUs, correct) {
  return optionsFr.map((option, i) => `
    <label>
      <input type="radio" name="option-${i}" ${i === parseInt(correct) ? 'checked' : ''} disabled>
      ${option} / ${optionsUs[i]}
    </label><br>
  `).join('');
}

function renderCheckboxOptions(optionsFr, optionsUs, correct) {
  const correctIndices = Array.isArray(correct) ? correct : [correct];
  return optionsFr.map((option, i) => `
    <label>
      <input type="checkbox" ${correctIndices.includes(i) ? 'checked' : ''} disabled>
      ${option} / ${optionsUs[i]}
    </label><br>
  `).join('');
}

function editQuestion(index) {
  editingIndex = index;
  const q = questions[index];
  const form = document.createElement('div');
  form.className = 'edit-form';
  form.innerHTML = `
    <h3>Modifier la question</h3>
    <div class="form-section">
      <h4>Question</h4>
      <label>Question (FR)</label>
      <input type="text" id="edit-question-fr" value="${q.question.fr}">
      <label>Question (US)</label>
      <input type="text" id="edit-question-us" value="${q.question.us}">
    </div>
    <div class="form-section">
      <h4>Options</h4>
      <div id="edit-options-list"></div>
      <button type="button" onclick="addOptionField()">Ajouter une option</button>
      <div id="options-preview" class="options-preview"></div>
    </div>
    <div class="form-section">
      <h4>Métadonnées</h4>
      <label>Lot</label>
      <input type="text" id="edit-lot" value="${q.lot}">
      <label>Type</label>
      <select id="edit-type" onchange="updateOptionsPreview()">
        <option value="Choix simple" ${q.type === 'Choix simple' ? 'selected' : ''}>Choix simple</option>
        <option value="QCM" ${q.type === 'QCM' ? 'selected' : ''}>QCM</option>
      </select>
      <label>Réponse correcte</label>
      <div id="edit-correct-container"></div>
    </div>
    <div class="form-actions">
      <button onclick="saveQuestion()">Sauvegarder</button>
      <button onclick="cancelEdit()">Annuler</button>
    </div>
  `;
  document.getElementById('question-list').prepend(form);
  populateOptionsFields(q.options.fr, q.options.us);
  updateOptionsPreview();
}

function populateOptionsFields(optionsFr, optionsUs) {
  const optionsList = document.getElementById('edit-options-list');
  optionsList.innerHTML = '';
  optionsFr.forEach((optionFr, i) => {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option-field';
    optionDiv.innerHTML = `
      <input type="text" class="option-fr" value="${optionFr}" placeholder="Option (FR)">
      <input type="text" class="option-us" value="${optionsUs[i]}" placeholder="Option (US)">
      <button type="button" onclick="removeOptionField(this)">Supprimer</button>
    `;
    optionsList.appendChild(optionDiv);
  });
}

function addOptionField() {
  const optionsList = document.getElementById('edit-options-list');
  const optionDiv = document.createElement('div');
  optionDiv.className = 'option-field';
  optionDiv.innerHTML = `
    <input type="text" class="option-fr" placeholder="Option (FR)">
    <input type="text" class="option-us" placeholder="Option (US)">
    <button type="button" onclick="removeOptionField(this)">Supprimer</button>
  `;
  optionsList.appendChild(optionDiv);
  updateOptionsPreview();
}

function removeOptionField(button) {
  button.parentElement.remove();
  updateOptionsPreview();
}

function updateOptionsPreview() {
  const optionsFr = Array.from(document.getElementsByClassName('option-fr')).map(input => input.value || '');
  const optionsUs = Array.from(document.getElementsByClassName('option-us')).map(input => input.value || '');
  const type = document.getElementById('edit-type').value;
  const preview = document.getElementById('options-preview');
  preview.innerHTML = type === 'Choix simple' ? renderRadioOptionsPreview(optionsFr, optionsUs) : renderCheckboxOptionsPreview(optionsFr, optionsUs);
  updateCorrectField(type, optionsFr.length);
}

function renderRadioOptionsPreview(optionsFr, optionsUs) {
  return optionsFr.map((option, i) => `
    <label>
      <input type="radio" name="preview-option" disabled>
      ${option} / ${optionsUs[i]}
    </label><br>
  `).join('');
}

function renderCheckboxOptionsPreview(optionsFr, optionsUs) {
  return optionsFr.map((option, i) => `
    <label>
      <input type="checkbox" disabled>
      ${option} / ${optionsUs[i]}
    </label><br>
  `).join('');
}

function updateCorrectField(type, optionCount) {
  const container = document.getElementById('edit-correct-container');
  const currentCorrect = questions[editingIndex].correct;
  if (type === 'Choix simple') {
    container.innerHTML = `
      <select id="edit-correct">
        ${Array.from({ length: optionCount }, (_, i) => `
          <option value="${i}" ${i === parseInt(currentCorrect) ? 'selected' : ''}>Option ${i + 1}</option>
        `).join('')}
      </select>
    `;
  } else {
    container.innerHTML = `
      <div id="edit-correct-checkboxes">
        ${Array.from({ length: optionCount }, (_, i) => `
          <label>
            <input type="checkbox" class="correct-checkbox" value="${i}" ${Array.isArray(currentCorrect) && currentCorrect.includes(i) ? 'checked' : ''}>
            Option ${i + 1}
          </label>
        `).join('')}
      </div>
    `;
  }
}

function saveQuestion() {
  const q = questions[editingIndex];
  q.question.fr = document.getElementById('edit-question-fr').value;
  q.question.us = document.getElementById('edit-question-us').value;
  q.options.fr = Array.from(document.getElementsByClassName('option-fr')).map(input => input.value || '');
  q.options.us = Array.from(document.getElementsByClassName('option-us')).map(input => input.value || '');
  q.lot = document.getElementById('edit-lot').value;
  q.type = document.getElementById('edit-type').value;

  if (q.type === 'Choix simple') {
    q.correct = parseInt(document.getElementById('edit-correct').value);
  } else {
    q.correct = Array.from(document.getElementsByClassName('correct-checkbox'))
      .filter(checkbox => checkbox.checked)
      .map(checkbox => parseInt(checkbox.value));
  }

  editingIndex = null;
  loadQuestionList();
}

function cancelEdit() {
  editingIndex = null;
  loadQuestionList();
}

function deleteQuestion(index) {
  questions.splice(index, 1);
  loadQuestionList();
}

function addNewQuestion() {
  questions.push({
    question: { "fr": "", "us": "" },
    options: { "fr": [""], "us": [""] },
    correct: 0,
    lot: "GENERAL",
    type: "Choix simple"
  });
  loadQuestionList();
}

function filterQuestionsByLot() {
  const filter = document.getElementById('lot-filter').value;
  const filtered = filter ? questions.filter(q => q.lot === filter) : questions;
  const list = document.getElementById('question-list');
  list.innerHTML = '';
  filtered.forEach((q, index) => {
    const div = document.createElement('div');
    div.className = 'question-item';
    div.innerHTML = `
      <div class="question-block">
        <h3>${q.question.fr} / ${q.question.us}</h3>
        <div class="options">
          ${q.type === 'Choix simple' ? renderRadioOptions(q.options.fr, q.options.us, q.correct) : renderCheckboxOptions(q.options.fr, q.options.us, q.correct)}
        </div>
        <p>Lot: ${q.lot} | Type: ${q.type}</p>
        <div class="actions">
          <button onclick="editQuestion(${index})">Modifier</button>
          <button onclick="deleteQuestion(${index})">Supprimer</button>
        </div>
      </div>
    `;
    list.appendChild(div);
  });
}

loadQuestionList();
