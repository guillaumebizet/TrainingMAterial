async function saveQuestionsToGitHub() {
  if (questions.length === 0) {
    alert("Aucune question à sauvegarder.");
    return;
  }

  const token = sessionStorage.getItem('githubPAT');
  if (!token) {
    alert("Aucun PAT n'a été configuré dans l'interface d'accueil. Sauvegarde annulée.");
    return;
  }

  const repo = "a474881/training";
  const branch = "coding-main";
  const path = "questions.json";

  try {
    const response = await fetch(`https://sgithub.fr.world.socgen/api/v3/repos/${repo}/contents/${path}?ref=${branch}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    let sha = null;
    if (response.ok) {
      const data = await response.json();
      sha = data.sha;
    } else if (response.status !== 404) {
      throw new Error(`Erreur lors de la récupération du fichier : ${response.status} ${response.statusText}`);
    }

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(questions, null, 2))));
    const updateResponse = await fetch(`https://sgithub.fr.world.socgen/api/v3/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json"
      },
      body: JSON.stringify({
        message: "Mise à jour de questions.json via l'interface d'édition",
        content: content,
        sha: sha,
        branch: branch
      })
    });

    if (updateResponse.ok) {
      alert("Modifications sauvegardées avec succès !");
      await fetchQuestions();
    } else {
      const errorData = await updateResponse.json();
      throw new Error(`Erreur lors de la sauvegarde : ${updateResponse.status} ${updateResponse.statusText} - ${errorData.message}`);
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des questions :", error);
    alert("Erreur lors de la sauvegarde : " + error.message);
  }
}

async function saveScoresToGitHub(token) {
  const pat = token || sessionStorage.getItem('githubPAT');
  if (!pat) {
    console.log("Aucun PAT disponible, sauvegarde uniquement locale.");
    return;
  }

  const repo = "a474881/training";
  const branch = "coding-main";
  const path = "scores.json";

  try {
    let sha = null;
    const response = await fetch(`https://sgithub.fr.world.socgen/api/v3/repos/${repo}/contents/${path}?ref=${branch}`, {
      headers: {
        Authorization: `token ${pat}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      sha = data.sha;
    } else if (response.status !== 404) {
      throw new Error(`Erreur lors de la récupération du fichier scores.json : ${response.status} ${response.statusText}`);
    }

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(scores, null, 2))));
    const updateResponse = await fetch(`https://sgithub.fr.world.socgen/api/v3/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${pat}`,
        Accept: "application/vnd.github.v3+json"
      },
      body: JSON.stringify({
        message: "Mise à jour de scores.json via l'interface",
        content: content,
        sha: sha,
        branch: branch
      })
    });

    if (updateResponse.ok) {
      alert("Scores sauvegardés avec succès sur GitHub !");
    } else {
      const errorData = await updateResponse.json();
      throw new Error(`Erreur lors de la sauvegarde des scores : ${updateResponse.status} ${updateResponse.statusText} - ${errorData.message}`);
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des scores :", error);
    alert("Erreur lors de la sauvegarde des scores : " + error.message + ". Les scores seront stockés localement.");
    localStorage.setItem('scores', JSON.stringify(scores));
  }
}

async function fetchQuestions() {
  try {
    console.log("Tentative de chargement de questions.json...");
    const response = await fetch('questions.json');
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
    alert('Impossible de charger les questions. Vérifiez que questions.json est accessible. Détails : ' + error.message);
    questions = [];
  }
}

async function loadScores() {
  const repo = "a474881/training";
  const branch = "coding-main";
  const path = "scores.json";

  try {
    const response = await fetch(`https://sgithub.fr.world.socgen/api/v3/repos/${repo}/contents/${path}?ref=${branch}`, {
      headers: {
        Accept: "application/vnd.github.v3+json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      const content = atob(data.content);
      scores = JSON.parse(content);
    } else if (response.status === 404) {
      scores = [];
    } else {
      throw new Error(`Erreur lors du chargement des scores : ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des scores :", error);
    scores = JSON.parse(localStorage.getItem('scores')) || [];
  }

  const tbody = document.getElementById('scores-body');
  tbody.innerHTML = '';
  scores.forEach(score => {
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
      question: "Quelle est la capitale de la France ?",
      options: ["Paris", "Londres", "Berlin", "Madrid", "Rome"],
      correct: 0,
      lot: "GENERAL",
      type: "Choix simple"
    },
    {
      question: "Quel est le résultat de 2 + 2 ?",
      options: ["3", "4", "5", "6", "7"],
      correct: 1,
      lot: "GENERAL",
      type: "Choix simple"
    },
    {
      question: "Quel langage est principalement utilisé pour le web ?",
      options: ["Python", "Java", "JavaScript", "C++", "Ruby"],
      correct: 2,
      lot: "GENERAL",
      type: "Choix simple"
    },
    {
      question: "Quelle est la couleur du ciel par temps clair ?",
      options: ["Vert", "Rouge", "Bleu", "Jaune", "Noir"],
      correct: 2,
      lot: "GENERAL",
      type: "Choix simple"
    },
    {
      question: "Combien de planètes dans le système solaire ?",
      options: ["7", "8", "9", "10", "11"],
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

fetchQuestions();
