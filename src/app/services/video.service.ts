import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as firebase from 'firebase';
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
      .putString(image);
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
}
