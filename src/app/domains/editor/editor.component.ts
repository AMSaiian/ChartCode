import { AsyncPipe, NgForOf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnInit, Signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TabsModule } from 'primeng/tabs';
import { Observable, switchMap } from 'rxjs';
import { DEFAULT_ARROW_SIZE, DEFAULT_INSERT_RADIUS, EdgeVm, InsertionVm, NodeVm } from '../../common/vm/layout.vm';
import { ElementType } from '../../common/models/element/element.interface';
import {
  AssignElement,
  ConditionElement,
  ForLoopElement,
  InputElement, OutputElement,
  TerminalElement,
  WhileLoopElement,
} from '../../common/models/element/element.model';
import { InstanceofPipe } from '../../common/pipes/instance-of.pipe';
import { AppCoordinator } from '../../common/services/app-coordinator';
import { LanguageSwitcherComponent } from '../../components/misc/language-switcher/language-switcher.component';
import { TerminalShapeComponent } from '../../components/shapes/terminal/terminal-shape.component';
import { AssignElementComponent } from './elements/assign-element/assign-element.component';
import { ConditionElementComponent } from './elements/condition-element/condition-element.component';
import { ForLoopElementComponent } from './elements/for-loop-element/for-loop-element.component';
import { InputElementComponent } from './elements/input-element/input-element.component';
import { OutputElementComponent } from './elements/output-element/output-element.component';
import { WhileLoopElementComponent } from './elements/while-loop-element/while-loop-element.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import svgPanZoom from 'svg-pan-zoom';
import { SourceCodeSectionComponent } from './source-code-section/source-code-section.component';

@Component({
  selector: 'app-editor',
  imports: [
    InstanceofPipe,
    NgForOf,
    TerminalShapeComponent,
    SidebarComponent,
    LanguageSwitcherComponent,
    SourceCodeSectionComponent,
    ButtonModule,
    InputElementComponent,
    OutputElementComponent,
    ConditionElementComponent,
    ForLoopElementComponent,
    WhileLoopElementComponent,
    AssignElementComponent,
    TranslatePipe,
    TabsModule,
    DividerModule,
    AsyncPipe
  ],
  templateUrl: './editor.component.html'
})
export class EditorComponent implements OnInit, AfterViewInit {
  state = inject(AppCoordinator);

  selectedElementType$!: Observable<ElementType | null>;
  selectedElementId$!: Observable<string | null>;
  elements!: Signal<{ nodes: NodeVm[], edges: EdgeVm[], insertions: InsertionVm[] }>;
  undoSteps$!: Observable<number>;
  redoSteps$!: Observable<number>;

  selectedProcedureId$!: Observable<string>;
  procedures$!: Observable<{ name: string; id: string }[]>;

  editorSceneRef = viewChild<ElementRef<SVGSVGElement>>('editorScene');
  sceneManipulator!: SvgPanZoom.Instance;

  constructor() {
    this.elements = toSignal(
      this.state.selectedProcedureId$.pipe(
        switchMap(
          procedureId => this.state.getProcedureElements(procedureId))
      ), { initialValue: { nodes: [], edges: [], insertions: [] } }
    );
  }

  ngOnInit(): void {
    this.selectedProcedureId$ = this.state.selectedProcedureId$;
    this.selectedElementType$ = this.state.selectedElementType$.asObservable();
    this.selectedElementId$ = this.state.selectedElementId$.asObservable();
    this.undoSteps$ = this.state.undoSteps$;
    this.redoSteps$ = this.state.redoSteps$;
    this.procedures$ = this.state.proceduresList$;
  }

  ngAfterViewInit(): void {
    this.sceneManipulator = svgPanZoom(this.editorSceneRef()!.nativeElement, {
      zoomEnabled: true,
      dblClickZoomEnabled: false,
      zoomScaleSensitivity: 0.3,
      fit: true,
      minZoom: 0.05,
      center: true,
      contain: true,
    });

    this.sceneManipulator.zoomOut();
  }

  public onInsert(point: InsertionVm) {
    this.state.insert(point);
  }

  public onDeleteSelected() {
    this.state.deleteSelected();
  }

  public onUndo() {
    this.state.undo()
  }

  public onRedo() {
    this.state.redo();
  }

  public async onSave() {
    await this.state.saveFlowchart();
  }

  public async onLoad() {
    await this.state.loadFlowchart();
  }

  public async onGenerateChart() {
    const svgElement = this.editorSceneRef()!.nativeElement;
    const clone = svgElement.cloneNode(true) as SVGSVGElement;
    const procedureElement = this.elements().nodes.find(
      x => x.element.id === this.state.flowchart.current$.value.selectedProcedureId
    );

    await this.state.exportFlowchartAsImage(clone, procedureElement!);
  }

  protected readonly TerminalElement = TerminalElement;
  protected readonly ConditionElement = ConditionElement;
  protected readonly ForLoopElement = ForLoopElement;
  protected readonly InputElement = InputElement;
  protected readonly WhileLoopElement = WhileLoopElement;
  protected readonly AssignElement = AssignElement;
  protected readonly DEFAULT_ARROW_SIZE = DEFAULT_ARROW_SIZE;
  protected readonly DEFAULT_INSERT_RADIUS = DEFAULT_INSERT_RADIUS;
  protected readonly OutputElement = OutputElement;


  public onSelectProcedure(procedureId: string) {
    this.state.selectProcedure(procedureId);
  }

  public onExit() {
    this.state.flowchart.resetState();
  }
}
