let keycloakInstance: any = null;

const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost/auth',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'public-citizen-portal',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'civilian-nextjs-web',
};

// Initialize Keycloak dynamically to avoid SSR errors
export const initKeycloak = async () => {
  if (typeof window === "undefined") return null;

  if (keycloakInstance) return keycloakInstance;

  try {
    const Keycloak = (await import("keycloak-js")).default;
    keycloakInstance = new Keycloak(keycloakConfig);

    await keycloakInstance.init({
      onLoad: "check-sso",
      silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
      pkceMethod: "S256",        // PKCE for extra security
      checkLoginIframe: false,   // Disable iframe checks (more reliable)
    });

    return keycloakInstance;
  } catch (error) {
    console.error("Keycloak initialization failed", error);
    return null;
  }
};

export { keycloakConfig };