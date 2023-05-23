enum RoadTypes {
   basicRoad,
   tunnel
}

export abstract class Road {
   connections: boolean[] = [false, false, false, false];
   constructor(public type: RoadTypes) { }
}

export class BasicRoad extends Road {
   constructor() {
      super(RoadTypes.basicRoad);
   }
}

export class Tunnel extends Road {
   constructor() {
      super(RoadTypes.tunnel);
   }
}
