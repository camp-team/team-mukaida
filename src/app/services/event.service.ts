import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { switchMap, map, take } from 'rxjs/operators';
import { Event, EventWithOwner } from '../interfaces/event';
import * as firebase from 'firebase';
import { Image } from '../interfaces/image';
import { Password } from '../interfaces/password';
import { UserService } from './user.service';
import { CommentService } from './comment.service';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  constructor(
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private fns: AngularFireFunctions,
    private router: Router,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private commentService: CommentService
  ) {}

  async createEvent(
    event: Omit<Event, 'eventId'>,
    password: string
  ): Promise<void> {
    const id = this.db.createId();
    await this.db
      .doc<Event>(`events/${id}`)
      .set({
        eventId: id,
        ...event,
      })
      .then(() => {
        this.router.navigateByUrl(`event/${id}`);
      });
    await this.db.doc<Password>(`private/${id}`).set({
      eventId: id,
      password,
    });
  }

  async setThumbnailToStorage(eventId: string, file: string): Promise<string> {
    const resule = await this.storage
      .ref(`events/${eventId}`)
      .putString(file, firebase.default.storage.StringFormat.DATA_URL);
    return resule.ref.getDownloadURL();
  }

  async updateEvent(
    event: Omit<Event, 'eventId' | 'ownerId' | 'createdAt'>,
    eventId: string
  ): Promise<void> {
    return this.db
      .doc(`events/${eventId}`)
      .set(event, { merge: true })
      .then(() => {
        this.snackBar.open('イベント情報を更新しました。');
        this.router.navigateByUrl(`event/${eventId}`);
      })
      .catch(() => {
        this.snackBar.open('更新できませんでした。');
      });
  }

  async deleteEvent(eventId: string) {
    const callable = this.fns.httpsCallable('deleteEvent');

    return callable(eventId)
      .toPromise()
      .then(() => {
        this.router.navigateByUrl('/');
      });
  }

  getEvent(id: string): Observable<Event> {
    return this.db.doc<Event>(`events/${id}`).valueChanges();
  }

  getMyOwnedEvents(uid: string): Observable<Event[]> {
    if (!uid) {
      return of(null);
    }
    return this.db
      .collectionGroup<Event>('events', (ref) =>
        ref.where('ownerId', '==', uid)
      )
      .valueChanges();
  }

  getJoinedEvents(uid: string): Observable<Event[]> {
    if (!uid) {
      return of(null);
    }
    return this.db
      .collectionGroup<{
        eventId: string;
        uid: string;
      }>('joinedUids', (ref) => ref.where('uid', '==', uid))
      .valueChanges()
      .pipe(
        switchMap((joinedEvents) => {
          if (joinedEvents?.length) {
            return combineLatest(
              joinedEvents?.map((event) => this.getEvent(event.eventId))
            );
          } else {
            return of(null);
          }
        })
      );
  }

  getJoinedEventUsers(eventId: string): Observable<User[]> {
    return this.db
      .collection(`events/${eventId}/joinedUids`, (ref) =>
        ref.orderBy('createdAt', 'asc')
      )
      .valueChanges()
      .pipe(
        switchMap((joinedUids: any) => {
          if (joinedUids.length) {
            return combineLatest(
              joinedUids.map((ids) => this.userService.getUserData(ids.uid))
            );
          } else {
            return of(null);
          }
        })
      );
  }

  getOldestJoinedEventUser(eventId: string) {
    return this.db
      .collection(`events/${eventId}/joinedUids`, (ref) =>
        ref.orderBy('createdAt', 'asc').limit(1)
      )
      .valueChanges();
  }

  judgePassword(password: string, eventId: string) {
    const func = this.fns.httpsCallable('judgementPassword');
    return func({ password, eventId }).toPromise();
  }

  exitEvent(eventId: string, uid: string): Promise<void> {
    return this.db.doc(`events/${eventId}/joinedUids/${uid}`).delete();
  }

  getEventWithOwner(eventId: string): Observable<EventWithOwner> {
    return this.db
      .doc<Event>(`events/${eventId}`)
      .valueChanges()
      .pipe(
        switchMap((event) => {
          const user$ = this.userService.getUserData(event.ownerId);
          return combineLatest([of(event), user$]);
        }),
        map(([event, user]) => {
          return { ...event, user };
        })
      );
  }

  deleteNobodyEvents(): Observable<void> {
    return this.db
      .collectionGroup<Event>('events', (ref) =>
        ref.where('joinedUserCount', '==', false)
      )
      .valueChanges()
      .pipe(
        map((datas) => {
          datas.map((data) => {
            const id = data.eventId;
            const callable = this.fns.httpsCallable('deleteEvent');

            return callable(id);
          });
        })
      );
  }

  async getMyPostImageIds(eventId: string, uid: string): Promise<string[]> {
    const docs = await this.db
      .collection(`events/${eventId}/images`, (ref) =>
        ref.where('uid', '==', uid)
      )
      .valueChanges()
      .pipe(take(1))
      .toPromise();
    return docs.map((doc: Image) => doc.imageId);
  }

  async deleteImagesAndCommentsInTheEvent(eventId: string) {
    const data = {
      eventId,
    };
    const callable = this.fns.httpsCallable('deleteImagesInTheEvent');
    return callable(data).toPromise();
  }

  async transferEventOwner(targetId: string, eventId: string): Promise<void> {
    const event = {
      ownerId: targetId,
    };
    this.db.doc(`events/${eventId}`).set(event, { merge: true });
    return this.db.doc(`events/${eventId}/joinedUids/${targetId}`).delete();
  }

  async deleteJoinedEvent(eventId, userId): Promise<void> {
    return this.db.doc(`events/${eventId}/joinedUids/${userId}`).delete();
  }
}
