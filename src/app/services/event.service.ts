import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import * as firebase from 'firebase';
import { Event, EventWithOwner } from '../interfaces/event';
import { Password } from '../interfaces/password';
import { UserService } from './user.service';

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
    private userService: UserService
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
    event: Omit<Event, 'eventId' | 'ownerId' | 'createAt'>,
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
          if (joinedEvents.length) {
            return combineLatest(
              joinedEvents.map((event) => this.getEvent(event.eventId))
            );
          } else {
            return of(null);
          }
        })
      );
  }

  getEventJoinedUids(
    eventId: string
  ): Observable<{ eventId: string; uid: string }[]> {
    return this.db
      .collection<{ eventId: string; uid: string }>(
        `events/${eventId}/joinedUids`
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
}
