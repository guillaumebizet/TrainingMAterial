// Constantes globales pour le dépôt
/*const GITHUB_CONFIG = {
  repo: "a474881/training",
  branch: "coding-main",
  questionsPath: "questions.json",
  scoresPath: "scores.json",
  apiBaseUrl: "https://sgithub.fr.world.socgen/api/v3/repos"
};*/

const GITHUB_CONFIG = {
  repo: "guillaumebizet/TrainingMAterial",
  branch: "priv",
  questionsPath: "questions.json",
  scoresPath: "scores.json",
  apiBaseUrl: "https://api.github.com/repos"
};

function showModal(message, details = null) {
  const modal = document.getElementById('github-modal');
  const modalMessage = document.getElementById('modal-message');
  const closeBtn = document.getElementById('modal-close-btn');

  modalMessage.innerHTML = details ? `${translations[currentLang]?.[message] || message}<pre style="margin-top: 10px; text-align: left; max-height: 200px; overflow-y: auto;">${JSON.stringify(details, null, 2)}</pre>` : (translations[currentLang]?.[message] || message);
  modal.style.display = 'flex';

  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };
}

function showNotification(message) {
  const banner = document.getElementById('notification-banner');
  const messageSpan = document.getElementById('notification-message');
  messageSpan.textContent = translations[currentLang]?.[message] || message;
  banner.style.display = 'block';
  setTimeout(() => {
    banner.style.display = 'none';
  }, 60000);
}

function loadLotSelection() {
  const lots = [...new Set(questions.map(q => q.lot).filter(Boolean))];
  const select = document.getElementById('lot-selection');
  if (!select) {
    console.error("Élément '#lot-selection' non trouvé dans le DOM.");
    return;
  }
  const chooseLotText = translations[currentLang]?.['choose_lot'] || 'Choose a lot';
  select.innerHTML = `<option value="">${chooseLotText}</option>`;
  lots.forEach(lot => {
    const option = document.createElement('option');
    option.value = lot;
    option.textContent = lot;
    select.appendChild(option);
  });
}

async function saveQuestionsToGitHub() {
  if (questions.length === 0) {
    showModal("no_questions_to_save");
    return;
  }

  const token = sessionStorage.getItem('githubPAT');
  if (!token) {
    showModal("no_pat");
    return;
  }

  try {
    console.log("Tentative de sauvegarde de questions.json...");
    const response = await fetch(`${GITHUB_CONFIG.apiBaseUrl}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.questionsPath}?ref=${GITHUB_CONFIG.branch}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    let sha = null;
    if (response.ok) {
      const data = await response.json();
      sha = data.sha;
      console.log("SHA actuel de questions.json :", sha);
    } else if (response.status !== 404) {
      throw new Error(`Erreur lors de la récupération du fichier : ${response.status} ${response.statusText}`);
    } else {
      console.log("questions.json n'existe pas encore, création d'un nouveau fichier.");
    }

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(questions, null, 2))));
    console.log("Contenu envoyé pour questions.json :", JSON.stringify(questions, null, 2));
    const updateResponse = await fetch(`${GITHUB_CONFIG.apiBaseUrl}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.questionsPath}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json"
      },
      body: JSON.stringify({
        message: "Mise à jour de questions.json via l'interface d'édition",
        content: content,
        sha: sha,
        branch: GITHUB_CONFIG.branch
      })
    });

    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log("Réponse de l'API pour questions.json :", updateData);
      await fetchQuestions();
    } else {
      const errorData = await updateResponse.json();
      throw new Error(`Erreur lors de la sauvegarde : ${updateResponse.status} ${updateResponse.statusText} - ${errorData.message}`);
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des questions :", error);
    showModal("questions_error" + error.message);
  }
}

