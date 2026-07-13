import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

// Cache the access token in memory only. Never save to localStorage.
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Clear token on signout
auth.onAuthStateChanged((user) => {
  if (!user) {
    cachedAccessToken = null;
  }
});

// Configure Google Auth Provider with Google Drive scopes
export const getGoogleAuthProvider = () => {
  const provider = new GoogleAuthProvider();
  // Request full drive scope or specific scopes as accepted in ToS
  provider.addScope('https://www.googleapis.com/auth/drive');
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  return provider;
};

/**
 * Initiates the Google Sign-In with Popup flow to retrieve/refresh the Drive Access Token.
 */
export const connectGoogleDrive = async (): Promise<string> => {
  if (isSigningIn) {
    throw new Error('Authentication is already in progress.');
  }

  try {
    isSigningIn = true;
    const provider = getGoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses Google Drive. Harap berikan izin akses.');
    }

    cachedAccessToken = credential.accessToken;
    return cachedAccessToken;
  } catch (error: any) {
    console.error('Google Drive sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Returns the currently cached access token, or null if not connected.
 */
export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Disconnects the local Drive session (clears memory cache).
 */
export const disconnectGoogleDrive = () => {
  cachedAccessToken = null;
};

/**
 * Searches for a folder by name. If it doesn't exist, creates it.
 * Returns the folder's ID.
 */
export const getOrCreateFolder = async (accessToken: string, folderName: string): Promise<string> => {
  const searchQ = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  
  try {
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQ)}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!searchRes.ok) {
      if (searchRes.status === 401) {
        disconnectGoogleDrive();
        throw new Error('Sesi Google Drive telah kedaluwarsa. Silakan hubungkan kembali.');
      }
      throw new Error(`Gagal mencari folder: ${searchRes.statusText}`);
    }

    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    // Folder doesn't exist, let's create it
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      })
    });

    if (!createRes.ok) {
      throw new Error(`Gagal membuat folder Google Drive: ${createRes.statusText}`);
    }

    const folder = await createRes.json();
    return folder.id;
  } catch (error) {
    console.error('Error in getOrCreateFolder:', error);
    throw error;
  }
};

/**
 * Uploads a PDF blob to a specified Google Drive folder.
 */
export const uploadPdfToDrive = async (
  accessToken: string,
  pdfBlob: Blob,
  fileName: string,
  folderId?: string
): Promise<any> => {
  const metadata = {
    name: fileName,
    mimeType: 'application/pdf',
    parents: folderId ? [folderId] : undefined
  };

  const boundary = '314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = JSON.stringify(metadata);
  const header = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${metadataPart}\r\n${delimiter}Content-Type: application/pdf\r\n\r\n`;

  const bodyBlob = new Blob([
    header,
    pdfBlob,
    closeDelimiter
  ], { type: `multipart/related; boundary=${boundary}` });

  try {
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: bodyBlob
    });

    if (!response.ok) {
      if (response.status === 401) {
        disconnectGoogleDrive();
        throw new Error('Sesi Google Drive telah kedaluwarsa. Silakan hubungkan kembali.');
      }
      throw new Error(`Gagal mengunggah laporan ke Drive: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading PDF to Google Drive:', error);
    throw error;
  }
};

/**
 * Lists PDF files in a specific Google Drive folder.
 */
export const listPdfsInFolder = async (accessToken: string, folderId: string): Promise<any[]> => {
  const q = `'${folderId}' in parents and mimeType = 'application/pdf' and trashed = false`;
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,webViewLink,webContentLink,createdTime,size,iconLink)&orderBy=createdTime desc`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        disconnectGoogleDrive();
        throw new Error('Sesi Google Drive telah kedaluwarsa. Silakan hubungkan kembali.');
      }
      throw new Error(`Gagal memuat daftar laporan dari Drive: ${response.statusText}`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error listing PDF files from Google Drive:', error);
    throw error;
  }
};

/**
 * Deletes a file from Google Drive (requires user confirmation before calling!).
 */
export const deleteFileFromDrive = async (accessToken: string, fileId: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      if (response.status === 401) {
        disconnectGoogleDrive();
        throw new Error('Sesi Google Drive telah kedaluwarsa. Silakan hubungkan kembali.');
      }
      throw new Error(`Gagal menghapus file dari Drive: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error);
    throw error;
  }
};
