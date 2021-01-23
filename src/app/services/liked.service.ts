import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LikedImageUser } from '../interfaces/liked-image-user';

@Injectable({
  providedIn: 'root',
})
export class LikedService {
  constructor(private db: AngularFirestore) {}

  // いいねが押された
  likeItem(
    eventId: string,
    imageId: string,
    likedUid: string
  ): Promise<void[]> {
    return Promise.all([
      // 投稿された画像にいいねをしたユーザーIDをDBに登録
      this.db
        .doc(`events/${eventId}/images/${imageId}/likedUids/${likedUid}`)
        .set({ likedUid, eventId }),
      // 自分がいいねをした画像をDBの自分のユーザーIDに保持する
      this.db.doc(`users/${likedUid}/likedEvent/${eventId}`).set({ eventId }),
    ]);
  }

  // いいねが解除された
  unlike(eventId: string, imageId: string, likedUid: string): Promise<void[]> {
    return Promise.all([
      this.db
        .doc(`events/${eventId}/images/${imageId}/likedUids/${likedUid}`)
        .delete(),
      this.db.doc(`users/${likedUid}/likedEvent/${eventId}`).delete(),
    ]);
  }

  // 記事にいいねしているかチェックする
  isLiked(eventId: string): Observable<boolean> {
    return this.db
      .collectionGroup('likedUids', (ref) =>
        ref.where('eventId', '==', eventId)
      )
      .valueChanges()
      .pipe(map((doc) => !!doc));
  }

  // 記事にいいねしている人一覧で取得する
  getLikedCount(eventId: string): Observable<LikedImageUser[]> {
    return this.db
      .collectionGroup<LikedImageUser>('likedUids', (ref) =>
        ref.where('eventId', '==', eventId)
      )
      .valueChanges();
  }
}
