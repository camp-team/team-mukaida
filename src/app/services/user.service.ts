import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private db: AngularFirestore,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  getUserData(uid: string): Observable<User> {
    return this.db.doc<User>(`users/${uid}`).valueChanges();
  }

  joinEvent(eventId: string, uid: string) {
    this.db.doc(`events/${eventId}/joinedUids/${uid}`).set({
      eventId,
      uid,
    });
    this.db.doc(`users/${uid}/joinedEvents/${eventId}`).set({ eventId });
  }

  async updateUser(user: Omit<User, 'createdAt'>) {
    await this.db.doc<User>(`users/${user.uid}`).update({
      ...user,
    });
    this.snackBar.open('ユーザー情報を更新しました');
    this.router.navigate(['/']);
  }
}
