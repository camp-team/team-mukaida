import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { EventListCardComponent } from './event-list-card/event-list-card.component';
import { HomeRoutingModule } from './home-routing.module';
import { CreateEventDialogComponent } from './home/create-event-dialog/create-event-dialog.component';
import { HomeComponent } from './home/home.component';
import { SharedModule } from '../shared/shared.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RecentPostsComponent } from './recent-posts/recent-posts.component';
import { CreateEventComponent } from './home/create-event/create-event.component';
import { DefaultEventComponent } from './home/default-event/default-event.component';

@NgModule({
  declarations: [
    HomeComponent,
    CreateEventDialogComponent,
    EventListCardComponent,
    RecentPostsComponent,
    CreateEventComponent,
    DefaultEventComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTabsModule,
    SharedModule,
    MatSnackBarModule,
  ],
})
export class HomeModule {}
