import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Event } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { RouteParamsService } from 'src/app/services/route-params.service';
import { UserService } from 'src/app/services/user.service';
import { AuthoritySettingDialogComponent } from '../authority-setting-dialog/authority-setting-dialog.component';
import { EventDeleteDialogComponent } from '../event-delete-dialog/event-delete-dialog.component';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
})
export class EventComponent implements OnInit {
  uid: string;
  event$: Observable<Event>;
  joinedUsers$: Observable<User[]>;
  eventId: string;
  eventInvitateURL = location.href.replace('event/', '');
  ownerId: string;
  ownerAvatarURL: string;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private eventService: EventService,
    private authServise: AuthService,
    private userService: UserService,
    private routeService: RouteParamsService
  ) {
    this.authServise.user$.subscribe((user) => {
      this.uid = user.uid;
    });
    this.route.paramMap.subscribe((params) => {
      this.eventId = params.get('eventId');
      this.event$ = this.eventService.getEvent(this.eventId);
      this.event$.subscribe((event) => {
        this.ownerId = event.ownerId;
        this.getUserAvatarURL(this.ownerId);
      });

      this.joinedUsers$ = this.eventService
        .getEventJoinedUids(this.eventId)
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

      this.routeService.eventIdSubject.next(
        (params && this.eventId) || undefined
      );
    });
  }

  ngOnInit(): void {}

  getUserAvatarURL(uid: string) {
    this.userService.getUserData(uid).subscribe((user) => {
      this.ownerAvatarURL = user.avatarURL;
    });
  }

  openDeleteEventDialog() {
    this.dialog.open(EventDeleteDialogComponent, {
      width: '460px',
      autoFocus: false,
      restoreFocus: false,
      data: {
        eventId: this.eventId,
      },
    });
  }

  openAuthoritySettingDialog() {
    this.dialog.open(AuthoritySettingDialogComponent, {
      width: '460px',
      autoFocus: false,
      restoreFocus: false,
      data: {
        eventId: this.eventId,
      },
    });
  }
}
