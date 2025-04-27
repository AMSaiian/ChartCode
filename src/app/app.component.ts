import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConditionElement, ForLoopElement, InputElement } from './common/models/element/element.model';
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

    try {


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

      const forLoop = new ForLoopElement(new BoolExpression('x', BoolExpressionType.GreaterThan, 'y'));
      const forLoop2 = new ForLoopElement(new BoolExpression('x', BoolExpressionType.GreaterThan, 'y'));

      // this.state.addElement(
      //   forLoop,
      //   scope.id,
      //   element.id
      // );
      //
      // this.state.addElement(
      //   forLoop2,
      //   forLoop.scopeId,
      //   null
      // );

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

      const condition2 = new ConditionElement(
        new BoolExpression('x', BoolExpressionType.GreaterThan, 'y')
      );

      const condition21 = new ConditionElement(
        new BoolExpression('x', BoolExpressionType.GreaterThan, 'y')
      );

      this.state.addElement(condition2, condition.positiveWayId!, this.state.getStateSnapshot().scopes[condition.positiveWayId!].startId)

      this.state.addElement(condition21, condition.positiveWayId!, this.state.getStateSnapshot().scopes[condition.positiveWayId!].startId);

      const condition31 = new ConditionElement(
        new BoolExpression('x', BoolExpressionType.GreaterThan, 'y')
      );

      this.state.addElement(condition31, condition21.positiveWayId!, this.state.getStateSnapshot().scopes[condition21.positiveWayId!].startId);

      this.state.addElement(new InputElement('x'), condition31.negativeWayId!, this.state.getStateSnapshot().scopes[condition31.negativeWayId!].startId);

      const condition41 = new ConditionElement(
        new BoolExpression('x', BoolExpressionType.GreaterThan, 'y')
      );

      this.state.addElement(condition41, condition31.positiveWayId!, this.state.getStateSnapshot().scopes[condition31.positiveWayId!].startId);

      const condition51 = new ConditionElement(new BoolExpression('x', BoolExpressionType.GreaterThan, 'y'));

      this.state.addElement(condition51, condition41.positiveWayId!, this.state.getStateSnapshot().scopes[condition41.positiveWayId!].startId);
      this.state.addElement(new InputElement('x'), condition51.positiveWayId!, this.state.getStateSnapshot().scopes[condition51.positiveWayId!].startId);


      this.state.addElement(
        new InputElement('x', true),
        condition2.negativeWayId!,
        null
      );

      const condition3 = new ConditionElement(
        new BoolExpression('x', BoolExpressionType.GreaterThan, 'y')
      );

      this.state.addElement(
        condition3,
        condition2.positiveWayId!,
        null
      );

      this.state.addElement(
        new InputElement('x', true),
        condition3.negativeWayId!,
        null
      )

      this.state.addElement(
        new InputElement('x', true),
        condition3.positiveWayId!,
        null
      )

      const condition4 = new ConditionElement(new BoolExpression('x', BoolExpressionType.GreaterThan, 'y'));
      this.state.addElement(condition4, condition.negativeWayId!, null);

      const condition5 = new ConditionElement(new BoolExpression('x', BoolExpressionType.GreaterThan, 'y'))
      this.state.addElement(condition5, condition4.positiveWayId!, null);
      this.state.addElement(new InputElement('x', true), condition5.positiveWayId!, null);

      console.log(this.state);
      console.log(this.state.getStateSnapshot());

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
