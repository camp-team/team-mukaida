import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InvitationGuard } from '../guards/invitation.guard';
import { CreateEventComponent } from './home/create-event/create-event.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
  },
  {
    path: 'create-event',
    component: CreateEventComponent,
  },
  {
    path: ':id',
    component: HomeComponent,
    canActivate: [InvitationGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
