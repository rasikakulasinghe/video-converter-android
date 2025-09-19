/**
 * @fileoverview useFileManager hook
 * Provides file management operations for video files
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { launchImageLibrary, MediaType, ImagePickerResponse } from 'react-native-image-picker';
import RNFS from 'react-native-fs';

import type { VideoFile } from '../types/models';

/**
 * File manager hook return type
 */
export interface UseFileManagerReturn {
  /** Whether file operations are in progress */
  isLoading: boolean;
  /** Select video files from device */
  selectFiles: () => Promise<VideoFile[]>;
  /** Delete a file from device storage */
  deleteFile: (filePath: string) => Promise<boolean>;
  /** Get file metadata */
  getFileInfo: (filePath: string) => Promise<VideoFile | null>;
  /** Check if file exists */
  fileExists: (filePath: string) => Promise<boolean>;
  /** Get available storage space */
  getAvailableSpace: () => Promise<number>;
}

/**
 * Custom hook for file management operations
 */
export const useFileManager = (): UseFileManagerReturn => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Select video files from device library
   */
  const selectFiles = useCallback(async (): Promise<VideoFile[]> => {
    setIsLoading(true);
    
    try {
      return new Promise((resolve) => {
        const options = {
          mediaType: 'video' as MediaType,
          quality: 0.8 as any, // Temporary fix for type issue
          includeBase64: false,
          selectionLimit: 10, // Allow multiple selection
        };

        launchImageLibrary(options, (response: ImagePickerResponse) => {
          if (response.didCancel || response.errorMessage) {
            resolve([]);
            return;
          }

          const files: VideoFile[] = [];
          
          if (response.assets) {
            response.assets.forEach((asset: any) => {
              if (asset.uri && asset.fileName && asset.fileSize && asset.duration) {
                files.push({
                  id: `${Date.now()}_${Math.random()}`,
                  name: asset.fileName,
                  path: asset.uri,
                  size: asset.fileSize,
                  mimeType: asset.type || 'video/mp4',
                  createdAt: new Date(),
                  metadata: {
                    duration: (asset.duration || 0) * 1000, // Convert to milliseconds
                    width: asset.width || 0,
                    height: asset.height || 0,
                    frameRate: 30, // Default value
                    bitrate: 0, // Unknown at selection
                    codec: 'unknown',
                  },
                });
              }
            });
          }

          resolve(files);
        });
      });
    } catch (error) {
      console.error('Error selecting files:', error);
      Alert.alert('Error', 'Failed to select video files');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a file from device storage
   */
  const deleteFile = useCallback(async (filePath: string): Promise<boolean> => {
    try {
      const exists = await RNFS.exists(filePath);
      if (exists) {
        await RNFS.unlink(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }, []);

  /**
   * Get file metadata and information
   */
  const getFileInfo = useCallback(async (filePath: string): Promise<VideoFile | null> => {
    try {
      const stats = await RNFS.stat(filePath);
      
      return {
        id: `file_${Date.now()}`,
        name: stats.name || 'unknown',
        path: filePath,
        size: stats.size,
        mimeType: 'video/mp4', // Default, would need proper detection
        createdAt: new Date(stats.ctime),
        metadata: {
          duration: 0, // Would need video metadata extraction
          width: 0,
          height: 0,
          frameRate: 30,
          bitrate: 0,
          codec: 'unknown',
        },
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }, []);

  /**
   * Check if file exists at path
   */
  const fileExists = useCallback(async (filePath: string): Promise<boolean> => {
    try {
      return await RNFS.exists(filePath);
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  }, []);

  /**
   * Get available storage space in bytes
   */
  const getAvailableSpace = useCallback(async (): Promise<number> => {
    try {
      const info = await RNFS.getFSInfo();
      return info.freeSpace;
    } catch (error) {
      console.error('Error getting available space:', error);
      return 0;
    }
  }, []);

  return {
    isLoading,
    selectFiles,
    deleteFile,
    getFileInfo,
    fileExists,
    getAvailableSpace,
  };
};