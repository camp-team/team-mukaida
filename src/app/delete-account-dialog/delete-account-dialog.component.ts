import { Component, OnInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { EventService } from '../services/event.service';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-delete-account-dialog',
  templateUrl: './delete-account-dialog.component.html',
  styleUrls: ['./delete-account-dialog.component.scss'],
})
export class DeleteAccountDialogComponent implements OnInit {
  userId = this.authService.uid;
  constructor(
    private dialogRef: MatDialogRef<DeleteAccountDialogComponent>,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private eventServise: EventService,
    private router: Router,
    private fns: AngularFireFunctions
  ) {}

  ngOnInit(): void {}

  deleteJoinedEvents() {
    return this.eventServise
      .getJoinedEvents(this.userId)
      .pipe(
        map((datas) => {
          return datas.map((data) => {
            return data.eventId;
          });
        }),
        take(1)
      )
      .subscribe((datas) => {
        datas.forEach((eventId) => {
          return this.eventServise.exitEvent(eventId, this.userId);
        });
      });
  }

  deleteOwnerEvents() {
    this.eventServise
      .getMyOwnedEvents(this.userId)
      .pipe(
        map((datas) => {
          return datas.map((data) => {
            return data.eventId;
          });
        }),
        take(1)
      )
      .subscribe((datas) => {
        datas.forEach((eventId) => {
          return this.eventServise.exitEvent(eventId, this.userId);
        });
      });
  }

  async deleteUserAccount() {
    this.deleteJoinedEvents();
    this.deleteOwnerEvents();
    this.eventServise.deleteNobodyEvents();
    const callable = this.fns.httpsCallable('deleteAfUser');

    return callable(this.authService.uid)
      .toPromise()
      .then(() => {
        this.router.navigateByUrl('/welcome');
        this.authService.afAuth.signOut().then(() => {
          this.snackBar.open(
            'アカウントを削除しました。反映には時間がかかります。'
          );
        });
        this.dialogRef.close();
      });
  }
}
