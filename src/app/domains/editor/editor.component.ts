import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import { DEFAULT_ARROW_SIZE, DEFAULT_INSERT_RADIUS, EdgeDto, InsertionDto, NodeDto } from '../../common/dto/layout.dto';
import {
  AssignElement,
  ConditionElement,
  ForLoopElement,
  InputElement,
  ProcedureElement,
  TerminalElement,
  WhileLoopElement,
} from '../../common/models/element/element.model';
import { BoolExpression, BoolExpressionType } from '../../common/models/expression/expression.model';
import { InstanceofPipe } from '../../common/pipes/instance-of.pipe';
import { AppStateService } from '../../common/services/app-state.service';
import { ConditionShapeComponent } from '../../components/shapes/condition/condition-shape.component';
import { ForLoopShapeComponent } from '../../components/shapes/for-loop/for-loop-shape.component';
import { InputShapeComponent } from '../../components/shapes/input/input-shape.component';
import { ProcessShapeComponent } from '../../components/shapes/process/process-shape.component';
import { TerminalShapeComponent } from '../../components/shapes/terminal/terminal-shape.component';
import { WhileLoopShapeComponent } from '../../components/shapes/while-loop/while-loop-shape.component';

@Component({
  selector: 'app-editor',
  imports: [
    InstanceofPipe,
    NgIf,
    NgForOf,
    AsyncPipe,
    TerminalShapeComponent,
    ConditionShapeComponent,
    InputShapeComponent,
    ForLoopShapeComponent,
    WhileLoopShapeComponent,
    ProcessShapeComponent,
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent implements OnInit {
  state = inject(AppStateService);
  elements$!: Observable<{ nodes: NodeDto[], edges: EdgeDto[], insertions: InsertionDto[] }>;

  getConditionPoints(width: number, height: number): string {
    const hw = width / 2;
    const hh = height / 2;
    return `${hw},0 ${width},${hh} ${hw},${height} 0,${hh}`;
  }

  ngOnInit(): void {
    this.elements$ = this.state.selectedProcedureId$.pipe(
      switchMap(
        procedureId => this.state.getProcedureElements(procedureId)
      ),
      tap(x => console.log(x))
    )
  }

  protected readonly TerminalElement = TerminalElement;
  protected readonly ConditionElement = ConditionElement;
  protected readonly ProcedureElement = ProcedureElement;
  protected readonly ForLoopElement = ForLoopElement;

  public handleInsert(point: InsertionDto) {
    // const element = new AssignElement(new AssignExpression('x', '1', false));
    const element = new ConditionElement(new BoolExpression('x', BoolExpressionType.Equals, 'x'))
    this.state.addElement(element, point.scopeId, point.fromId);
  }

  protected readonly AssignElement = AssignElement;

  public deleteNode(id: string) {
    this.state.deleteElement(id);
  }

  protected readonly DEFAULT_ARROW_SIZE = DEFAULT_ARROW_SIZE;
  protected readonly DEFAULT_INSERT_RADIUS = DEFAULT_INSERT_RADIUS;
  protected readonly InputElement = InputElement;
  protected readonly WhileLoopElement = WhileLoopElement;
}
