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
      this.db.doc(`users/${likedUid}/likedImages/${imageId}`).set({ imageId }),
    ]);
  }

  // いいねが解除された
  unlike(eventId: string, imageId: string, likedUid: string): Promise<void[]> {
    return Promise.all([
      this.db
        .doc(`events/${eventId}/images/${imageId}/likedUids/${likedUid}`)
        .delete(),
      this.db.doc(`users/${likedUid}/likedImages/${imageId}`).delete(),
    ]);
  }

  // 記事にいいねしているかチェックする
  isLiked(
    eventId: string,
    imageId: String,
    likedUid: String
  ): Observable<boolean> {
    return this.db
      .doc(`events/${eventId}/images/${imageId}/likedUids/${likedUid}`)
      .valueChanges()
      .pipe(map((doc) => !!doc));
  }

  // 記事にいいねしている人一覧で取得する
  getLikedCount(
    eventId: string,
    imageId: String
  ): Observable<LikedImageUser[]> {
    return this.db
      .collection<LikedImageUser>(
        `events/${eventId}/images/${imageId}/likedUids`
      )
      .valueChanges();
  }
}
