import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Event } from 'src/app/interfaces/event';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import * as firebase from 'firebase';
import { Location } from '@angular/common';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss'],
})
export class CreateEventComponent implements OnInit {
  scrWidth: any;
  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(40)]],
    password: ['', [Validators.required, Validators.maxLength(40)]],
    descliption: ['', [Validators.required, Validators.maxLength(40)]],
  });

  get titleControl() {
    return this.form.get('title') as FormControl;
  }
  get passwordControl() {
    return this.form.get('password') as FormControl;
  }
  get descliptionControl() {
    return this.form.get('descliption') as FormControl;
  }

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private authService: AuthService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getScreenSize();
  }

  getScreenSize() {
    this.scrWidth = window.innerWidth;
  }

  submit() {
    const formData = this.form.value;
    const eventValue: Omit<Event, 'eventId'> = {
      title: formData.title,
      descliption: formData.descliption,
      thumbnailURL: 'assets/images/image-card-sample01.jpg',
      ownerId: this.authService.uid,
      createdAt: firebase.default.firestore.Timestamp.now(),
      joinedUserCount: 1,
    };
    this.eventService.createEvent(eventValue, formData.password);
  }

  backLocation(): void {
    this.location.back();
  }
}
