import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, effect, model, signal } from '@angular/core';
import { CommonModule, DATE_PIPE_DEFAULT_OPTIONS, DatePipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import Database from "tauri-plugin-sql-api";
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {Dialog, DialogModule} from '@angular/cdk/dialog'; 
import { MatTooltipModule } from '@angular/material/tooltip'
import { SettingDialogComponent } from './dialogs/setting-dialog/setting-dialog.component';
import OpenAI from 'openai';
import { Store } from 'tauri-plugin-store-api';
import { ChatComponent } from './chat/chat.component';
import hljs from 'highlight.js';
import { trigger } from '@angular/animations';
import { transition } from '@angular/animations';
import { style } from '@angular/animations';
import { animate } from '@angular/animations';
import { query } from '@angular/animations';
import { stagger } from '@angular/animations';
import { ModelSelectComponent } from './model-select/model-select.component';

type Chat = {
  msg: string,
  type: 'user' | 'bot',
  timestamp: Date
}

type ChatLog = {
  id: string,
  message: string,
  type: 'user' | 'bot',
  created_at: string,
  updated_at: string,
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, ReactiveFormsModule, DialogModule, DatePipe, ChatComponent, ModelSelectComponent, MatTooltipModule],
  providers: [
    {provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { locate: 'ja'}}
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        query('li', [
          style({ opacity: 0, transform: 'translateY(50%)' }),
          stagger(100, [
            animate('1s ease', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ])
      ]),
    ])
  ]
})
export class AppComponent  implements OnInit, AfterViewInit, OnDestroy {
  greetingMessage = "";
  db!: Database;
  inputLog = signal<Chat[]>([]);
  loading = signal<boolean>(false);
  models = signal<OpenAI.Models.Model[]>([]);
  selectedModel = model<string | null>(null);
  apiKey = signal<string | null>(null);
  input = model<string>('');
  openai!: OpenAI
  store: Store;

  @ViewChild('chatList', { static: false }) chatList!: ElementRef<HTMLElement>;

  constructor(
    private dialog: Dialog,
  ) {
    this.store = new Store("/settings.bat");
    this.store.get<string>('api-key').then((apiKey) => {
      if(apiKey) {
        this.openai = new OpenAI({ 
          apiKey,
          dangerouslyAllowBrowser: true,
         });
      }
    })

    hljs.highlightAll();
  }
  async ngOnInit() {
    this.store = new Store("/settings.bat");
    const apiKey = await this.store.get<string>('api-key');
    const model = await this.store.get<string>('model');
    this.selectedModel.set(model);

    this.apiKey.set(apiKey)

    if(apiKey) {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      })
    }

    const models = await this.openai.models.list()
    this.models.set(models.data.filter((model) => model.id.includes('gpt')));

    effect(async () => {
      await this.store.set('model', this.selectedModel());
    })
  }

  ngOnDestroy() {

    // this.store.set('model', this.selectedModel());
  }

  async ngAfterViewInit() {
    this.db = await Database.load("sqlite:mydatabase.db");
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    const prevMonth = now.toLocaleDateString();
    const result = await this.db.select<ChatLog[]>("SELECT * from chat_logs where created_at > datetime('now', '-1 month') order by created_at asc");
    this.inputLog.update((value) => {
      const data = result.map((db) => ({
        msg: db.message,
        type: db.type,
        timestamp: new Date(db.created_at),
      }))
      return value.concat(data)
    }) 

    setTimeout(() => {
      this.chatList.nativeElement.scrollTo(0, this.chatList.nativeElement.scrollHeight)
    }, 1000);
  }

  openDialog() {
    const dialogRef = this.dialog.open(SettingDialogComponent, {
      width: '100%',
      height: '100%'
    });
  }

  async send() {
    
    const model = await this.store.get<string>('model')
    if(!model) return;
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      messages: [{ role: 'user', content: this.input() }],
      model,
    };
    
    this.inputLog.update((value) => {
      const input = this.input();
      return value.concat({ msg: input, type: 'user', timestamp: new Date()});
    })

    this.loading.set(true);
    this.chatList.nativeElement.scrollTo(0, this.chatList.nativeElement.scrollHeight)
    const chatCompletion: OpenAI.Chat.ChatCompletion = await this.openai.chat.completions.create(params);

    if(chatCompletion.choices[0].message) {
      await this.db.execute(
        "INSERT into chat_logs (message, type) VALUES($1, $2)",
        [this.input(), 'user']
      )
      await this.db.execute(
        "INSERT into chat_logs (message, type) VALUES($1, $2)",
        [chatCompletion.choices[0].message.content!, 'bot']
      )
      this.inputLog.update((value) => {
        return value.concat({ msg: chatCompletion.choices[0].message.content!, type: 'bot', timestamp: new Date()});
      })
    } else {
      const result = await this.db.execute(
        "INSERT into chat_logs (message, type) VALUES($1, $2)",
        [this.input(), 'user']
      )
    }


    this.loading.set(false);
    this.input.set('')
    this.chatList.nativeElement.scrollTo(0, this.chatList.nativeElement.scrollHeight)
  }
}