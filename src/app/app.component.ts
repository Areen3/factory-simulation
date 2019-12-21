import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  styles: [
    `
      .ui-g div {
        background-color: #cce4f7;
        text-align: center;
        color: #333333;
        border: 1px solid #e0eefa;
      }
    `
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'factory-simulation';
}
