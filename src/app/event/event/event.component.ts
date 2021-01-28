import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { EventWithOwner } from 'src/app/interfaces/event';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { EventDeleteDialogComponent } from '../event-delete-dialog/event-delete-dialog.component';
import { ExitEventDialogComponent } from '../exit-event-dialog/exit-event-dialog.component';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
})
export class EventComponent implements OnInit {
  eventId: string;
  event$: Observable<EventWithOwner> = this.route.paramMap.pipe(
    switchMap((params) => {
      this.eventId = params.get('eventId');
      return this.eventServise.getEventWithOwner(this.eventId).pipe(take(1));
    })
  );
  eventInvitateURL = location.href.replace('event/', '');

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private eventServise: EventService,
    public authServise: AuthService
  ) {}

  ngOnInit(): void {}

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

  exitEventOpenDialog() {
    this.dialog.open(ExitEventDialogComponent, {
      width: '800px',
      height: '400px',
      autoFocus: false,
      restoreFocus: false,
      data: {
        eventId: this.eventId,
      },
    });
  }
}
