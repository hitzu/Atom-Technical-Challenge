import { createApp } from './main';
import * as functions from 'firebase-functions';

// Firebase Functions entry point (kept minimal; refined later).
const app = createApp();

exports.api = functions.https.onRequest(app);

