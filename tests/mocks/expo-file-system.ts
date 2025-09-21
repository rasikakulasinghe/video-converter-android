// Mock for expo-file-system to prevent TypeScript compilation issues

export const documentDirectory = '/mock/documents/';
export const cacheDirectory = '/mock/caches/';

export interface FileInfo {
  exists: boolean;
  isDirectory?: boolean;
  uri?: string;
  size?: number;
  modificationTime?: number;
}

export const getInfoAsync = jest.fn((fileUri: string): Promise<FileInfo> => {
  return Promise.resolve({
    exists: true,
    isDirectory: false,
    uri: fileUri,
    size: 1000000,
    modificationTime: Date.now(),
  });
});

export const readAsStringAsync = jest.fn((fileUri: string) => {
  return Promise.resolve('mock file content');
});

export const writeAsStringAsync = jest.fn((fileUri: string, contents: string) => {
  return Promise.resolve();
});

export const deleteAsync = jest.fn((fileUri: string) => {
  return Promise.resolve();
});

export const moveAsync = jest.fn((from: string, to: string) => {
  return Promise.resolve();
});

export const copyAsync = jest.fn((from: string, to: string) => {
  return Promise.resolve();
});

export const makeDirectoryAsync = jest.fn((fileUri: string) => {
  return Promise.resolve();
});

export const readDirectoryAsync = jest.fn((fileUri: string) => {
  return Promise.resolve([]);
});

export const downloadAsync = jest.fn((uri: string, fileUri: string) => {
  return Promise.resolve({
    uri: fileUri,
    status: 200,
    headers: {},
    mimeType: 'application/octet-stream',
  });
});

// Export default as an object with all the functions
export default {
  documentDirectory,
  cacheDirectory,
  getInfoAsync,
  readAsStringAsync,
  writeAsStringAsync,
  deleteAsync,
  moveAsync,
  copyAsync,
  makeDirectoryAsync,
  readDirectoryAsync,
  downloadAsync,
};