const githubConfig = {
  apiUrl: "https://api.github.com",
  authUrl: "https://github.com/login/oauth/authorize",
  tokenUrl: "https://github.com/login/oauth/access_token",
  clientId: "VOTRE_CLIENT_ID_GITHUB_COM", // Remplacez par votre Client ID pour GitHub.com
  redirectUri: "https://guillaumebizet.github.io/TrainingMATERIAL/callback",
  repo: "guillaumebizet/TrainingMATERIAL",
  branch: "main",
  questionsPath: "questions.json",
  scoresPath: "scores.json",
  scope: "repo"
};
