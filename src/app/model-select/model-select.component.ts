import { Component, ElementRef, HostListener, input, model, signal,  } from '@angular/core';
import OpenAI from 'openai';
import { ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-model-select',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './model-select.component.html',
  styleUrl: './model-select.component.css'
})
export class ModelSelectComponent {
  models = input<OpenAI.Models.Model[]>([]);
  value = model<string | null>('');
  
  focused = signal<boolean>(false);
  

  constructor(private _eref: ElementRef) {}

  @HostListener('document:click', ['$event'])
  public onClick(event: MouseEvent) {
    if (!this._eref.nativeElement.contains(event.target)) {
      this.focused.set(false);
    }
  }

  buttonToggle() {
    this.focused.set(!this.focused());
  }

  selectModel(model: OpenAI.Models.Model) {
    this.value.set(model.id);
    this.focused.set(false);
  }
}
