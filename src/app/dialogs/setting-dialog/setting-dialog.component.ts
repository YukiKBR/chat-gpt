import { DialogRef } from '@angular/cdk/dialog';
import { Component, OnInit } from '@angular/core';
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
  })

  store!: Store
  openai!: OpenAI;

  constructor(public dialogRef: DialogRef<SettingDialogComponent>) {}

  async ngOnInit() {
    this.store = new Store("/settings.bat");
    const apiKey = await this.store.get<string>('api-key');
    this.form.patchValue({
      apiKey,
    })
    if(apiKey) {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      })
    }
  }

  async saveApikey() {
    const apikey = this.form.controls.apiKey.value;
    await this.store.set('api-key', apikey);
  }

}
