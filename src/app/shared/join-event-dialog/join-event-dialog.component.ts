import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-join-event-dialog',
  templateUrl: './join-event-dialog.component.html',
  styleUrls: ['./join-event-dialog.component.scss'],
})
export class JoinEventDialogComponent implements OnInit {
  passwordForm = new FormControl('', [Validators.required]);
  user: User;
  user$: Observable<User> = this.authService.user$;
  isProcessing: boolean;
  isPossible: boolean;
  eventId: string;

  get password(): FormControl {
    return this.passwordForm.get('password') as FormControl;
  }

  constructor(
    private eventService: EventService,
    private router: Router,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      id: string;
    }
  ) {}

  ngOnInit(): void {}

  async submit(uid: string) {
    this.isPossible = await this.eventService.judgePassword(
      this.passwordForm.value,
      this.data.id
    );
    if (this.isPossible) {
      this.userService.joinEvent(this.data.id, uid);
      this.router
        .navigateByUrl(`event/${this.data.id}`)
        .finally(() => this.snackBar.open('イベントに参加しました'));
    } else {
      this.snackBar.open('パスワードが違います');
    }
  }
}
