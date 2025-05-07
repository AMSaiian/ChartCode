import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
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
  private state: AppStateService = inject(AppStateService);
  private router = inject(Router);

  ngOnInit(): void {

    try {
      this.state.initializeFlowchart();

      this.state.selectedProcedureId$.subscribe(id => {
        if (id) {
          this.router.navigate(['/editor', id]);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  title = 'ChartCode';
}
