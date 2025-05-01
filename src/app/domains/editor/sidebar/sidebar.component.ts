import { AsyncPipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '../../../common/dto/layout.dto';
import { ElementType } from '../../../common/models/element/element.interface';
import { AppStateService } from '../../../common/services/app-state.service';
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
    AsyncPipe,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  state = inject(AppStateService);
  translate = inject(TranslateService);

  isOpen = signal<boolean>(true);
  selectedType = toSignal(this.state.selectedElementType$.asObservable());

  constructor() {
    const onCloseEffect = effect(() => {
      const isOpen = this.isOpen();
      const selectedType = this.selectedType();

      if (!isOpen && selectedType) {
        this.state.selectedElementType$.next(null);
      }
    });
  }


  onIsOpenClick() {
    this.isOpen.update((value) => !value);
  }

  onElementSelect(elementType: ElementType) {
    if (this.state.selectedElementType$.value === elementType) {
      this.state.selectedElementType$.next(null);
    } else {
      this.state.selectedElementType$.next(elementType);
    }
  }

  protected readonly DEFAULT_WIDTH = DEFAULT_WIDTH;
  protected readonly DEFAULT_HEIGHT = DEFAULT_HEIGHT;
}
