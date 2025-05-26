import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AppCoordinator } from './common/services/app-coordinator';

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
  private readonly state: AppCoordinator = inject(AppCoordinator);
  private readonly router = inject(Router);

  ngOnInit(): void {

    try {
      this.state.selectedProcedureId$.subscribe(id => {
        if (id) {
          this.router.navigate(['/editor', id]);
        } else {
          this.router.navigate(['/welcome']);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  title = 'ChartCode';
}
