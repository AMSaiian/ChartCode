import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConditionElement, InputElement } from './common/models/element/element.model';
import { BoolExpression, BoolExpressionType } from './common/models/expression/expression.model';
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
    this.state.initializeDefault();
    console.log(this.state);
    console.log(this.state.getStateSnapshot());
    const scope = Object.values(this.state.state$.value.scopes)[0];
    const element = new InputElement('x', true);
    this.state.addElement(element, scope.id, scope.startId);
    console.log(this.state);
    console.log(this.state.getStateSnapshot());

    const condition = new ConditionElement(
        new BoolExpression('x', BoolExpressionType.GreaterThan, 'y')
    );
    this.state.addElement(
      condition,
      scope.id,
      element.id
    );
    console.log(this.state);
    console.log(this.state.getStateSnapshot());

    this.state.addElement(
      new InputElement('x', true),
      condition.positiveWayId!,
      null
    );

    this.state.addElement(
      new InputElement('x', true),
      condition.negativeWayId!,
      null
    );

    this.state.addElement(
      new InputElement('x', true),
      condition.negativeWayId!,
      null
    );

    console.log(this.state);
    console.log(this.state.getStateSnapshot());

    this.state.selectedProcedureId$.subscribe(id => {
      if (id) {
        this.router.navigate(['/editor', id]);
      }
    });
  }

  title = 'ChartCode';
}
