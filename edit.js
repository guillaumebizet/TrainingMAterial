let editingIndex = null;
let modifiedQuestionsIndices = new Set();
let deletedQuestions = []; // Pour suivre les questions supprimées
let isFilterEventAttached = false;

// Charger la liste des questions
function loadQuestionList() {
  const list = document.getElementById('question-list');
  list.innerHTML = '';
  if (!questions || questions.length === 0) {
    list.innerHTML = '<p>Aucune question disponible pour le moment.</p>';
    return;
  }

  const filter = document.getElementById('lot-filter')?.value || '';
  const filteredQuestions = filter ? questions.filter(q => q.lot === filter) : questions;

  console.log("Filtre appliqué :", filter, "| Questions filtrées :", filteredQuestions.length, filteredQuestions);

  filteredQuestions.forEach((q, index) => {
    if (!q.question || !q.question.fr || !q.question.us) {
      console.error("Question mal formée à l'index", index, q);
      return;
    }
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

  updatePendingChangesSidebar(); // Mettre à jour le volet latéral après chaque changement
}

// Rendre les options pour les questions à choix simple
function renderRadioOptions(optionsFr, optionsUs, correct) {
  return optionsFr.map((option, i) => `
    <label>
      <input type="radio" name="option-${i}" ${i === parseInt(correct) ? 'checked' : ''} disabled>
      ${option} / ${optionsUs[i]}
    </label><br>
  `).join('');
}

// Rendre les options pour les QCM
function renderCheckboxOptions(optionsFr, optionsUs, correct) {
  const correctIndices = Array.isArray(correct) ? correct : [correct];
  return optionsFr.map((option, i) => `
    <label>
      <input type="checkbox" ${correctIndices.includes(i) ? 'checked' : ''} disabled>
      ${option} / ${optionsUs[i]}
    </label><br>
  `).join('');
}

// Éditer une question
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
    </div>
    <div class="form-actions">
      <button type="button" onclick="showPreviewModal()">Aperçu</button>
      <button onclick="saveQuestionLocally()">Sauvegarder</button>
      <button onclick="cancelEdit()">Annuler</button>
    </div>
  `;
  document.getElementById('question-list').prepend(form);
  populateOptionsFields(q.options.fr, q.options.us);
  updateOptionsPreview();
}

// Remplir les champs d'options dans le formulaire d'édition
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

// Ajouter un champ d'option
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

// Supprimer un champ d'option
function removeOptionField(button) {
  button.parentElement.remove();
  updateOptionsPreview();
}

// Mettre à jour l'aperçu des options
function updateOptionsPreview() {
  const optionsFr = Array.from(document.getElementsByClassName('option-fr')).map(input => input.value || '');
  const optionsUs = Array.from(document.getElementsByClassName('option-us')).map(input => input.value || '');
  const type = document.getElementById('edit-type').value;
  const preview = document.getElementById('options-preview');
  preview.innerHTML = type === 'Choix simple' ? renderRadioOptionsPreview(optionsFr, optionsUs) : renderCheckboxOptionsPreview(optionsFr, optionsUs);
}

// Rendre l'aperçu pour les options à choix simple
function renderRadioOptionsPreview(optionsFr, optionsUs) {
  const currentCorrect = questions[editingIndex].correct;
  return optionsFr.map((option, i) => `
    <label>
      <input type="radio" name="preview-option" value="${i}" ${i === parseInt(currentCorrect) ? 'checked' : ''} onchange="updateCorrect(this)">
      ${option} / ${optionsUs[i]}
    </label><br>
  `).join('');
}

// Rendre l'aperçu pour les QCM
function renderCheckboxOptionsPreview(optionsFr, optionsUs) {
  const currentCorrect = Array.isArray(questions[editingIndex].correct) ? questions[editingIndex].correct : [questions[editingIndex].correct];
  return optionsFr.map((option, i) => `
    <label>
      <input type="checkbox" value="${i}" ${currentCorrect.includes(i) ? 'checked' : ''} onchange="updateCorrect(this)">
      ${option} / ${optionsUs[i]}
    </label><br>
  `).join('');
}

// Mettre à jour la réponse correcte dans l'aperçu
function updateCorrect(input) {
  const type = document.getElementById('edit-type').value;
  if (type === 'Choix simple') {
    questions[editingIndex].correct = parseInt(input.value);
  } else {
    const checkboxes = document.querySelectorAll('#options-preview input[type="checkbox"]:checked');
    questions[editingIndex].correct = Array.from(checkboxes).map(checkbox => parseInt(checkbox.value));
  }
}

// Afficher un aperçu de la question dans une modale
function showPreviewModal() {
  const questionFr = document.getElementById('edit-question-fr').value;
  const questionUs = document.getElementById('edit-question-us').value;
  const optionsFr = Array.from(document.getElementsByClassName('option-fr')).map(input => input.value || '');
  const optionsUs = Array.from(document.getElementsByClassName('option-us')).map(input => input.value || '');
  const lot = document.getElementById('edit-lot').value;
  const type = document.getElementById('edit-type').value;
  const correct = questions[editingIndex].correct;

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span id="modal-message">
        <h3>Aperçu de la question</h3>
        <p><strong>Question (FR):</strong> ${questionFr}</p>
        <p><strong>Question (US):</strong> ${questionUs}</p>
        <h4>Options:</h4>
        ${optionsFr.map((option, i) => `
          <p>${i + 1}. ${option} / ${optionsUs[i]} ${type === 'Choix simple' ? (i === parseInt(correct) ? '(Correct)' : '') : (Array.isArray(correct) && correct.includes(i) ? '(Correct)' : '')}</p>
        `).join('')}
        <p><strong>Lot:</strong> ${lot}</p>
        <p><strong>Type:</strong> ${type}</p>
      </span>
      <button id="modal-close-btn" onclick="this.parentElement.parentElement.remove()">Fermer</button>
    </div>
  `;
  document.body.appendChild(modal);
}

// Afficher une notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `<p>${message}</p>`;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 5000);
}

