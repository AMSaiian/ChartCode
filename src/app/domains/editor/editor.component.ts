import { AsyncPipe, NgForOf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Observable, switchMap, tap } from 'rxjs';
import { DEFAULT_ARROW_SIZE, DEFAULT_INSERT_RADIUS, EdgeDto, InsertionDto, NodeDto } from '../../common/dto/layout.dto';
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
import { AppStateService } from '../../common/services/app-state.service';
import { LanguageSwitcherComponent } from '../../components/misc/language-switcher/language-switcher.component';
import { ConditionShapeComponent } from '../../components/shapes/condition/condition-shape.component';
import { ForLoopShapeComponent } from '../../components/shapes/for-loop/for-loop-shape.component';
import { InputShapeComponent } from '../../components/shapes/input/input-shape.component';
import { ProcessShapeComponent } from '../../components/shapes/process/process-shape.component';
import { TerminalShapeComponent } from '../../components/shapes/terminal/terminal-shape.component';
import { WhileLoopShapeComponent } from '../../components/shapes/while-loop/while-loop-shape.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import svgPanZoom from 'svg-pan-zoom';
import { SourceCodeSectionComponent } from './source-code-section/source-code-section.component';

@Component({
  selector: 'app-editor',
  imports: [
    InstanceofPipe,
    NgForOf,
    AsyncPipe,
    TerminalShapeComponent,
    ConditionShapeComponent,
    InputShapeComponent,
    ForLoopShapeComponent,
    WhileLoopShapeComponent,
    ProcessShapeComponent,
    SidebarComponent,
    LanguageSwitcherComponent,
    SourceCodeSectionComponent,
    ButtonModule,
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent implements OnInit, AfterViewInit {
  state = inject(AppStateService);

  selectedElementType$!: Observable<ElementType | null>;
  selectedElementId$!: Observable<string | null>;
  elements$!: Observable<{ nodes: NodeDto[], edges: EdgeDto[], insertions: InsertionDto[] }>;

  editorSceneRef = viewChild<ElementRef<SVGSVGElement>>('editorScene');
  sceneManipulator!: SvgPanZoom.Instance;

  ngOnInit(): void {
    this.elements$ = this.state.selectedProcedureId$.pipe(
      switchMap(
        procedureId => this.state.getProcedureElements(procedureId),
      ),
      tap(x => console.log(x))
    );

    this.selectedElementType$ = this.state.selectedElementType$.asObservable();
    this.selectedElementId$ = this.state.selectedElementId$.asObservable();
  }

  public onInsert(point: InsertionDto) {
    this.state.insert(point);
  }

  public onSelect(id: string) {
    this.state.selectElement(id);
  }

  public onDeleteSelected() {
    this.state.deleteSelected();
  }

  ngAfterViewInit(): void {
    this.sceneManipulator = svgPanZoom(this.editorSceneRef()!.nativeElement, {
      zoomEnabled: true,
      dblClickZoomEnabled: false,
      zoomScaleSensitivity: 0.3,
      fit: true,
      minZoom: 0.1,
      center: true,
      contain: true,
    });

    this.sceneManipulator.zoomOut();
  }

  exportSvg(): void {
    const svgElement = this.editorSceneRef()!.nativeElement;

    const clone = svgElement.cloneNode(true) as SVGSVGElement;

    clone.setAttribute('width', `${1580}`);
    clone.setAttribute('height', `${1598}`);
    clone.setAttribute('viewBox', `0 0 ${1580} ${1598}`);

    const controls = clone.querySelector('.svg-pan-zoom-control');
    if (controls) controls.remove();

    const viewport = clone.querySelector('.svg-pan-zoom_viewport') as SVGGElement;
    if (viewport) {
      viewport.removeAttribute('transform');
      viewport.removeAttribute('style');
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'flowchart.svg';
    link.click();

    URL.revokeObjectURL(url);
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
}
