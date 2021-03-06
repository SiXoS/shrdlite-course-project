/// <reference path="collections.ts" />
module AStar {
 
    //A StaticGraph contains a state of type S and a list of edges to its neighbours
    export interface Node<S> { 
        getChildren() : Edge<S>[];
        getState() : S;
        getHeuristic() : number;
    }

    export class StaticNode<S> implements Node<S> {
        
        constructor(public children : Edge<S>[], public h: Heuristic<S>, public state : S){}

        getChildren(){
            return this.children;
        }

        getState(){
            return this.state;
        }

        addEdge(edge : Edge<S>){
            this.children.push(edge);
        }

        getHeuristic() {
            return this.h(this.state);
        }
    }
 
    //A path contains the total cost of the path and a list of
    //visited nodes
    export class Path<S>{
        cost : number;
        labels : string[];
        constructor(private path : Node<S>[]){this.cost = 0; this.labels = [];}

        //Returns a new path containing the graph contained in edge
        //appended to the old path
        push(e:Edge<S>):Path<S>{
            var p = new Path(this.path.concat([e.end])); 
            p.cost = this.cost + e.cost;
            p.labels = this.labels.concat([e.label]);
            return p;
        }

        //Returns the cost of the path
        weight():number{
            return this.cost;
        }

        //Retrieves the last object on the path
        peek():Node<S> {
            return this.path[this.path.length - 1];
        }

        getPath() : Node<S>[] {
            return this.path;
        }

        getLabelPath() : string[] {
            return this.labels;
        }
    }

    export interface Goal<S> {
        (s : S):boolean;
    }

    export interface Heuristic<S> {
        (s : S) : number;
    }

    export interface Edge<S> {
        cost   : number;
        label? : string;
        end    : Node<S>;
    }

    //A* search function
    export function astarSearch<S>(graph:Node<S>,goal:Goal<S>) : Path<S>{
        var frontier = new collections.PriorityQueue<Path<S>>(function(a,b) {
            return (b.weight() + b.peek().getHeuristic()) -  (a.weight() + a.peek().getHeuristic())
        });
        frontier.add(new Path<S>([ graph]));

        var j : number = 0;
        var time : number = new Date().getTime();

        while(!frontier.isEmpty()) {
            var p = frontier.dequeue();
            j++;
            if(goal(p.peek().getState())) {
                alert("Number of iterations: " + j + "\nTime taken: " + (new Date().getTime() - time));
                return p;
            } else {
                if(new Date().getTime() - time > 4000) { throw new AStar.Error("Request timeout") }
                var children = p.peek().getChildren();
                for( var i = 0; i < children.length; i++ ) {
                    frontier.add( p.push(children[i]));
                }
            }
        }
    }

    export class Error implements Error {
        public name = "AStar.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }
    

    //Simple test
    export function test(){
        var heur = function(a){return 0;};

        var g1 = new StaticNode<number>([],heur,4);
        var g2 = new StaticNode([],heur,3);
        var g = new StaticNode<number>([{ cost: 1, end: g1},
                                        {cost: 1, end: g2}], heur, 0);
        g1.children.push({cost:1, end: g});

        var h = astarSearch<number>(g,function(a : number){return a == 3;})
        return h;
    }
    

    //Complicated test geolocations
    export function geoTest() : string[] {
        var heur = function(a : string){ //H(n)
            if(a == "gothenburg") {
                return Math.sqrt(4*4 + 15*15);
            } else if(a == "malmo"){
                return Math.sqrt(16*16+15*15);
            } else if(a == "varnamo"){
                return 32;
            } else if(a == "mellerud"){
                return 42-16;
            } else if(a == "boras") {
                return 14;
            } else if(a == "jonkoping") {
                return 15;
            } else if(a == "stockholm") {
                return 0;
            }
        };

        var l1 = new StaticNode<string>([], heur,"gothenburg");
        var l2 = new StaticNode<string>([], heur,"boras");
        var l3 = new StaticNode<string>([], heur,"jonkoping");
        var l4 = new StaticNode<string>([], heur,"stockholm");
        var l5 = new StaticNode<string>([], heur,"malmo");
        var l6 = new StaticNode<string>([], heur,"varnamo");
        var l7 = new StaticNode<string>([], heur,"mellerud");


        l1.addEdge({cost: 4,  end: l2});
        l2.addEdge({cost: 8,  end: l3});
        l4.addEdge({cost: 15, end: l2});
        l3.addEdge({cost: 16, end: l4});
        l3.addEdge({cost: 23, end: l1});
        l2.addEdge({cost: 42, end: l4});

        l1.addEdge({cost: 4,  end: l5});
        l1.addEdge({cost: 8,  end: l6});
        l3.addEdge({cost: 15, end: l7});
        l5.addEdge({cost: 16, end: l2});
        l6.addEdge({cost: 23, end: l3});
        l7.addEdge({cost: 42, end: l3});

        var res =  astarSearch<string>(l1, 
                                   function(a : string){
                                       return a == "stockholm";
                                   });
        var resPath : string[];
        resPath = [];
        for (var i = 0; i < res.getPath().length; i++) {
            var g = res.getPath()[i];
            resPath.push(g.getState());
        }
        return resPath;
    }

}
