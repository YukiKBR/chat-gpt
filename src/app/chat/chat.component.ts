import { AsyncPipe } from '@angular/common';
import { Component, computed, input,ViewEncapsulation } from '@angular/core';
import { Marked  } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js';

import 'highlight.js/styles/github-dark.min.css';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ChatComponent {
  marked: Marked;
  constructor() {
    this.marked = new Marked(
      markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code, lang, info) {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext';
          return hljs.highlightAuto(code, [lang]).value;
        }
      })
    );

  }
  message = input<string>();

  md2html = computed(async () => {
    const html = await this.marked.parse(this.message() ?? '', { 
    });
    return html;
  });
} 
