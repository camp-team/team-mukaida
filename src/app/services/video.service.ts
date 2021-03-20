import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import { Video } from '../interfaces/video';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  constructor(
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private snackBar: MatSnackBar
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
        .then(() => this.snackBar.open('ファイルのアップロードを始めました'))
        .finally(() => this.snackBar.open('アップロード完了！'));
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

  deleteVideo(eventId: string, videoId: string): void {
    const videoRef = this.storage.ref(`videos/${eventId}/${videoId}`);
    videoRef.delete();
    this.db
      .doc<Video>(`events/${eventId}/images/${videoId}`)
      .delete()
      .then(() => this.snackBar.open('動画ファイルを削除しました'));
  }
}
