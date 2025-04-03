// Configurations statiques
const env = "github.com"; // Changez à "socgen" pour GitHub Enterprise SocGen

const githubConfig = env === "socgen" ? {
  apiUrl: "https://sgithub.fr.world.socgen/api/v3",
  authUrl: "https://sgithub.fr.world.socgen/login/oauth/authorize",
  tokenUrl: "https://sgithub.fr.world.socgen/login/oauth/access_token",
  clientId: "VOTRE_CLIENT_ID_SOCGEN",
  redirectUri: "URL_DE_REDIRECTION_SOCGEN",
  repo: "a474881/training",
  branch: "coding-main",
  questionsPath: "questions.json",
  scoresPath: "scores.json",
  scope: "repo",
  org: "a474881", // Organisation SocGen
  team: "QuizEditors" // Équipe SocGen
} : {
  apiUrl: "https://api.github.com",
  authUrl: "https://github.com/login/oauth/authorize",
  tokenUrl: "https://github.com/login/oauth/access_token",
  clientId: "Ov23liQj7MXBgBOqNVAE",
  redirectUri: "https://guillaumebizet.github.io/TrainingMATERIAL/",
  repo: "guillaumebizet/TrainingMATERIAL",
  branch: "main",
  questionsPath: "questions.json",
  scoresPath: "scores.json",
  scope: "repo",
  org: "guillaumebizet", // Organisation GitHub public (votre compte)
  team: "QuizEditors" // Équipe fictive pour GitHub public (à ajuster selon vos besoins)
};

// Fonctions pour le flux OAuth
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64urlencode(String.fromCharCode.apply(null, array));
}

function generateCodeChallenge(codeVerifier) {
  return base64urlencode(sha256(codeVerifier));
}

function base64urlencode(str) {
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sha256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return String.fromCharCode(...new Uint8Array(hash));
}

function loginWithGitHub() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = "oauth_redirect_" + Date.now(); // Ajout d'un state unique

  localStorage.setItem("code_verifier", codeVerifier);
  localStorage.setItem("oauth_state", state); // Stocker le state pour vérification

  // Ajouter un fragment d'URL pour que GitHub Pages serve index.html
  const redirectUriWithHash = `${githubConfig.redirectUri}#oauth_callback`;
  const authUrl = `${githubConfig.authUrl}?client_id=${githubConfig.clientId}&redirect_uri=${redirectUriWithHash}&scope=${githubConfig.scope}&response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}`;
  window.location.href = authUrl;
}

function logout() {
  localStorage.removeItem("github_access_token");
  localStorage.removeItem("oauth_state"); // Nettoyer le state
  window.location.reload();
}

function isAuthenticated() {
  const token = localStorage.getItem("github_access_token");
  return !!token;
}

