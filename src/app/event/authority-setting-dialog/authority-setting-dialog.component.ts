import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { combineLatest, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user';
import { EventService } from 'src/app/services/event.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-authority-setting-dialog',
  templateUrl: './authority-setting-dialog.component.html',
  styleUrls: ['./authority-setting-dialog.component.scss'],
})
export class AuthoritySettingDialogComponent implements OnInit {
  joinedUsers$: Observable<User[]>;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      eventId: string;
    },
    private dialogRef: MatDialogRef<AuthoritySettingDialogComponent>,
    private eventService: EventService,
    private userService: UserService
  ) {
    this.joinedUsers$ = this.eventService
      .getEventJoinedUids(this.data.eventId)
      .pipe(
        switchMap((userIds: { eventId: string; uid: string }[]) => {
          const user$$: Observable<
            User
          >[] = userIds.map((doc: { eventId: string; uid: string }) =>
            this.userService.getUserData(doc.uid)
          );
          return combineLatest(user$$);
        })
      );
  }

  ngOnInit(): void {}

  deleteEvent() {
    this.eventService.deleteEvent(this.data.eventId);
    this.dialogRef.close();
  }
}
