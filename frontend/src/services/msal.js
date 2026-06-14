import { PublicClientApplication } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "4e9185a8-204b-4a52-b883-7c01b10a273b",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin + "/login",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

let _initialized = false;

export async function initializeMsal() {
  if (!_initialized) {
    await msalInstance.initialize();
    
    await msalInstance.handleRedirectPromise().catch(() => {});
    _initialized = true;
  }
}

export function clearMsalInteraction() {
  
  Object.keys(sessionStorage)
    .filter((k) => k.includes("msal") || k.includes("interaction"))
    .forEach((k) => sessionStorage.removeItem(k));
  _initialized = false;
}
