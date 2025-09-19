import type { VideoFile } from './models';

/**
 * Root navigation stack parameter list.
 * Defines the screens and their required parameters.
 */
export type RootStackParamList = {
  /** Main screen - primary video conversion interface */
  Main: undefined;
  
  /** Settings screen - app configuration and preferences */
  Settings: undefined;
  
  /** Results screen - view processed videos and history */
  Results: {
    /** Optional specific video file to highlight */
    videoFile?: VideoFile;
  };
};