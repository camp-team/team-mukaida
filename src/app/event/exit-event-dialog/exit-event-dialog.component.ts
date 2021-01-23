import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-exit-event-dialog',
  templateUrl: './exit-event-dialog.component.html',
  styleUrls: ['./exit-event-dialog.component.scss'],
})
export class ExitEventDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      eventId: string;
    },
    private dialogRef: MatDialogRef<ExitEventDialogComponent>
  ) {}

  ngOnInit(): void {}

  deleteImageAll(checked: Event) {
    console.log(checked);
  }
}
