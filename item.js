function item(production, intersectedStates) {
  const i = {
    production,
    intersectedStates,
  };
  const hash = JSON.stringify(i);
  return { ...i, hash };
}

function getNextUnprocessedSymbol(i) {
  return i.production.rhs[i.intersectedStates.length - 1];
}

function getLastIntersectedState(i) {
  return i.intersectedStates[i.intersectedStates.length - 1];
}

function getFirstIntersectedState(i) {
  return i.intersectedStates[0];
}

module.exports = { item, getNextUnprocessedSymbol, getLastIntersectedState, getFirstIntersectedState };