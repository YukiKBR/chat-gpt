import { Pipe, PipeTransform } from '@angular/core';
import {marked} from 'marked';
import hljs, { HighlightOptions} from 'highlight.js'
import { DomSanitizer } from '@angular/platform-browser';
@Pipe({
  name: 'md2html',
  standalone: true
})
export class Md2htmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, ...args: unknown[]) {
    if (value && value.length > 0) {
      return marked(value, {})
    }
    return value;
  }

}
