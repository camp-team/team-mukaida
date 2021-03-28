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
    id: string,
    type: 'image' | 'video'
  ): Promise<void[]> {
    return Promise.all([
      this.db
        .doc(
          `events/${eventId}/${
            type === 'image' ? 'images' : 'videos'
          }/${id}/likedUids/${likedUid}`
        )
        .set({ likedUid, eventId }),
      this.db
        .doc(
          `users/${likedUid}/${
            type === 'image' ? 'likedImages' : 'likedVideos'
          }/${id}`
        )
        .set({ id }),
    ]);
  }

  unlike(
    eventId: string,
    likedUid: string,
    id: string,
    type: 'image' | 'video'
  ): Promise<void[]> {
    return Promise.all([
      this.db
        .doc(
          `events/${eventId}/${
            type === 'image' ? 'images' : 'videos'
          }/${id}/likedUids/${likedUid}`
        )
        .delete(),
      this.db
        .doc(
          `users/${likedUid}/${
            type === 'image' ? 'likedImages' : 'likedVideos'
          }/${id}`
        )
        .delete(),
    ]);
  }

  isLiked(
    eventId: string,
    likedUid: string,
    id: string,
    type: 'image' | 'video'
  ): Observable<boolean> {
    return this.db
      .doc(
        `events/${eventId}/${
          type === 'image' ? 'images' : 'videos'
        }/${id}/likedUids/${likedUid}`
      )
      .valueChanges()
      .pipe(map((doc) => !!doc));
  }

  getLikedCount(
    eventId: string,
    id: string,
    type: 'image' | 'video'
  ): Observable<LikedImageUser[]> {
    return this.db
      .collection<LikedImageUser>(
        `events/${eventId}/${
          type === 'image' ? 'images' : 'videos'
        }/${id}/likedUids`
      )
      .valueChanges();
  }
}
