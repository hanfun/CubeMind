declare module 'cubejs' {
  type State={cp:number[];co:number[];ep:number[];eo:number[]};
  interface CubeInstance {
    asString():string;
    move(algorithm:string):CubeInstance;
    isSolved():boolean;
    solve(maxDepth?:number):string;
    toJSON():State;
    clone():CubeInstance;
  }
  const Cube: {
    new():CubeInstance;
    fromString(input:string):CubeInstance;
    initSolver():void;
    inverse(input:string):string;
  };
  export default Cube;
}
