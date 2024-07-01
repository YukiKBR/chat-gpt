import { DialogRef } from '@angular/cdk/dialog';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import OpenAI from 'openai';
import { Store } from "tauri-plugin-store-api";

@Component({
  selector: 'app-setting-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './setting-dialog.component.html',
  styleUrl: './setting-dialog.component.css'
})
export class SettingDialogComponent implements OnInit {
  form = new FormGroup({
    apiKey: new FormControl(),
    model: new FormControl(),
  })

  store!: Store
  openai!: OpenAI;
  chatModels = signal<OpenAI.Models.Model[]>([]);
  modelList: OpenAI.Models.Model[] = []

  constructor(public dialogRef: DialogRef<SettingDialogComponent>) {}

  async ngOnInit() {
    this.store = new Store("/settings.bat");
    const apiKey = await this.store.get<string>('api-key');
    const model = await this.store.get<string>('model');
    this.form.patchValue({
      apiKey,
      model,
    })
    if(apiKey) {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      })
    }

    const models = await this.openai.models.list()
    this.chatModels.set(models.data);
  }

  async saveApikey() {
    const apikey = this.form.controls.apiKey.value;
    await this.store.set('api-key', apikey);
    const models = await this.openai.models.list()
    this.chatModels.set(models.data);
  }

  async saveChatModel() {
    const model = this.form.controls.model.value;
    await this.store.set('model', model);
  }
}
