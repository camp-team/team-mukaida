import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-exit-event-dialog',
  templateUrl: './exit-event-dialog.component.html',
  styleUrls: ['./exit-event-dialog.component.scss'],
})
export class ExitEventDialogComponent implements OnInit {
  isDeleteAllImages: false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      eventId: string;
    },
    private dialogRef: MatDialogRef<ExitEventDialogComponent>,
    private eventService: EventService,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {}

  async exitEvent() {
    const uid: string = this.authService.uid;
    const eventId: string = this.data.eventId;

    await this.eventService.exitEvent(eventId, uid);
    await this.userService.deleteJoinedEventId(uid, eventId);
    await this.userService.deleteJoinedEventId(uid, eventId);

    if (this.isDeleteAllImages) {
      // ここに画像削除処理実装予定
    }
    this.dialogRef.close();
    this.dialogRef.afterClosed().subscribe(() => {
      this.snackBar.open('イベントから退会しました');
      this.router.navigateByUrl('/');
    });
  }
}
