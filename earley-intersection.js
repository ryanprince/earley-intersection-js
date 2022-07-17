const { production, cfg } = require("./cfg");
const { item } = require("./item");

function computeAxioms(fsa, cfg) {
  const axioms = [];
  for (let start of fsa.initalStates) {
    for (let accept of fsa.acceptingStates) {
      axioms.push(
        item(
          production(
            Symbol(
              `${cfg.startNonterminal.toString()}_${start.toString()}_${accept.toString()}`
            ),
            [cfg.startNonterminal]
          ),
          []
        )
      );
    }
  }
  return axioms;
}

function intersect(fsa, cfg) {
  const axioms = computeAxioms(fsa, cfg);
  console.log(axioms);
}

module.exports = { intersect };
