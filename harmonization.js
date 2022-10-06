const { arc, fsa } = require("./fsa");
const { production, cfg } = require("./cfg");
const { intersect } = require("./earley-intersection");

const C = "C";
const Dm = "Dm";
const Em = "Em";
const F = "F";
const G = "G";
const Am = "Am";
const Bdim = "Bdim";

const Tonic = "Tonic";
const TonicFunction = "TonicFunction";
const SubdominantFunction = "SubdominantFunction";
const DominantFunction = "DominantFunction";
const Phrase = "Phrase";
const PhraseMiddle = "PhraseMiddle";
const Composition = "Composition";

const chords = new Set([C, Dm, Em, F, G, Am, Bdim]);

const nonterminals = new Set([Tonic, TonicFunction, SubdominantFunction, DominantFunction, Phrase, PhraseMiddle, Composition]);

const start = Composition

const productions = [
  production(Composition, [Tonic]),
  production(Composition, [Tonic, PhraseMiddle, Tonic]),
  production(PhraseMiddle, [SubdominantFunction, DominantFunction]),
  production(Tonic, [C]),
  production(TonicFunction, [C]),
  production(TonicFunction, [Am]),
  production(TonicFunction, [Em]),
  production(SubdominantFunction, [F]),
  production(SubdominantFunction, [Dm]),
  production(SubdominantFunction, [Am]),
  production(DominantFunction, [G]),
  production(DominantFunction, [Em]),
  production(DominantFunction, [Bdim])
];

const harmonicGrammar = cfg(chords, nonterminals, start, productions);

const statesAroundChords = new Set([0, 1, 2, 3, 4]);
const arcs = new Set([
  arc(0, Em, 1),
  arc(0, C, 1),
  arc(1, Dm, 2),
  arc(1, G, 2),
  arc(1, F, 2),
  arc(2, Bdim, 3),
  arc(2, Dm, 3),
  arc(3, Am, 4),
  arc(3, C, 4)
]);
const initialStates = new Set([0]);
const acceptingStates = new Set([4]);

const chordOptions = fsa(chords, statesAroundChords, arcs, initialStates, acceptingStates);

const intersection = intersect(chordOptions, harmonicGrammar);

console.log(JSON.stringify(intersection, null, 2));