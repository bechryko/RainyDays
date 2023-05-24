export interface GameMessage {
   type: string;
   data: any;
}

export interface InputMessage {
   type: string;
   data: any;
}

export interface GameStatus {
   isGameGoing: boolean;
   isPaused: boolean;
   selected: number;
   score: number;
   spawnTimer: number;
}
