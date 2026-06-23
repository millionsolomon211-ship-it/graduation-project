import Keycloak from 'keycloak-js';

const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost/auth';
const KEYCLOAK_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'public-citizen-portal';
const KEYCLOAK_CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'civilian-nextjs-web';

let keycloakInstance: Keycloak | null = null;

export async function initKeycloak(): Promise<Keycloak | null> {
  if (typeof window === 'undefined') return null;
  if (keycloakInstance) return keycloakInstance;

  keycloakInstance = new Keycloak({
    url: KEYCLOAK_URL,
    realm: KEYCLOAK_REALM,
    clientId: KEYCLOAK_CLIENT_ID,
  });

  await keycloakInstance.init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    pkceMethod: 'S256',
  });

  return keycloakInstance;
}
