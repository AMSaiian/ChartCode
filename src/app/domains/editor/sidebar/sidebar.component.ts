import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '../../../common/dto/layout.dto';
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
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isOpen: boolean = false;

  public onIsOpenClick() {
    this.isOpen = !this.isOpen;
  }

  protected readonly DEFAULT_WIDTH = DEFAULT_WIDTH;
  protected readonly DEFAULT_HEIGHT = DEFAULT_HEIGHT;
}
