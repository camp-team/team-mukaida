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

  async uploadVideo(eventId: string, file: File, uid: string): Promise<void> {
    const id = this.db.createId();
    const result = this.storage.ref(`videos/${eventId}/${id}`).put(file);
    const videoURL = await (await result).ref.getDownloadURL();
    console.log(videoURL);

    await result.then(() => {
      const videoId = this.db.createId();
      this.db
        .doc(`events/${eventId}/videos/${videoId}`)
        .set({
          videoId,
          uid,
          videoURL,
          eventId,
          createdAt: firebase.default.firestore.Timestamp.now(),
        })
        .then(() => this.snackBar.open('ファイルをアップロードはじめました'))
        .finally(() => this.snackBar.open('アップロードが完了しました'));
    });
  }
}
