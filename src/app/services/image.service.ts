import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import * as firebase from 'firebase';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Event } from '../interfaces/event';
import { Image, ImageWithUser } from '../interfaces/image';
import { User } from '../interfaces/user';
import { AuthService } from './auth.service';
import { EventService } from './event.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  uid: string;
  joinedEvents$: Observable<Event[]>;

  constructor(
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private authService: AuthService,
    private eventService: EventService,
    private userService: UserService
  ) {
    this.authService.user$.subscribe((user) => {
      this.uid = user?.uid;
    });
  }

  async uploadImages(eventId: string, files: File[]): Promise<void> {
    return Promise.all(
      files.map((file, index) => {
        const id = this.db.createId();
        const ref = this.storage.ref(`images/${id}-${index}`);
        return ref.put(file);
      })
    ).then(async (tasks) => {
      for (const task of tasks) {
        const imageId = this.db.createId();
        const imageURL = await task.ref.getDownloadURL();
        this.db.doc(`events/${eventId}/images/${imageId}`).set({
          imageId,
          uid: this.uid,
          imageURL,
          eventId,
          createAt: firebase.default.firestore.Timestamp.now(),
        });
      }
    });
  }

  getImages(eventId: string): Observable<Image[]> {
    return this.db
      .collection<Image>(`events/${eventId}/images`, (ref) =>
        ref.orderBy('createAt', 'desc')
      )
      .valueChanges();
  }

  getRecentImagesInJoinedEvents(uid: string): Observable<ImageWithUser[]> {
    return this.db
      .collection<Event>(`users/${uid}/joinedEvents`)
      .valueChanges()
      .pipe(
        switchMap((events: Event[]) => {
          if (events.length) {
            return combineLatest(
              events.map((event: Event) => this.getImages(event.eventId))
            );
          } else {
            return of(null);
          }
        }),
        map((imagesArray: Image[][]) => {
          if (imagesArray?.length) {
            return Array.prototype.concat.apply([], imagesArray);
          }
        }),
        switchMap((images: Image[]) => {
          if (images.length) {
            const unduplicatedUids: string[] = Array.from(
              new Set(images.map((image) => image.uid))
            );
            const users: Observable<User[]> = combineLatest(
              unduplicatedUids.map((userId) =>
                this.userService.getUserData(userId)
              )
            );
            return combineLatest([of(images), users]);
          } else {
            return of([]);
          }
        }),
        map(([images, users]) => {
          if (images?.length) {
            return images.map((image: Image) => {
              return {
                ...image,
                user: users.find((user: User) => image.uid === user?.uid),
              };
            });
          } else {
            return [];
          }
        })
      );
  }

  getImage(eventId: string, imageId: string): Observable<Image> {
    return this.db
      .doc<Image>(`events/${eventId}/images/${imageId}`)
      .valueChanges();
  }

  deleteImage(eventId: string, imageId: string): Promise<void> {
    return this.db.doc<Image>(`events/${eventId}/images/${imageId}`).delete();
  }
}
