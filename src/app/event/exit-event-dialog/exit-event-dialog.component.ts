import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { UserService } from 'src/app/services/user.service';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-exit-event-dialog',
  templateUrl: './exit-event-dialog.component.html',
  styleUrls: ['./exit-event-dialog.component.scss'],
})
export class ExitEventDialogComponent implements OnInit {
  isDeleteAllImagesAndComments: false;
  joinedUsers: Observable<User[]> = this.eventService.getJoinedEventUsers(
    this.data.eventId
  );

  transfarForm = new FormControl();
  selected = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      ownerId: string;
      eventId: string;
    },
    private dialogRef: MatDialogRef<ExitEventDialogComponent>,
    private eventService: EventService,
    private userService: UserService,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {}

  async exitEvent() {
    const uid: string = this.authService.uid;
    const eventId: string = this.data.eventId;
    const targetId = this.transfarForm.value.userId;

    if (this.transfarForm.value !== null) {
      const eventData = {
        ownerId: targetId,
      };
      this.eventService.transferEvenOwner(eventData, eventId);
    } else {
      console.log('false');
    }

    if (this.isDeleteAllImagesAndComments) {
      this.eventService.deleteImagesAndCommentsInTheEvent(eventId);
    }

    // this.dialogRef.close();
    // this.dialogRef.afterClosed().subscribe(() => {
    //   this.snackBar.open('イベントから退会しました');
    //   this.router.navigateByUrl('/');
    // });
  }
}
