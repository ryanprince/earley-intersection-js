const { production } = require('./cfg');

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

function isCompletelyIntersected(i) {
  return i.intersectedStates.length - 1 === i.production.rhs.length;
}

function toProduction(i, cfg) {
  const lhs = `${i.production.lhs}_${getFirstIntersectedState(i)},${getLastIntersectedState(i)}`;
  const rhs = i.production.rhs.map(
    (symbol, index) => cfg.terminals.has(symbol)
      ? symbol
      : `${symbol}_${i.intersectedStates[index]},${i.intersectedStates[index + 1]}`
  );
  return production(lhs, rhs);
}

module.exports = { item, getNextUnprocessedSymbol, getLastIntersectedState, getFirstIntersectedState, isCompletelyIntersected, toProduction };