function updateAuthStatus() {
  const authStatus = document.getElementById("auth-status");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");

  if (isAuthenticated()) {
    authStatus.textContent = "Connecté";
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    authStatus.textContent = "Non connecté";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}

// Exécuter updateAuthStatus et fetchQuestions après le chargement
document.addEventListener("DOMContentLoaded", () => {
  updateAuthStatus();
  fetchQuestions(); // Charger les questions au démarrage pour remplir la liste des lots
});

async function checkTeamMembership() {
  const token = localStorage.getItem("github_access_token");
  if (!token) return false;

  try {
    const userResponse = await fetch(`${githubConfig.apiUrl}/user`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json"
      }
    });
    if (!userResponse.ok) return false;
    const userData = await userResponse.json();
    const username = userData.login;

    const teamResponse = await fetch(`${githubConfig.apiUrl}/orgs/${githubConfig.org}/teams/${githubConfig.team}/memberships/${username}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    return teamResponse.ok;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'appartenance à l'équipe :", error);
    return false;
  }
}

async function checkUserPermissions() {
  const token = localStorage.getItem("github_access_token");
  if (!token) return false;

  const permissionResponse = await fetch(`${githubConfig.apiUrl}/repos/${githubConfig.repo}/collaborators/permission`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json"
    }
  });

  let hasRepoPermission = false;
  if (permissionResponse.ok) {
    const data = await permissionResponse.json();
    hasRepoPermission = data.permission === "admin" || data.permission === "write";
  }

  const isTeamMember = await checkTeamMembership();
  return hasRepoPermission && isTeamMember;
}

async function saveQuestionsToGitHub() {
  if (questions.length === 0) {
    alert("Aucune question à sauvegarder. Veuillez charger les questions d'abord.");
    return;
  }

  const token = localStorage.getItem("github_access_token");
  if (!token) {
    alert("Veuillez vous connecter avec GitHub pour sauvegarder les modifications");
    return;
  }

  const hasPermission = await checkUserPermissions();
  if (!hasPermission) {
    alert(`Vous n'avez pas les permissions nécessaires pour modifier ce dépôt. Veuillez contacter un administrateur de l'organisation ${githubConfig.org} pour demander l'accès à l'équipe ${githubConfig.team}.`);
    return;
  }

  try {
    const branchResponse = await fetch(`${githubConfig.apiUrl}/repos/${githubConfig.repo}/branches/${githubConfig.branch}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    const branchData = await branchResponse.json();
    const isProtected = branchData.protected;

    if (isProtected) {
      const newBranch = `update-questions-${Date.now()}`;
      const refResponse = await fetch(`${githubConfig.apiUrl}/repos/${githubConfig.repo}/git/refs/heads/${githubConfig.branch}`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        }
      });
      const refData = await refResponse.json();
      const sha = refData.object.sha;

      await fetch(`${githubConfig.apiUrl}/repos/${githubConfig.repo}/git/refs`, {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
          ref: `refs/heads/${newBranch}`,
          sha: sha
        })
      });

      const content = btoa(unescape(encodeURIComponent(JSON.stringify(questions, null, 2))));
      const updateResponse = await fetch(`${githubConfig.apiUrl}/repos/${githubConfig.repo}/contents/${githubConfig.questionsPath}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
          message: "Mise à jour de questions.json via l'interface d'édition",
          content: content,
          branch: newBranch
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(`Erreur lors de la sauvegarde : ${updateResponse.status} ${updateResponse.statusText} - ${errorData.message}`);
      }

      const prResponse = await fetch(`${githubConfig.apiUrl}/repos/${githubConfig.repo}/pulls`, {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
          title: "Mise à jour de questions.json",
          head: newBranch,
          base: githubConfig.branch,
          body: "Mise à jour automatique de questions.json via l'interface d'édition."
        })
      });

      if (prResponse.ok) {
        alert("Une pull request a été créée pour vos modifications. Veuillez la faire approuver pour merger les changements.");
        fetchQuestions();
      } else {
        const errorData = await prResponse.json();
        throw new Error(`Erreur lors de la création de la pull request : ${prResponse.status} ${prResponse.statusText} - ${errorData.message}`);
      }
    } else {
      const response = await fetch(`${githubConfig.apiUrl}/repos/${githubConfig.repo}/contents/${githubConfig.questionsPath}?ref=${githubConfig.branch}`, {
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
      const updateResponse = await fetch(`${githubConfig.apiUrl}/repos/${githubConfig.repo}/contents/${githubConfig.questionsPath}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
          message: "Mise à jour de questions.json via l'interface d'édition",
          content: content,
          sha: sha,
          branch: githubConfig.branch
        })
      });

      if (updateResponse.ok) {
        alert("Modifications sauvegardées avec succès !");
        fetchQuestions();
      } else {
        const errorData = await updateResponse.json();
        throw new Error(`Erreur lors de la sauvegarde : ${updateResponse.status} ${updateResponse.statusText} - ${errorData.message}`);
      }
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des questions :", error);
    alert("Erreur lors de la sauvegarde : " + error.message);
  }
}

