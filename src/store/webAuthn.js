const encoder = new TextEncoder();
const decoder = new TextDecoder();

const bufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToBuffer = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

export const isWebAuthnSupported = () => {
  return !!window.navigator.credentials && !!window.navigator.credentials.create && !!window.navigator.credentials.get;
};

export const isBiometricAvailable = async () => {
  if (!isWebAuthnSupported()) return false;
  if (!window.PublicKeyCredential || !PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (e) {
    return false;
  }
};

export const registerBiometric = async (username) => {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const userID = encoder.encode(username);
  const userHandle = bufferToBase64(userID.buffer);

  const publicKeyCredentialCreationOptions = {
    challenge: challenge,
    rp: {
      name: 'TUI Logbook',
      id: window.location.hostname,
    },
    user: {
      id: userID,
      name: username,
      displayName: username,
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 }, // ES256
      { type: 'public-key', alg: -257 }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'preferred',
    },
    timeout: 60000,
  };

  try {
    const credential = await window.navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    });

    if (!credential) {
      throw new Error('Credential creation failed');
    }

    const response = credential.response;

    return {
      credentialId: bufferToBase64(credential.rawId),
      publicKey: bufferToBase64(response.publicKey),
      counter: response.attestationObject ? 0 : 0,
      userHandle,
    };
  } catch (error) {
    throw new Error(`Biometric registration failed: ${error.message}`);
  }
};

export const authenticateWithBiometric = async (credentialId) => {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const publicKeyCredentialRequestOptions = {
    challenge: challenge,
    allowCredentials: [
      {
        type: 'public-key',
        id: base64ToBuffer(credentialId),
      },
    ],
    userVerification: 'preferred',
    timeout: 60000,
  };

  try {
    const credential = await window.navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });

    if (!credential) {
      throw new Error('Authentication failed');
    }

    return {
      credentialId: bufferToBase64(credential.rawId),
      authenticatorData: bufferToBase64(credential.response.authenticatorData),
      clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
      signature: bufferToBase64(credential.response.signature),
      userHandle: credential.response.userHandle ? bufferToBase64(credential.response.userHandle) : null,
    };
  } catch (error) {
    throw new Error(`Biometric authentication failed: ${error.message}`);
  }
};
