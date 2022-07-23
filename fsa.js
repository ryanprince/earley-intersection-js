function arc(fromState, label, toState) {
  return Object.freeze({
    fromState,
    label,
    toState
  });
}

// labels: Sigma, the set of words. Equivalent to terminals in the CFG.
// states: the set of states.
// arcs: the set of arcs.
// initialStates: the subset of states that are entry points into the FSA.
// acceptingStates: the subset of states that are accepting states for the FSA.
function fsa(labels, states, arcs, initialStates, acceptingStates) {
  return Object.freeze({
    labels,
    states,
    arcs,
    initialStates,
    acceptingStates
  });
}

module.exports = { arc, fsa };
