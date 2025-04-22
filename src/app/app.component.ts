import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputElement } from './common/models/element/element.model';
import { AppStateService } from './common/services/app-state.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ButtonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private service: AppStateService = inject(AppStateService);
  ngOnInit(): void {
    this.service.initializeDefault();
    console.log(this.service);
    console.log(this.service.getStateSnapshot());
    const scope = Object.values(this.service.state.value.scopes)[0];
    this.service.addElement(new InputElement('x', true), scope.id, null);
    console.log(this.service);
    console.log(this.service.getStateSnapshot());
  }

  title = 'ChartCode';
}
