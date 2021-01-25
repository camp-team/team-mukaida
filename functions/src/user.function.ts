import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { markEventTried, shouldEventRun } from './utils/firebase.function';
import { deleteCollectionByReference } from './utils/firebase.function';

const db = admin.firestore();

export const createUser = functions
  .region('asia-northeast1')
  .auth.user()
  .onCreate((user: any) => {
    return db.doc(`users/${user.uid}`).set(
      {
        uid: user.uid,
        name: user.displayName,
        avatarURL: user.photoURL,
        createdAt: new Date(),
      },
      { merge: true }
    );
  });

export const deleteAfUser = functions
  .region('asia-northeast1')
  .https.onCall((data: any, context: any) => {
    return admin.auth().deleteUser(data);
  });

export const deleteUserAccount = functions
  .region('asia-northeast1')
  .auth.user()
  .onDelete(async (user: any, _: any) => {
    const users = db.collection(`users`).where('uid', '==', user.uid);
    await deleteCollectionByReference(users);
    return;
  });

export const deleteJoinedEventId = functions
  .region('asia-northeast1')
  .https.onCall(async (data: any, _context: any) => {
    const uid: string = data.uid;
    const eventId: string = data.eventId;
    const should = await shouldEventRun(eventId);
    if (should) {
      await db.doc(`users/${uid}/joinedEvents/${eventId}`).delete();
      markEventTried(uid);
    }
  });
