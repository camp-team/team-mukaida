import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Event } from '../interfaces/event';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private db: AngularFirestore,
    private router: Router,
    private fns: AngularFireFunctions
  ) {}

  getUserData(uid: string): Observable<User> {
    return this.db.doc<User>(`users/${uid}`).valueChanges();
  }

  joinEvent(eventId: string, uid: string) {
    this.db.doc(`events/${eventId}/joinedUids/${uid}`).set({
      eventId,
      uid,
    });
    this.db.doc(`users/${uid}/joinedEvents/${eventId}`).set({ eventId, uid });
  }

  getJoinedEventIds(uid: string): Observable<string[]> {
    return this.db
      .collection(`users/${uid}/joinedEvents`)
      .valueChanges()
      .pipe(map((evs) => evs.map((e: Event) => e.eventId)));
  }

  async updateUser(user: Omit<User, 'createdAt'>) {
    await this.db.doc<User>(`users/${user.uid}`).update({
      ...user,
    });
    this.router.navigate(['/']);
  }

  deleteJoinedEventId(uid: string, eventId: string): Promise<void> {
    const callable = this.fns.httpsCallable('deleteJoinedEventId');
    const data = {
      uid,
      eventId,
    };
    return callable(data).toPromise();
  }
}
