const functions = require('firebase-functions');
const admin = require('firebase-admin');
import {
  markEventTried,
  shouldEventRun,
  deleteCollectionByReference,
} from './utils/firebase.function';

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

export const deleteEvent = functions
  .region('asia-northeast1')
  .https.onCall(async (eventId: any) => {
    const commentsRef = db
      .collectionGroup(`comments`)
      .where('eventId', '==', eventId);
    const imagesRef = db
      .collectionGroup(`images`)
      .where('eventId', '==', eventId);
    const ownerEventsRef = db
      .collection(`events`)
      .where('eventId', '==', eventId);
    const joinedEventsRef = db
      .collectionGroup(`joinedEvents`)
      .where('eventId', '==', eventId);
    const joinedUidsRef = db
      .collectionGroup(`joinedUids`)
      .where('eventId', '==', eventId);
    const passwordRef = db
      .collection(`private`)
      .where('eventId', '==', eventId);

    return Promise.all([
      deleteCollectionByReference(commentsRef),
      deleteCollectionByReference(imagesRef),
      deleteCollectionByReference(ownerEventsRef),
      deleteCollectionByReference(joinedEventsRef),
      deleteCollectionByReference(joinedUidsRef),
      deleteCollectionByReference(passwordRef),
    ]);
  });

export const countUpJoinedUserCount = functions
  .region('asia-northeast1')
  .firestore.document('events/{eventId}/joinedUids/{uid}')
  .onCreate(async (snap: any, context: any) => {
    const eventId = context.eventId;
    return shouldEventRun(eventId).then(async (should) => {
      if (should) {
        await db
          .doc(`events/${context.params.eventId}`)
          .update('joinedUserCount', admin.firestore.FieldValue.increment(1));
        functions.logger.info(context.params);
        return markEventTried(eventId);
      } else {
        return;
      }
    });
  });

export const countDownJoinedUserCount = functions
  .region('asia-northeast1')
  .firestore.document('events/{eventId}/joinedUids/{uid}')
  .onDelete(async (snap: any, context: any) => {
    const eventId = context.eventId;
    return shouldEventRun(eventId).then(async (should) => {
      if (should) {
        await db
          .doc(`events/${context.params.eventId}`)
          .update('joinedUserCount', admin.firestore.FieldValue.increment(-1));
        return markEventTried(eventId);
      } else {
        return;
      }
    });
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