// Sauvegarder les modifications localement
function saveQuestionLocally() {
  const q = questions[editingIndex];
  q.question.fr = document.getElementById('edit-question-fr').value;
  q.question.us = document.getElementById('edit-question-us').value;
  q.options.fr = Array.from(document.getElementsByClassName('option-fr')).map(input => input.value || '');
  q.options.us = Array.from(document.getElementsByClassName('option-us')).map(input => input.value || '');
  q.lot = document.getElementById('edit-lot').value;
  q.type = document.getElementById('edit-type').value;

  modifiedQuestionsIndices.add(editingIndex);
  editingIndex = null;

  showNotification("Modifications sauvegardées localement !");
  loadQuestionList(); // Rafraîchir la liste
}

// Annuler l'édition
function cancelEdit() {
  editingIndex = null;
  loadQuestionList();
}

// Supprimer une question
function deleteQuestion(index) {
  const deletedQuestion = { ...questions[index], index }; // Sauvegarder la question supprimée
  deletedQuestions.push(deletedQuestion); // Ajouter à la liste des suppressions
  questions.splice(index, 1);
  modifiedQuestionsIndices.delete(index);
  const newIndices = new Set();
  modifiedQuestionsIndices.forEach(i => {
    if (i > index) newIndices.add(i - 1);
    else if (i < index) newIndices.add(i);
  });
  modifiedQuestionsIndices = newIndices;

  showNotification("Question supprimée localement !");
  loadQuestionList(); // Rafraîchir la liste
}

// Ajouter une nouvelle question
function addNewQuestion() {
  const newQuestionIndex = questions.length;
  questions.push({
    question: { "fr": "", "us": "" },
    options: { "fr": [""], "us": [""] },
    correct: 0,
    lot: "GENERAL",
    type: "Choix simple"
  });
  modifiedQuestionsIndices.add(newQuestionIndex);
  showNotification("Nouvelle question ajoutée localement !");
  loadQuestionList();
}

// Filtrer les questions par lot
function filterQuestionsByLot() {
  console.log("filterQuestionsByLot appelé");
  loadQuestionList();
}

// Mettre à jour le volet latéral des modifications en attente
function updatePendingChangesSidebar() {
  const sidebar = document.getElementById('pending-changes-sidebar');
  const changesList = document.getElementById('pending-changes-list');
  changesList.innerHTML = '';

  // Lister les questions modifiées
  modifiedQuestionsIndices.forEach(index => {
    const q = questions[index];
    const li = document.createElement('li');
    li.className = 'pending-change-item modified';
    li.textContent = `Modifiée : ${q.question.fr || 'Question sans titre'} / ${q.question.us || 'Question sans titre'}`;
    changesList.appendChild(li);
  });

  // Lister les questions supprimées
  deletedQuestions.forEach(deleted => {
    const li = document.createElement('li');
    li.className = 'pending-change-item deleted';
    li.textContent = `Supprimée : ${deleted.question.fr || 'Question sans titre'} / ${deleted.question.us || 'Question sans titre'}`;
    changesList.appendChild(li);
  });

  // Afficher ou masquer le bouton "Commit All Changes"
  const commitButton = document.getElementById('commit-all-changes-btn');
  if (modifiedQuestionsIndices.size > 0 || deletedQuestions.length > 0) {
    sidebar.style.display = 'block';
    commitButton.style.display = 'block';
  } else {
    sidebar.style.display = 'none';
    commitButton.style.display = 'none';
  }
}

// Commettre toutes les modifications sur GitHub
function commitAllChanges() {
  if (modifiedQuestionsIndices.size === 0 && deletedQuestions.length === 0) {
    showNotification("Aucune modification à committer.");
    return;
  }

  saveQuestionsToGitHub().then(() => {
    showNotification("Modifications committées sur GitHub avec succès !");
    modifiedQuestionsIndices.clear();
    deletedQuestions = [];
    updatePendingChangesSidebar();
    loadQuestionList();
  }).catch(error => {
    console.error("Erreur lors du commit :", error);
    showNotification("Erreur lors du commit sur GitHub.");
  });
}

// Attacher l’événement au filtre quand l'onglet est affiché
function attachFilterEvent() {
  if (isFilterEventAttached) {
    console.log("Événement 'change' déjà attaché à #lot-filter.");
    return;
  }

  const lotFilter = document.getElementById('lot-filter');
  if (lotFilter) {
    console.log("Élément #lot-filter trouvé, attachement de l'événement...");
    lotFilter.addEventListener('change', () => {
      console.log("Changement de filtre détecté :", lotFilter.value);
      filterQuestionsByLot();
    });
    console.log("Événement 'change' attaché au filtre de lot.");
    isFilterEventAttached = true;
  } else {
    console.error("Élément '#lot-filter' non trouvé dans le DOM.");
  }
}

// Surcharger showTab pour attacher l'événement quand l'onglet "Éditer Questions" est affiché
const originalShowTab = showTab;
showTab = function(tabId) {
  originalShowTab(tabId);
  if (tabId === 'edit-container') {
    console.log("Onglet 'Éditer Questions' affiché, tentative d'attachement de l'événement...");
    attachFilterEvent();
    loadQuestionList();
  }
};

// Attacher l’événement au chargement initial
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM chargé, vérification initiale de l'onglet...");
  if (document.getElementById('edit-container').style.display !== 'none') {
    attachFilterEvent();
  }
});
