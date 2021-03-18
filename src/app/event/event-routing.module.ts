import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditFormGuard } from '../guards/edit-form.guard';
import { EditComponent } from './edit/edit.component';
import { EventComponent } from './event/event.component';
import { ImageDetailComponent } from './event/image-detail/image-detail.component';
import { PostImagesComponent } from './post-images/post-images.component';
import { PostVideoComponent } from './post-video/post-video.component';

const routes: Routes = [
  {
    path: '',
    component: EventComponent,
  },
  {
    path: 'post-images',
    component: PostImagesComponent,
  },
  {
    path: 'edit',
    component: EditComponent,
    canDeactivate: [EditFormGuard],
  },
  {
    path: 'images/:imageId',
    component: ImageDetailComponent,
  },
  {
    path: 'post-video',
    component: PostVideoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventRoutingModule {}
