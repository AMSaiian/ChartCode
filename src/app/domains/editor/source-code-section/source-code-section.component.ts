import { Component, signal } from '@angular/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-source-code-section',
  imports: [
    Button,
  ],
  templateUrl: './source-code-section.component.html',
  styleUrl: './source-code-section.component.css'
})
export class SourceCodeSectionComponent {
  isOpen = signal<boolean>(false);

  onIsOpenClick() {
    this.isOpen.update((value) => !value);
  }
}
