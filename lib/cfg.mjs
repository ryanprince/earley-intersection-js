// lhs: a nonterminal
// rhs: a list of symbols from the union of the noterminals and terminals
export function production(lhs, rhs) {
  return { lhs, rhs };
}

// terminals: Sigma, the set of terminal symbols. Equivalent to labels
//   in the FSA.
// nonterminals: the set of symbols that may appear in the left-hand side
//   of a production.
// startNonterminal: the element in the nonterminals that is the start
//   symbol for the grammar.
// productions: a set of productions.
export function cfg(terminals, nonterminals, startNonterminal, productions) {
  return {
    terminals,
    nonterminals,
    startNonterminal,
    productions
  };
}
