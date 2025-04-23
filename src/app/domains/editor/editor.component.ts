import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { NodeDto } from '../../common/dto/layout.dto';
import { ConditionElement, TerminalElement } from '../../common/models/element/element.model';
import { InstanceofPipe } from '../../common/pipes/instance-of.pipe';
import { AppStateService } from '../../common/services/app-state.service';
import { Observable, switchMap } from 'rxjs';

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
  nodes!: Observable<NodeDto[]>;

  getConditionPoints(width: number, height: number): string {
    const hw = width / 2;
    const hh = height / 2;
    return `${hw},0 ${width},${hh} ${hw},${height} 0,${hh}`;
  }

  ngOnInit(): void {
    this.nodes = this.state.selectedProcedureId$.pipe(
      switchMap(
        procedureId => this.state.getProcedureElements(procedureId)
      )
    )
  }

  protected readonly TerminalElement = TerminalElement;
  protected readonly ConditionElement = ConditionElement;
}
