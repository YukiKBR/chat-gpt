import { Injectable } from '@angular/core';
import { Store } from 'tauri-plugin-store-api';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  store: Store;
  constructor() {
    this.store = new Store(".settings.bat");  
  }

  async get<T>(key: string) {
    return await this.store.get<T>(key);
  }

  async set(key: string, value: any) {
    return await this.store.set(key, value);
  }
}
