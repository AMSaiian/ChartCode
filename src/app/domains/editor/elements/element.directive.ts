import { computed, Directive, inject, input, OnInit, Signal } from '@angular/core';
import { IElement } from '../../../common/models/element/element.interface';
import { AppCoordinator } from '../../../common/services/app-coordinator';
import { ElementsModalService } from '../../../common/services/elements-modal.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Directive()
export abstract class ElementDirective<T extends IElement> {
  protected modalService = inject(ElementsModalService);
  protected state = inject(AppCoordinator);

  element = input.required<T>();
  showInfo!: Signal<string>;
  selectedId = toSignal(this.state.selectedElementId$.asObservable());
  isSelected!: Signal<boolean>;

  protected constructor() {
    this.isSelected = computed(() => {
      const element = this.element();
      const selectedId = this.selectedId();

      return element.id === selectedId;
    });

    this.showInfo = computed(() => {
      const element = this.element();

      return this.transformElementData(element);
    });
  }

  public onSelect() {
    this.state.selectElement(this.element().id);
  }

  abstract transformElementData(element: IElement): string
}
