import { Component, ElementRef, HostListener, OnInit, input, model, signal } from '@angular/core';
import OpenAI from 'openai';
import { ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { StoreService } from '../store.service';

@Component({
  selector: 'app-model-select',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './model-select.component.html',
  styleUrl: './model-select.component.css'
})
export class ModelSelectComponent implements OnInit {
  models = input<OpenAI.Models.Model[]>([]);
  value = model<string | null>('');
  focused = signal<boolean>(false);

  constructor(private _eref: ElementRef, private store: StoreService) { }

  async ngOnInit() {
    const model = await this.store.get<string | null>('model');
    this.value.set(model ?? null);
  }

  @HostListener('document:click', ['$event'])
  public onClick(event: MouseEvent) {
    if (!this._eref.nativeElement.contains(event.target)) {
      this.focused.set(false);
    }
  }

  buttonToggle() {
    this.focused.set(!this.focused());
  }

  async selectModel(model: OpenAI.Models.Model) {
    this.value.set(model.id);
    await this.store.set('model', model.id);
    this.focused.set(false);
  }
}
