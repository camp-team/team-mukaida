import * as admin from 'firebase-admin';
const db = admin.firestore();
const functions = require('firebase-functions');

// カウントアップ
export const countUpLiked = functions
  .document(`events/{eventId}/images/{likedUid}`)
  .onCreate(async (snap: any, context: any) => {
    return db
      .doc(`events/${context.params.eventId}`)
      .update('likedCount', admin.firestore.FieldValue.increment(1));
  });

// カウントダウン
export const countDownLiked = functions
  .document(`events/{eventId}/images/{likedUid}`)
  .onDelete(async (snap: any, context: any) => {
    return db
      .doc(`items/${context.params.itemId}`)
      .update('likedCount', admin.firestore.FieldValue.increment(-1));
  });
