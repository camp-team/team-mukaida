import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Event } from 'src/app/interfaces/event';
import { PostWithUser } from 'src/app/interfaces/post';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { ImageService } from 'src/app/services/image.service';
import { RouteParamsService } from 'src/app/services/route-params.service';
import { VideoService } from 'src/app/services/video.service';
import { JoinEventDialogComponent } from 'src/app/shared/join-event-dialog/join-event-dialog.component';
import { CreateEventDialogComponent } from './create-event-dialog/create-event-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  isLoading: boolean;
  uid: string;
  user$: Observable<User> = this.authService.user$;
  images$: Observable<PostWithUser[]>;

  eventId$: Observable<string> = this.route.paramMap.pipe(
    map((param) => {
      return param.get('id');
    })
  );

  myOwnedEvents$: Observable<Event[]> = this.user$.pipe(
    switchMap((user) => {
      const id = user?.uid;
      return this.eventService.getMyOwnedEvents(id);
    })
  );

  joinedEvents$: Observable<Event[]> = this.user$.pipe(
    switchMap((user) => {
      const uid = user?.uid;
      return this.eventService.getJoinedEvents(uid);
    })
  );

  videos$: Observable<PostWithUser[]>;

  postList$: Observable<PostWithUser[]>;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private eventService: EventService,
    private authService: AuthService,
    public imageService: ImageService,
    private routeService: RouteParamsService,
    public videoService: VideoService
  ) {}

  ngOnInit(): void {
    this.eventId$.subscribe((id) => {
      if (id) {
        this.openJoinEventDialog(id);
      }
    });
    this.user$.subscribe((user) => {
      this.uid = user?.uid;
    });
    this.postsInit();
  }

  async postsInit(): Promise<void> {
    this.isLoading = true;
    this.images$ = await this.imageService.getRecentImagesInJoinedEvents(
      this.uid
    );
    this.videos$ = await this.videoService.getRecentVideosInJoinedEvents(
      this.uid
    );

    this.postList$ = combineLatest([this.images$, this.videos$]).pipe(
      map(([images, videos]) => {
        if (images?.length && videos?.length) {
          return images.concat(videos);
        }
      }),
      tap(() => (this.isLoading = false))
    );
  }

  openJoinEventDialog(id?: string) {
    this.dialog.open(JoinEventDialogComponent, {
      panelClass: 'join-event-dialog',
      minWidth: '50%',
      autoFocus: false,
      restoreFocus: false,
      data: { id },
    });
  }

  openCreateEventDialog() {
    this.dialog.open(CreateEventDialogComponent, {
      maxWidth: '100vw',
      minWidth: '50%',
      autoFocus: false,
      restoreFocus: false,
    });
  }

  streamParams(id: string): void {
    this.routeService.eventIdSubject.next(id);
  }
}
