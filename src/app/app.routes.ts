import { Routes } from '@angular/router';
import { EditorComponent } from './domains/editor/editor.component';

export const routes: Routes = [
  {
    path: 'editor/:id',
    component: EditorComponent
  }
];
