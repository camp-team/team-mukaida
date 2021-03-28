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

  likeItem(
    eventId: string,
    likedUid: string,
    imageId?: string,
    videoId?: string
  ): Promise<void[]> {
    if (imageId) {
      return Promise.all([
        this.db
          .doc(`events/${eventId}/images/${imageId}/likedUids/${likedUid}`)
          .set({ likedUid, eventId }),
        this.db
          .doc(`users/${likedUid}/likedImages/${imageId}`)
          .set({ imageId }),
      ]);
    }
    if (videoId) {
      return Promise.all([
        this.db
          .doc(`events/${eventId}/videos/${videoId}/likedUids/${likedUid}`)
          .set({ likedUid, eventId }),
        this.db
          .doc(`users/${likedUid}/likedVideos/${videoId}`)
          .set({ videoId }),
      ]);
    }
  }

  unlike(
    eventId: string,
    likedUid: string,
    imageId?: string,
    videoId?: string
  ): Promise<void[]> {
    if (imageId) {
      return Promise.all([
        this.db
          .doc(`events/${eventId}/images/${imageId}/likedUids/${likedUid}`)
          .delete(),
        this.db.doc(`users/${likedUid}/likedImages/${imageId}`).delete(),
      ]);
    }
    if (videoId) {
      return Promise.all([
        this.db
          .doc(`events/${eventId}/videos/${videoId}/likedUids/${likedUid}`)
          .delete(),
        this.db.doc(`users/${likedUid}/likedVideos/${videoId}`).delete(),
      ]);
    }
  }

  isLiked(
    eventId: string,
    likedUid: String,
    imageId?: String,
    videoId?: String
  ): Observable<boolean> {
    if (imageId) {
      return this.db
        .doc(`events/${eventId}/images/${imageId}/likedUids/${likedUid}`)
        .valueChanges()
        .pipe(map((doc) => !!doc));
    }
    if (videoId) {
      return this.db
        .doc(`events/${eventId}/videos/${videoId}/likedUids/${likedUid}`)
        .valueChanges()
        .pipe(map((doc) => !!doc));
    }
  }

  getLikedCount(
    eventId: string,
    imageId?: String,
    videoId?: string
  ): Observable<LikedImageUser[]> {
    if (imageId) {
      return this.db
        .collection<LikedImageUser>(
          `events/${eventId}/images/${imageId}/likedUids`
        )
        .valueChanges();
    }
    if (videoId) {
      return this.db
        .collection<LikedImageUser>(
          `events/${eventId}/videos/${videoId}/likedUids`
        )
        .valueChanges();
    }
  }
}