async function saveScoresToGitHub(token) {
  const pat = token || sessionStorage.getItem('githubPAT');
  if (!pat) {
    console.log("Aucun PAT disponible, sauvegarde uniquement locale.");
    return;
  }

  try {
    console.log("Tentative de sauvegarde de scores.json...");
    console.log("Scores actuels avant sauvegarde :", scores);
    let sha = null;
    const response = await fetch(`${GITHUB_CONFIG.apiBaseUrl}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.scoresPath}?ref=${GITHUB_CONFIG.branch}`, {
      headers: {
        Authorization: `token ${pat}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      sha = data.sha;
      console.log("SHA actuel de scores.json :", sha);
    } else if (response.status !== 404) {
      throw new Error(`Erreur lors de la récupération du fichier scores.json : ${response.status} ${response.statusText}`);
    } else {
      console.log("scores.json n'existe pas encore, création d'un nouveau fichier.");
    }

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(scores, null, 2))));
    console.log("Contenu envoyé pour scores.json :", JSON.stringify(scores, null, 2));
    const updateResponse = await fetch(`${GITHUB_CONFIG.apiBaseUrl}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.scoresPath}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${pat}`,
        Accept: "application/vnd.github.v3+json"
      },
      body: JSON.stringify({
        message: "Mise à jour de scores.json via l'interface",
        content: content,
        sha: sha,
        branch: GITHUB_CONFIG.branch
      })
    });

    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log("Réponse de l'API pour scores.json :", updateData);
      showModal("scores_saved", scores);
      showNotification("notification_scores");
      await loadScores();
    } else {
      const errorData = await updateResponse.json();
      console.error("Erreur détaillée de l'API :", errorData);
      throw new Error(`Erreur lors de la sauvegarde des scores : ${updateResponse.status} ${updateResponse.statusText} - ${errorData.message}`);
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des scores :", error);
    showModal("scores_error" + error.message + " " + translations[currentLang]?.["scores_local"]);
    localStorage.setItem('scores', JSON.stringify(scores));
  }
}

async function fetchQuestions() {
  try {
    console.log("Tentative de chargement de questions.json...");
    const response = await fetch(GITHUB_CONFIG.questionsPath);
    if (!response.ok) {
      throw new Error(`Erreur lors du chargement de questions.json : ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    console.log("Contenu brut de questions.json :", text);
    try {
      questions = JSON.parse(text);
    } catch (parseError) {
      throw new Error(`Erreur lors du parsing de questions.json : ${parseError.message}. Contenu reçu : ${text.substring(0, 100)}...`);
    }
    console.log('Questions chargées avec succès :', questions);
    generateAdditionalQuestions();
    loadLotSelection();
  } catch (error) {
    console.error('Erreur lors du chargement des questions:', error);
    showModal('questions_load_error' + error.message);
    questions = [];
  }
}

async function loadScores() {
  try {
    console.log("Tentative de chargement de scores.json...");
    const response = await fetch(GITHUB_CONFIG.scoresPath);
    if (!response.ok) {
      if (response.status === 404) {
        console.log("scores.json non trouvé, initialisation à un tableau vide.");
        scores = [];
      } else {
        throw new Error(`Erreur lors du chargement de scores.json : ${response.status} ${response.statusText}`);
      }
    } else {
      const text = await response.text();
      console.log("Contenu brut de scores.json :", text);
      try {
        scores = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Erreur lors du parsing de scores.json : ${parseError.message}. Contenu reçu : ${text.substring(0, 100)}...`);
      }
      console.log('Scores chargés avec succès :', scores);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des scores:', error);
    try {
      const localScores = localStorage.getItem('scores');
      scores = localScores ? JSON.parse(localScores) : [];
      console.log("Scores chargés depuis localStorage :", scores);
    } catch (localError) {
      console.error("Erreur lors du chargement des scores depuis localStorage :", localError);
      scores = [];
    }
  }

  const tbody = document.getElementById('scores-body');
  if (!tbody) {
    console.error("Élément '#scores-body' non trouvé dans le DOM.");
    return;
  }
  tbody.innerHTML = '';
  scores.forEach(score => {
    console.log("Ajout d'une ligne pour le score :", score);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${score.name}</td>
      <td>${score.date}</td>
      <td>${score.score}</td>
      <td>${score.time}</td>
      <td>${score.lot || 'Non spécifié'}</td>
    `;
    tbody.appendChild(row);
  });
}

function generateAdditionalQuestions() {
  const additionalQuestions = [
    {
      question: {"fr": "Quelle est la capitale de la France ?", "us": "What is the capital of France?"},
      options: {
        "fr": ["Paris", "Londres", "Berlin", "Madrid", "Rome"],
        "us": ["Paris", "London", "Berlin", "Madrid", "Rome"]
      },
      correct: 0,
      lot: "GENERAL",
      type: "Choix simple"
    },
    {
      question: {"fr": "Quel est le résultat de 2 + 2 ?", "us": "What is the result of 2 + 2?"},
      options: {
        "fr": ["3", "4", "5", "6", "7"],
        "us": ["3", "4", "5", "6", "7"]
      },
      correct: 1,
      lot: "GENERAL",
      type: "Choix simple"
    }
  ];
  questions.push(...additionalQuestions);
}

// Initialisation
const currentDateElement = document.getElementById('current-date');
if (currentDateElement) {
  currentDateElement.textContent = new Date().toLocaleDateString('fr-FR');
} else {
  console.error("Élément 'current-date' non trouvé.");
}

// Les appels fetchQuestions() et loadScores() sont déplacés dans quiz-core.js
