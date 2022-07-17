const { arc, fsa } = require("./fsa");
const { production, cfg } = require("./cfg");
const { intersect } = require("./earley-intersection");

const black = Symbol("black");
const dog = Symbol("dog");
const the = Symbol("the");

// The alphabet that the FSA and CFG will share.
const sigma = new Set([black, dog, the]);

// Constructing the FSA.
const states = new Set([0, 1, 2, 3]);
const arcs = new Set([arc(0, the, 1), arc(1, black, 2), arc(2, dog, 3)]);
const initialStates = new Set([0]);
const acceptingStates = new Set([3]);

const myFsa = fsa(sigma, states, arcs, initialStates, acceptingStates);

console.log(myFsa);

// Constructing the CFG.
const S = Symbol("S");
const NP = Symbol("NP");
const VP = Symbol("VP");
const DT = Symbol("DT");
const JJ = Symbol("JJ");
const NN = Symbol("NN");

const nonterminals = new Set([S, NP, VP, DT, JJ, NN]);
const startNonterminal = S;
const productions = [
  production(S, [NP]),
  production(S, [NP, VP]),
  production(NP, [NN]),
  production(NP, [DT, NN]),
  production(NP, [DT, JJ, NN]),
  production(DT, [the]),
  production(JJ, [black]),
  production(NN, [dog])
];

const myCfg = cfg(sigma, nonterminals, startNonterminal, productions);

console.log(myCfg);

const intersection = intersect(myFsa, myCfg);

console.log(intersection);