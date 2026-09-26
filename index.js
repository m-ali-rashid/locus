/**
 * @format
 */

import { AppRegistry } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import App from './App';
import { name as appName } from './app.json';
import { HeadlessTaskHandler } from './src/core/background/HeadlessTaskHandler';

// Register background headless task
BackgroundFetch.registerHeadlessTask(HeadlessTaskHandler);

AppRegistry.registerComponent(appName, () => App);

