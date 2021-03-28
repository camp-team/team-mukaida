import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit {
  isImageDetailPage: boolean;
  constructor() {}

  ngOnInit(): void {}

  checkInner(event: any) {
    this.isImageDetailPage = event.isImageDetailPage;
  }
}
