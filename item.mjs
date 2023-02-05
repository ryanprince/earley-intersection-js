import { production } from './cfg.mjs';

export function item(production, intersectedStates) {
  const i = {
    production,
    intersectedStates,
  };
  const hash = JSON.stringify(i);
  return { ...i, hash };
}

export function getNextUnprocessedSymbol(i) {
  return i.production.rhs[i.intersectedStates.length - 1];
}

export function getLastIntersectedState(i) {
  return i.intersectedStates[i.intersectedStates.length - 1];
}

export function getFirstIntersectedState(i) {
  return i.intersectedStates[0];
}

export function isCompletelyIntersected(i) {
  return i.intersectedStates.length - 1 === i.production.rhs.length;
}

export function spansAcceptingPath(i, fsa) {
  return fsa.initialStates.has(getFirstIntersectedState(i)) && fsa.acceptingStates.has(getLastIntersectedState(i));
};

export function toProduction(i, cfg) {
  const lhs = `${i.production.lhs}_${getFirstIntersectedState(i)},${getLastIntersectedState(i)}`;
  const rhs = i.production.rhs.map(
    (symbol, index) => cfg.terminals.has(symbol)
      ? symbol
      : `${symbol}_${i.intersectedStates[index]},${i.intersectedStates[index + 1]}`
  );
  return production(lhs, rhs);
};