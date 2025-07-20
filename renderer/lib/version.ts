// Version configuration for AnkiBee
export const APP_VERSION = '1.2.0';
export const APP_NAME = 'AnkiBee';
export const APP_DESCRIPTION = 'Spelling Bee Deck Maker';
export const BUILD_PLATFORM = 'Windows x64';

// Version info object
export const versionInfo = {
  version: APP_VERSION,
  name: APP_NAME,
  description: APP_DESCRIPTION,
  platform: BUILD_PLATFORM,
  buildDate: new Date().toISOString(),
};

// Helper function to get formatted version string
export const getVersionString = () => `v${APP_VERSION}`;

// Helper function to get full app title with version
export const getAppTitle = () => `${APP_NAME} - ${APP_DESCRIPTION}`;

// Helper function to get full app title with version
export const getAppTitleWithVersion = () => `${getAppTitle()} ${getVersionString()}`; 