import { AsyncPipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '../../../common/vm/layout.vm';
import { ElementType } from '../../../common/models/element/element.interface';
import { AppCoordinator } from '../../../common/services/app-coordinator';
import { ConditionShapeComponent } from '../../../components/shapes/condition/condition-shape.component';
import { ForLoopShapeComponent } from '../../../components/shapes/for-loop/for-loop-shape.component';
import { InputShapeComponent } from '../../../components/shapes/input/input-shape.component';
import { ProcessShapeComponent } from '../../../components/shapes/process/process-shape.component';

@Component({
  selector: 'app-sidebar',
  imports: [
    ButtonModule,
    ConditionShapeComponent,
    InputShapeComponent,
    ProcessShapeComponent,
    ForLoopShapeComponent,
    DividerModule,
    TranslatePipe,
    AsyncPipe
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  state = inject(AppCoordinator);
  translate = inject(TranslateService);

  isOpen = signal<boolean>(true);
  selectedType = toSignal(this.state.selectedElementType$.asObservable());

  constructor() {
    const onCloseEffect = effect(() => {
      const isOpen = this.isOpen();
      const selectedType = this.selectedType();

      if (!isOpen && selectedType) {
        this.state.clearElementTypeSelection();
      }
    });
  }

  onIsOpenClick() {
    this.isOpen.update((value) => !value);
  }

  onElementSelect(elementType: ElementType) {
    this.state.selectElementType(elementType);
  }

  protected readonly DEFAULT_WIDTH = DEFAULT_WIDTH;
  protected readonly DEFAULT_HEIGHT = DEFAULT_HEIGHT;
}
