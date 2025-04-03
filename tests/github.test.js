// Mock des dépendances
global.fetch = jest.fn();
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

// Importer les fonctions à tester
const { generateCodeVerifier, generateCodeChallenge, loginWithGitHub, logout, checkUserPermissions, checkTeamMembership } = require("../github.js");

// Mock de la configuration
jest.mock("../config.github.socgen.js", () => ({
  githubConfig: {
    apiUrl: "https://sgithub.fr.world.socgen/api/v3",
    authUrl: "https://sgithub.fr.world.socgen/login/oauth/authorize",
    tokenUrl: "https://sgithub.fr.world.socgen/login/oauth/access_token",
    clientId: "TEST_CLIENT_ID",
    redirectUri: "TEST_REDIRECT_URI",
    repo: "a474881/training",
    branch: "coding-main",
    questionsPath: "questions.json",
    scoresPath: "scores.json",
    scope: "repo"
  }
}));

describe("GitHub Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("generateCodeVerifier should return a valid string", () => {
    const verifier = generateCodeVerifier();
    expect(verifier).toBeDefined();
    expect(typeof verifier).toBe("string");
    expect(verifier.length).toBeGreaterThan(0);
  });

  test("generateCodeChallenge should return a valid string", async () => {
    const verifier = "test-verifier";
    const challenge = await generateCodeChallenge(verifier);
    expect(challenge).toBeDefined();
    expect(typeof challenge).toBe("string");
    expect(challenge.length).toBeGreaterThan(0);
  });

  test("loginWithGitHub should redirect to the correct auth URL", async () => {
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: "" };

    loginWithGitHub();
    expect(localStorage.setItem).toHaveBeenCalledWith("code_verifier", expect.any(String));
    expect(window.location.href).toContain("https://sgithub.fr.world.socgen/login/oauth/authorize");
    expect(window.location.href).toContain("client_id=TEST_CLIENT_ID");
    expect(window.location.href).toContain("redirect_uri=TEST_REDIRECT_URI");
    expect(window.location.href).toContain("scope=repo");
    expect(window.location.href).toContain("response_type=code");
    expect(window.location.href).toContain("code_challenge=");
    expect(window.location.href).toContain("code_challenge_method=S256");

    window.location = originalLocation;
  });

  test("logout should remove the token and reload the page", () => {
    const originalLocation = window.location;
    delete window.location;
    window.location = { reload: jest.fn() };

    logout();
    expect(localStorage.removeItem).toHaveBeenCalledWith("github_access_token");
    expect(window.location.reload).toHaveBeenCalled();

    window.location = originalLocation;
  });
    test("checkUserPermissions should return true for admin or write permission and team membership", async () => {
    localStorage.getItem.mockReturnValue("test-token");
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ permission: "write" })
      }) // Réponse pour /repos/.../collaborators/permission
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ login: "test-user" })
      }) // Réponse pour /user
      .mockResolvedValueOnce({
        ok: true
      }); // Réponse pour /orgs/.../teams/QuizEditors/memberships/test-user

    const hasPermission = await checkUserPermissions();
    expect(hasPermission).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "https://sgithub.fr.world.socgen/api/v3/repos/a474881/training/collaborators/permission",
      expect.any(Object)
    );
    expect(fetch).toHaveBeenCalledWith(
      "https://sgithub.fr.world.socgen/api/v3/user",
      expect.any(Object)
    );
    expect(fetch).toHaveBeenCalledWith(
      "https://sgithub.fr.world.socgen/api/v3/orgs/a474881/teams/QuizEditors/memberships/test-user",
      expect.any(Object)
    );
  });

  test("checkUserPermissions should return false if no token", async () => {
    localStorage.getItem.mockReturnValue(null);
    const hasPermission = await checkUserPermissions();
    expect(hasPermission).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  test("checkUserPermissions should return false for read permission", async () => {
    localStorage.getItem.mockReturnValue("test-token");
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ permission: "read" })
      }) // Réponse pour /repos/.../collaborators/permission
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ login: "test-user" })
      }) // Réponse pour /user
      .mockResolvedValueOnce({
        ok: true
      }); // Réponse pour /orgs/.../teams/QuizEditors/memberships/test-user

    const hasPermission = await checkUserPermissions();
    expect(hasPermission).toBe(false);
  });

  test("checkUserPermissions should return false if not in team", async () => {
    localStorage.getItem.mockReturnValue("test-token");
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ permission: "write" })
      }) // Réponse pour /repos/.../collaborators/permission
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ login: "test-user" })
      }) // Réponse pour /user
      .mockResolvedValueOnce({
        ok: false
      }); // Réponse pour /orgs/.../teams/QuizEditors/memberships/test-user

    const hasPermission = await checkUserPermissions();
    expect(hasPermission).toBe(false);
  });

  test("checkTeamMembership should return true if user is in team", async () => {
    localStorage.getItem.mockReturnValue("test-token");
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ login: "test-user" })
      }) // Réponse pour /user
      .mockResolvedValueOnce({
        ok: true
      }); // Réponse pour /orgs/.../teams/QuizEditors/memberships/test-user

    const isMember = await checkTeamMembership();
    expect(isMember).toBe(true);
  });

  test("checkTeamMembership should return false if user is not in team", async () => {
    localStorage.getItem.mockReturnValue("test-token");
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ login: "test-user" })
      }) // Réponse pour /user
      .mockResolvedValueOnce({
        ok: false
      }); // Réponse pour /orgs/.../teams/QuizEditors/memberships/test-user

    const isMember = await checkTeamMembership();
    expect(isMember).toBe(false);
  });
});
  test("checkTeamMembership should return false if no token", async () => {
    localStorage.getItem.mockReturnValue(null);
    const isMember = await checkTeamMembership();
    expect(isMember).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  test("isAuthenticated should return true if token exists", () => {
    localStorage.getItem.mockReturnValue("test-token");
    expect(isAuthenticated()).toBe(true);
  });

  test("isAuthenticated should return false if no token", () => {
    localStorage.getItem.mockReturnValue(null);
    expect(isAuthenticated()).toBe(false);
  });

  // Tests pour saveQuestionsToGitHub et saveScoresToGitHub nécessiteraient des mocks plus complexes
  // (par exemple, pour simuler les appels fetch et les réponses de l'API GitHub).
  // Nous pouvons les ajouter si nécessaire.
});
