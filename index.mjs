import { arc, fsa } from "./fsa.mjs";
import { production, cfg } from "./cfg.mjs";
import { intersect } from "./earley-intersection.mjs";

const black = "black";
const dog = "dog";
const the = "the";

// The alphabet that the FSA and CFG will share.
const sigma = new Set([black, dog, the]);

// Constructing the FSA.
const states = new Set([0, 1, 2, 3]);
const arcs = new Set([arc(0, the, 1), arc(0, the, 2), arc(1, black, 2), arc(2, dog, 3)]);
const initialStates = new Set([0]);
const acceptingStates = new Set([3]);

const myFsa = fsa(sigma, states, arcs, initialStates, acceptingStates);

console.log(myFsa);

// Constructing the CFG.
const S = "S";
const NP = "NP";
const VP = "VP";
const DT = "DT";
const JJ = "JJ";
const NN = "NN";

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

console.log(JSON.stringify(intersection, null, 2));