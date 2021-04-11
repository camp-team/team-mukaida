import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { PostWithUser } from '../interfaces/post';
import { User } from '../interfaces/user';
import { Video } from '../interfaces/video';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  isLoading: boolean;

  constructor(
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private router: Router
  ) {}

  async uploadVideo(
    eventId: string,
    file: File,
    uid: string,
    image: string
  ): Promise<void> {
    const videoId = this.db.createId();
    const result = this.storage.ref(`videos/${eventId}/${videoId}`).put(file);
    const videoURL = await (await result).ref.getDownloadURL();
    const thumbnailId = this.db.createId();
    const imageResult = await this.storage
      .ref(`videos/${eventId}/${thumbnailId}`)
      .putString(image, 'data_url', {
        contentType: 'image/jpeg',
      });
    const thumbnailURL = await imageResult.ref.getDownloadURL();

    await result.then(() => {
      this.db
        .doc(`events/${eventId}/videos/${videoId}`)
        .set({
          videoId,
          uid,
          videoURL,
          eventId,
          thumbnailURL,
          thumbnailId,
          createdAt: firebase.default.firestore.Timestamp.now(),
        })
        .then(() => this.snackBar.open('アップロード完了！'))
        .finally(() => this.router.navigateByUrl(`event/${eventId}`));
    });
  }

  getVideos(eventId: string): Observable<Video[]> {
    return this.db
      .collection<Video>(`events/${eventId}/videos`, (ref) =>
        ref.orderBy('createdAt', 'desc')
      )
      .valueChanges();
  }

  getVideo(eventId: string, videoId: string): Observable<Video> {
    return this.db
      .doc<Video>(`events/${eventId}/videos/${videoId}`)
      .valueChanges();
  }

  getVideosWithUser(eventId: string) {
    return this.getVideos(eventId).pipe(
      switchMap((videos) => {
        if (videos.length) {
          const unduplicatedUids: string[] = Array.from(
            new Set(videos.map((video) => video.uid))
          );
          const users$: Observable<User[]> = combineLatest(
            unduplicatedUids.map((userId) =>
              this.userService.getUserData(userId)
            )
          );
          return combineLatest([of(videos), users$]);
        } else {
          return of([]);
        }
      }),
      map(([videos, users]) => {
        if (videos?.length) {
          return videos.map((video) => {
            return {
              ...video,
              user: users.find((user) => video.uid === user?.uid),
            };
          });
        } else {
          return [];
        }
      })
    );
  }

  async getRecentVideosInJoinedEvents(
    uid: string
  ): Promise<Observable<PostWithUser[]>> {
    this.isLoading = true;
    return this.userService
      .getJoinedEventIds(uid)
      .pipe(take(1))
      .toPromise()
      .then((ids) => {
        if (ids.length) {
          return this.db
            .collectionGroup<Video>('videos', (ref) =>
              ref
                .where('eventId', 'in', ids)
                .orderBy('createdAt', 'desc')
                .limit(20)
            )
            .valueChanges()
            .pipe(
              switchMap((videos: Video[]) => {
                if (videos.length) {
                  const unduplicatedUids: string[] = Array.from(
                    new Set(videos.map((video) => video.uid))
                  );
                  const users$: Observable<User[]> = combineLatest(
                    unduplicatedUids.map((userId) =>
                      this.userService.getUserData(userId)
                    )
                  );
                  return combineLatest([of(videos), users$]);
                } else {
                  return of([]);
                }
              }),
              map(([videos, users]) => {
                if (videos?.length) {
                  return videos.map((video: Video) => {
                    return {
                      ...video,
                      user: users.find((user: User) => video.uid === user?.uid),
                    };
                  });
                } else {
                  return [];
                }
              })
            );
        } else {
          return of(null);
        }
      })
      .finally(() => (this.isLoading = false));
  }

  deleteVideo(eventId: string, videoId: string, thumbnailId: string): void {
    const videoRef = this.storage.ref(`videos/${eventId}/${videoId}`);
    const thumbnailRef = this.storage.ref(`videos/${eventId}/${thumbnailId}`);
    videoRef.delete();
    thumbnailRef.delete();
    this.db
      .doc<Video>(`events/${eventId}/videos/${videoId}`)
      .delete()
      .then(() => this.snackBar.open('動画ファイルを削除しました'));
  }
}
