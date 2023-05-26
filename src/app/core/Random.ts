import seedrandom from 'seedrandom';

export class Random {
   constructor(seed: string) {
      seedrandom(seed, { global: true });
   }
   nextInt(max: number) {
      return this.nextIntRange(0, max);
   }
   nextIntRange(min: number, max: number) {
      return Math.floor(Math.random() * (max - min) + min);
   }
   nextBoolean() {
      return this.nextInt(2) == 1;
   }
   nextArrayElement(array: any[]) {
      return array[this.nextInt(array.length)];
   }
   nextChance(chance: number) {
      return Math.random() < chance;
   }
}
