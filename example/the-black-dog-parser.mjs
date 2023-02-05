import { arc, fsa } from '../lib/fsa.mjs';
import { production, cfg } from '../lib/cfg.mjs';
import { intersect } from '../lib/earley-intersection.mjs';

// The example outlined in Dr. Aziz's notes.
// The parse tree represents two valid parses:
//   - the dog
//   - the black dog
export function parseTheBlackDog() {
    const black = 'black';
    const dog = 'dog';
    const the = 'the';

    // The alphabet that the FSA and CFG will share.
    const sigma = new Set([black, dog, the]);

    // Constructing the FSA.
    const states = new Set([0, 1, 2, 3]);
    const arcs = new Set([arc(0, the, 1), arc(0, the, 2), arc(1, black, 2), arc(2, dog, 3)]);
    const initialStates = new Set([0]);
    const acceptingStates = new Set([3]);

    const myFsa = fsa(sigma, states, arcs, initialStates, acceptingStates);

    // Constructing the CFG.
    const S = 'S';
    const NP = 'NP';
    const VP = 'VP';
    const DT = 'DT';
    const JJ = 'JJ';
    const NN = 'NN';

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

    const intersection = intersect(myFsa, myCfg);

    return intersection;
}