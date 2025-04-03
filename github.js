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
  scope: "repo"
} : {
  apiUrl: "https://api.github.com",
  authUrl: "https://github.com/login/oauth/authorize",
  tokenUrl: "https://github.com/login/oauth/access_token",
  clientId: "Ov23liQj7MXBgBOqNVAE",
  redirectUri: "https://guillaumebizet.github.io/TrainingMATERIAL/callback",
  repo: "guillaumebizet/TrainingMATERIAL",
  branch: "main",
  questionsPath: "questions.json",
  scoresPath: "scores.json",
  scope: "repo"
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

  localStorage.setItem("code_verifier", codeVerifier);

  const authUrl = `${githubConfig.authUrl}?client_id=${githubConfig.clientId}&redirect_uri=${githubConfig.redirectUri}&scope=${githubConfig.scope}&response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  window.location.href = authUrl;
}

function logout() {
  localStorage.removeItem("github_access_token");
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
