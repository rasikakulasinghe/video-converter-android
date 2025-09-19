/**
 * Mock for ffmpeg-kit-react-native
 */

const mockSession = {
  getSessionId: jest.fn(() => 'mock-session-id'),
  getCreateTime: jest.fn(() => new Date()),
  getDuration: jest.fn(() => 1000),
  getCommand: jest.fn(() => 'mock-command'),
  getAllLogsAsString: jest.fn(() => 'mock logs'),
  getOutput: jest.fn(() => 'mock output'),
  getFailStackTrace: jest.fn(() => null),
  getReturnCode: jest.fn(() => ({ getValue: () => 0 })),
  getState: jest.fn(() => ({ getValue: () => 3 })), // SessionState.COMPLETED
  getStartTime: jest.fn(() => new Date()),
  getEndTime: jest.fn(() => new Date()),
  cancel: jest.fn(),
  isFFmpeg: jest.fn(() => true),
  isFFprobe: jest.fn(() => false),
};

const mockStatistics = {
  getSessionId: jest.fn(() => 'mock-session-id'),
  getVideoFrameNumber: jest.fn(() => 100),
  getVideoFps: jest.fn(() => 30),
  getVideoQuality: jest.fn(() => 1.0),
  getSize: jest.fn(() => 1024 * 1024), // 1MB
  getTime: jest.fn(() => 1000), // 1 second
  getBitrate: jest.fn(() => 1000000), // 1Mbps
  getSpeed: jest.fn(() => 1.0),
};

const mockLog = {
  getSessionId: jest.fn(() => 'mock-session-id'),
  getLevel: jest.fn(() => 32), // AV_LOG_INFO
  getMessage: jest.fn(() => 'mock log message'),
};

const FFmpegKit = {
  execute: jest.fn().mockResolvedValue(mockSession),
  executeAsync: jest.fn((command, completeCallback, logCallback, statisticsCallback) => {
    // Simulate async execution
    setTimeout(() => {
      if (logCallback) {
        logCallback(mockLog);
      }
      if (statisticsCallback) {
        statisticsCallback(mockStatistics);
      }
      if (completeCallback) {
        completeCallback(mockSession);
      }
    }, 100);
    return Promise.resolve(mockSession);
  }),
  executeWithArguments: jest.fn().mockResolvedValue(mockSession),
  executeWithArgumentsAsync: jest.fn().mockResolvedValue(mockSession),
  cancel: jest.fn(),
  cancelSession: jest.fn(),
  getMediaInformation: jest.fn().mockResolvedValue({
    getMediaInformation: () => ({
      getDuration: () => '10.0',
      getBitrate: () => '1000000',
      getTags: () => ({}),
    }),
    getStreams: () => [
      {
        getIndex: () => 0,
        getType: () => 'video',
        getCodec: () => 'h264',
        getWidth: () => 1920,
        getHeight: () => 1080,
        getSampleAspectRatio: () => '1:1',
        getDisplayAspectRatio: () => '16:9',
        getPixelFormat: () => 'yuv420p',
        getBitrate: () => '1000000',
        getSampleRate: () => null,
        getChannelLayout: () => null,
        getSampleFormat: () => null,
        getFramerate: () => '30',
        getTimeBase: () => '1/30',
        getCodecTimeBase: () => '1/60',
        getTags: () => ({}),
      }
    ],
  }),
  listSessions: jest.fn(() => []),
  getSessions: jest.fn(() => []),
};

const FFprobeKit = {
  execute: jest.fn().mockResolvedValue(mockSession),
  executeAsync: jest.fn().mockResolvedValue(mockSession),
  getMediaInformation: jest.fn().mockResolvedValue({
    getMediaInformation: () => null,
    getStreams: () => [],
  }),
  getMediaInformationAsync: jest.fn().mockResolvedValue({
    getMediaInformation: () => null,
    getStreams: () => [],
  }),
};

const ReturnCode = {
  SUCCESS: { getValue: () => 0 },
  CANCEL: { getValue: () => 255 },
  isSuccess: (returnCode: any) => returnCode?.getValue() === 0,
  isCancel: (returnCode: any) => returnCode?.getValue() === 255,
};

const SessionState = {
  CREATED: { getValue: () => 0 },
  RUNNING: { getValue: () => 1 },
  FAILED: { getValue: () => 2 },
  COMPLETED: { getValue: () => 3 },
};

const LogLevel = {
  AV_LOG_QUIET: -8,
  AV_LOG_PANIC: 0,
  AV_LOG_FATAL: 8,
  AV_LOG_ERROR: 16,
  AV_LOG_WARNING: 24,
  AV_LOG_INFO: 32,
  AV_LOG_VERBOSE: 40,
  AV_LOG_DEBUG: 48,
  AV_LOG_TRACE: 56,
};

// Export individual classes/interfaces for direct imports
class FFmpegSession {
  constructor() {
    return mockSession;
  }
}

class Statistics {
  constructor() {
    return mockStatistics;
  }
}

class Log {
  constructor() {
    return mockLog;
  }
}

// Create the mock module object
const mockModule = {
  FFmpegKit,
  FFprobeKit,
  ReturnCode,
  SessionState,
  LogLevel,
  FFmpegSession,
  Statistics,
  Log,
};

// CommonJS style export - primary export for Node.js/Jest
module.exports = mockModule;

// Add individual properties to module.exports for namespace-style access
// This is critical for TypeScript's generated namespace imports like ffmpeg_kit_react_native_1.FFmpegKit
module.exports.FFmpegKit = FFmpegKit;
module.exports.FFprobeKit = FFprobeKit;
module.exports.ReturnCode = ReturnCode;
module.exports.SessionState = SessionState;
module.exports.LogLevel = LogLevel;
module.exports.FFmpegSession = FFmpegSession;
module.exports.Statistics = Statistics;
module.exports.Log = Log;

// ES6 named exports for modern import syntax
export {
  FFmpegKit,
  FFprobeKit,
  ReturnCode,
  SessionState,
  LogLevel,
  FFmpegSession,
  Statistics,
  Log,
};

// ES6 default export
export default mockModule;