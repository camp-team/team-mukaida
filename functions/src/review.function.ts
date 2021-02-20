import * as admin from 'firebase-admin';
import { shouldRun, markTried } from 'shouldEventRun';

const db = admin.firestore();

export const countUpLiked = Function.firestore
  .document('items/{itemId}/review/{userId}')
  .onCreate(async (snap: any, context: any) => {
    const point = snap.data().point;
    return shouldRun(context.eventId).then(async (should: any) => {
      if (should) {
        await db
          .doc(`items/${context.params.itemId}`)
          .update(
            'totalReviewPoint',
            admin.firestore.FieldValue.increment(point)
          );
        await db
          .doc(`items/${context.params.itemId}`)
          .update('reviewCount', admin.firestore.FieldValue.increment(1));
        return markTried(context.eventId);
      }
    });
  });