async function saveScoresToGitHub() {
  const token = localStorage.getItem("github_access_token");
  if (!token) {
    alert("Veuillez vous connecter avec GitHub pour sauvegarder les scores");
    return;
  }

  const hasPermission = await checkUserPermissions();
  if (!hasPermission) {
    alert(`Vous n'avez pas les permissions nécessaires pour modifier ce dépôt. Veuillez contacter un administrateur de l'organisation ${githubConfig.org} pour demander l'accès à l'équipe ${githubConfig.team}.`);
    return;
  }

  try {
    const branchResponse = await fetch(`${githubConfig.apiUrl}/repos/${githubConfig.repo}/branches/${githubConfig.branch}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    const branchData = await branchResponse.json();
    const isProtected = branchData.protected;

    if (isProtected) {
      const newBranch = `update-scores-${Date.now()}`;
      const refResponse = await fetch(`${githubConfig.apiUrl}/repos/${githubConfig.repo}/git/refs/heads/${githubConfig.branch}`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        }
      });
      const refData = await refResponse.json();
      const sha = refData.object.sha;

      await fetch(`${githubConfig.apiUrl}/repos/${githubConfig.repo}/git/refs`, {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
          ref: `refs/heads/${newBranch}`,
          sha: sha
        })
      });

      const content = btoa(unescape(encodeURIComponent(JSON.stringify(scores, null, 2))));
      const updateResponse = await fetch(`${githubConfig.apiUrl}/repos/${githubConfig.repo}/contents/${githubConfig.scoresPath}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
          message: "Mise à jour de scores.json via l'interface",
          content: content,
          branch: newBranch
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(`Erreur lors de la sauvegarde : ${updateResponse.status} ${updateResponse.statusText} - ${errorData.message}`);
      }

      const prResponse = await fetch(`${githubConfig.apiUrl}/repos/${githubConfig.repo}/pulls`, {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
          title: "Mise à jour de scores.json",
          head: newBranch,
          base: githubConfig.branch,
          body: "Mise à jour automatique de scores.json via l'interface."
        })
      });

      if (prResponse.ok) {
        alert("Une pull request a été créée pour vos modifications. Veuillez la faire approuver pour merger les changements.");
      } else {
        const errorData = await prResponse.json();
        throw new Error(`Erreur lors de la création de la pull request : ${prResponse.status} ${prResponse.statusText} - ${errorData.message}`);
      }
    } else {
      let sha = null;
      const response = await fetch(`${githubConfig.apiUrl}/repos/${githubConfig.repo}/contents/${githubConfig.scoresPath}?ref=${githubConfig.branch}`, {
        headers: {
          Authorization: `token ${token}`,
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
      const updateResponse = await fetch(`${githubConfig.apiUrl}/repos/${githubConfig.repo}/contents/${githubConfig.scoresPath}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
          message: "Mise à jour de scores.json via l'interface",
          content: content,
          sha: sha,
          branch: githubConfig.branch
        })
      });

      if (updateResponse.ok) {
        alert("Scores sauvegardés avec succès sur GitHub !");
      } else {
        const errorData = await updateResponse.json();
        throw new Error(`Erreur lors de la sauvegarde des scores : ${updateResponse.status} ${updateResponse.statusText} - ${errorData.message}`);
      }
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des scores :", error);
    alert("Erreur lors de la sauvegarde des scores : " + error.message);
  }
}

async function fetchQuestions() {
  try {
    console.log("Tentative de chargement de questions.json...");
    const response = await fetch(githubConfig.questionsPath);
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
    loadLotSelection();
  } catch (error) {
    console.error('Erreur lors du chargement des questions:', error);
    alert('Impossible de charger les questions. Vérifiez que questions.json est accessible. Détails : ' + error.message);
    questions = [];
  }
}
