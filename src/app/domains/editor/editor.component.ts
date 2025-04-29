import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { EdgeDto, InsertionDto, NodeDto } from '../../common/dto/layout.dto';
import {
  ConditionElement,
  ForLoopElement,
  ProcedureElement,
  TerminalElement,
} from '../../common/models/element/element.model';
import { InstanceofPipe } from '../../common/pipes/instance-of.pipe';
import { AppStateService } from '../../common/services/app-state.service';
import { Observable, switchMap, tap } from 'rxjs';
// import { EdgeDTO } from '../../common/utils/layout.utils';

@Component({
  selector: 'app-editor',
  imports: [
    InstanceofPipe,
    NgIf,
    NgForOf,
    AsyncPipe,
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
}
