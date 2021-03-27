import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { EventWithOwner } from 'src/app/interfaces/event';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { RouteParamsService } from 'src/app/services/route-params.service';
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
    public authServise: AuthService,
    private routeService: RouteParamsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.eventId = params.get('eventId');
      this.routeService.eventIdSubject.next(this.eventId);
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

  exitEventOpenDialog() {
    this.dialog.open(ExitEventDialogComponent, {
      autoFocus: false,
      restoreFocus: false,
      data: {
        eventId: this.eventId,
      },
    });
  }

  copyUrl(): void {
    this.snackBar.open('招待URLをコピーしました');
  }
}
