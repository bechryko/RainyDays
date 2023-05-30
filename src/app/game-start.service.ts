import { Injectable } from '@angular/core';

@Injectable({
   providedIn: 'root'
})
export class GameStartService {
   private paramsInitialized: boolean = false;
   private startingParams = {
      seed: '',
   };

   constructor() { }

   initStartingParams(seed: string) {
      if (this.paramsInitialized) return;
      this.paramsInitialized = true;
      this.startingParams.seed = seed;
   }
   getStartingParams() {
      this.paramsInitialized = false;
      return this.startingParams;
   }
}
