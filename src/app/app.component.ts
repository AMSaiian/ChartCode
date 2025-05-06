import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {
  ConditionElement,
  ForLoopElement,
  InputElement,
  WhileLoopElement,
} from './common/models/element/element.model';
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
      this.state.initializeFlowchart();
      // this.mock();

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

  // private mock() {
  //   console.log(this.state);
  //   console.log(this.state.flowchart.getStateSnapshot());
  //   const scope = Object.values(this.state.flowchart.current$.value.scopes)[0];
  //   const element = new InputElement('x', true);
  //   this.state.flowchart.addElement(element, scope.id, scope.startId);
  //   console.log(this.state);
  //   console.log(this.state.flowchart.getStateSnapshot());
  //
  //   const condition = new ConditionElement(
  //     new BoolExpression('x', BoolExpressionType.GreaterThan, 'y')
  //   );
  //
  //   const forLoop = new ForLoopElement(new BoolExpression('x', BoolExpressionType.GreaterThan, 'y'));
  //   const forLoop2 = new WhileLoopElement(new BoolExpression('x', BoolExpressionType.GreaterThan, 'y'));
  //
  //
  //   this.state.flowchart.addElement(
  //     condition,
  //     scope.id,
  //     element.id
  //   );
  //   console.log(this.state);
  //   console.log(this.state.flowchart.getStateSnapshot());
  //
  //   this.state.flowchart.addElement(
  //     forLoop,
  //     scope.id,
  //     element.id
  //   );
  //
  //   this.state.flowchart.addElement(
  //     forLoop2,
  //     forLoop.scopeId,
  //     null
  //   );
  //
  //   this.state.flowchart.addElement(
  //     new InputElement('x', true),
  //     condition.positiveWayId!,
  //     null
  //   );
  //
  //   this.state.flowchart.addElement(
  //     new InputElement('x', true),
  //     condition.negativeWayId!,
  //     null
  //   );
  //
  //   this.state.flowchart.addElement(
  //     new InputElement('x', true),
  //     condition.negativeWayId!,
  //     null
  //   );
  //
  //   const condition2 = new ConditionElement(
  //     new BoolExpression('x', BoolExpressionType.GreaterThan, 'y')
  //   );
  //
  //   const condition21 = new ConditionElement(
  //     new BoolExpression('x', BoolExpressionType.GreaterThan, 'y')
  //   );
  //
  //   this.state.flowchart.addElement(condition2, condition.positiveWayId!, this.state.flowchart.getStateSnapshot().scopes[condition.positiveWayId!].startId)
  //
  //   this.state.flowchart.addElement(condition21, condition.positiveWayId!, this.state.flowchart.getStateSnapshot().scopes[condition.positiveWayId!].startId);
  //
  //   const condition31 = new ConditionElement(
  //     new BoolExpression('x', BoolExpressionType.GreaterThan, 'y')
  //   );
  //
  //   this.state.flowchart.addElement(condition31, condition21.positiveWayId!, this.state.flowchart.getStateSnapshot().scopes[condition21.positiveWayId!].startId);
  //
  //   this.state.flowchart.addElement(new InputElement('x'), condition31.negativeWayId!, this.state.flowchart.getStateSnapshot().scopes[condition31.negativeWayId!].startId);
  //
  //   const condition41 = new ConditionElement(
  //     new BoolExpression('x', BoolExpressionType.GreaterThan, 'y')
  //   );
  //
  //   this.state.flowchart.addElement(condition41, condition31.positiveWayId!, this.state.flowchart.getStateSnapshot().scopes[condition31.positiveWayId!].startId);
  //
  //   const condition51 = new ConditionElement(new BoolExpression('x', BoolExpressionType.GreaterThan, 'y'));
  //
  //   this.state.flowchart.addElement(condition51, condition41.positiveWayId!, this.state.flowchart.getStateSnapshot().scopes[condition41.positiveWayId!].startId);
  //   this.state.flowchart.addElement(new InputElement('x'), condition51.positiveWayId!, this.state.flowchart.getStateSnapshot().scopes[condition51.positiveWayId!].startId);
  //
  //
  //   this.state.flowchart.addElement(
  //     new InputElement('x', true),
  //     condition2.negativeWayId!,
  //     null
  //   );
  //
  //   const condition3 = new ConditionElement(
  //     new BoolExpression('x', BoolExpressionType.GreaterThan, 'y')
  //   );
  //
  //   this.state.flowchart.addElement(
  //     condition3,
  //     condition2.positiveWayId!,
  //     null
  //   );
  //
  //   this.state.flowchart.addElement(
  //     new InputElement('x', true),
  //     condition3.negativeWayId!,
  //     null
  //   )
  //
  //   this.state.flowchart.addElement(
  //     new InputElement('x', true),
  //     condition3.positiveWayId!,
  //     null
  //   )
  //
  //   const condition4 = new ConditionElement(new BoolExpression('x', BoolExpressionType.GreaterThan, 'y'));
  //   this.state.flowchart.addElement(condition4, condition.negativeWayId!, null);
  //
  //   const condition5 = new ConditionElement(new BoolExpression('x', BoolExpressionType.GreaterThan, 'y'))
  //   this.state.flowchart.addElement(condition5, condition4.positiveWayId!, null);
  //   this.state.flowchart.addElement(new InputElement('x', true), condition5.positiveWayId!, null);
  //
  //   console.log(this.state);
  //   console.log(this.state.flowchart.getStateSnapshot());
  // }
}
