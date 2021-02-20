import * as admin from 'firebase-admin';
import { shouldRun, markTried } from 'shouldEventRun';
const db = admin.firestore();
const functions = require('firebase-functions');

// カウントアップ
export const countUpLiked = functions.firestore
  .document('items/{itemId}/likedUserIds/{userId}')
  .onCreate(async (snap: any, context: any) => {
    const eventId = context.eventId;
    return shouldRun(eventId).then((should: any) => {
      if (should) {
        db.doc(`items/${context.params.itemId}`).update(
          'likedCount',
          admin.firestore.FieldValue.increment(1)
        );
        return markTried(eventId);
      }
    });
  });

// カウントダウン
export const countDownLiked = functions
  .document(`events/{eventId}/images/{likedUid}`)
  .onDelete(async (snap: any, context: any) => {
    const eventId = context.eventId;
    return shouldRun(eventId).then((should: any) => {
      if (should) {
        db.doc(`items/${context.params.itemId}`).update(
          'likedCount',
          admin.firestore.FieldValue.increment(-1)
        );
        return markTried(eventId);
      }
    });
  });
