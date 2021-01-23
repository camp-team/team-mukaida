import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { markEventTried, shouldEventRun } from './utils/firebase.function';

export const db = admin.firestore();

export const judgementPassword = functions
  .region('asia-northeast1')
  .https.onCall(async (data: any) => {
    const event = (await db.doc(`private/${data.eventId}`).get()).data();
    const eventPassword = event?.password;
    try {
      if (data.password === eventPassword) {
        return true;
      } else {
        return false;
      }
    } catch {
      throw new Error('認証に失敗しました');
    }
  });

export const exitEvent = functions
  .region('asia-northeast1')
  .firestore.document('events/{eventId}/joinedUids/{userId}')
  .onDelete(async (_snap: any, context: any) => {
    const eventId: string = context.eventId;
    const userId: string = context.auth?.uid as string;
    const should = await shouldEventRun(eventId);
    if (should) {
      await db.doc(`events/${eventId}/joinedUids/${userId}`).delete();
      return markEventTried(eventId);
    } else {
      return;
    }
  });
