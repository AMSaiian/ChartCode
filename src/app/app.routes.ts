import { Routes } from '@angular/router';
import { EditorComponent } from './domains/editor/editor.component';
import { WelcomeComponent } from './domains/welcome/welcome.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: 'welcome',
    component: WelcomeComponent
  },
  {
    path: 'editor/:id',
    component: EditorComponent
  }
];
