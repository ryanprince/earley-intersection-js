const { production, cfg: makeCfg } = require("./cfg");
const { item, getNextUnprocessedSymbol, getFirstIntersectedState, getLastIntersectedState, isCompletelyIntersected, toProduction } = require("./item");

function computeAxioms(fsa, cfg) {
  return [...fsa.initialStates]
    .map((start) => [...cfg.productions]
      .filter(({ lhs }) => lhs === cfg.startNonterminal)
      .map((production) => item(production, [start]))
    ).flat();
}

function computePredictions(fromItem, cfg) {
  const nextUnprocessedSymbol = getNextUnprocessedSymbol(fromItem);
  const lastProcessedState = getLastIntersectedState(fromItem);
  return cfg.productions
    .filter(({ lhs }) => lhs === nextUnprocessedSymbol)
    .filter(({ lhs }) => cfg.nonterminals.has(lhs))
    .map((production) => item(production, [lastProcessedState]));
}

function computeSigmaScanResults(fromItem, fsa, cfg) {
  const nextUnprocessedSymbol = getNextUnprocessedSymbol(fromItem);
  const lastProcessedState = getLastIntersectedState(fromItem);
  return !cfg.terminals.has(nextUnprocessedSymbol)
    ? []
    : [...fsa.arcs]
      .filter(({ fromState, label }) => fromState === lastProcessedState && label === nextUnprocessedSymbol)
      .map(({ toState }) => item(fromItem.production, [...fromItem.intersectedStates, toState]));
}

function computeCompletions(fromItem, cfg, activeItems, passiveItems) {
  const var1 = cfg.terminals.has(getNextUnprocessedSymbol(fromItem))
    ? []
    : [...activeItems, ...passiveItems]
      .filter((i) => i.production.lhs === getNextUnprocessedSymbol(fromItem)
        && getFirstIntersectedState(i) === getLastIntersectedState(fromItem)
        && getFirstIntersectedState(i) !== getLastIntersectedState(i)
      )
      .map((i) => item(fromItem.production, [...fromItem.intersectedStates, getLastIntersectedState(i)]));
  const var2 = cfg.terminals.has(getNextUnprocessedSymbol(fromItem))
    ? []
    : [...activeItems, ...passiveItems]
      .filter((i) => fromItem.production.lhs === getNextUnprocessedSymbol(i)
        && getFirstIntersectedState(fromItem) === getLastIntersectedState(i)
        && getFirstIntersectedState(fromItem) !== getLastIntersectedState(fromItem)
      )
      .map((i) => item(i.production, [...i.intersectedStates, getLastIntersectedState(fromItem)]));
  return [...var1, ...var2];
}

function intersect(fsa, cfg) {
  // Compute the initial items and add them to the queue.
  const axioms = computeAxioms(fsa, cfg);

  const activeQueue = [...axioms];
  const passiveItems = [];

  // The seen set is used to prevent extra computation.
  const seen = new Set(activeQueue.map(({ hash }) => hash));

  while (activeQueue.length > 0) {
    const activeItem = activeQueue.pop();

    // Each new item advances a single logical step from the active item.
    const predictions = computePredictions(activeItem, cfg);
    const sigmaScanResults = computeSigmaScanResults(activeItem, fsa, cfg);
    // const epsilonScanResults = [];
    const completions = computeCompletions(activeItem, cfg, activeQueue, passiveItems);

    // Filter down to the generated items that we haven't seen before.
    const newItems = [
      ...predictions,
      ...sigmaScanResults,
      // ...epsilonScanResults,
      ...completions
    ].filter(({ hash }) => !seen.has(hash));

    // Track all new items in the seen set.
    newItems.forEach(({ hash }) => seen.add(hash));

    // Enqueue new items.
    activeQueue.push(...newItems);

    // Once we've finished processing an item, we keep a record of it and it won't be
    // processed again. Items in here that span from a start state to an end comprise the
    // parse forest and will become productions in the output CFG.
    passiveItems.push(activeItem);
  }

  // Find the completely intersected items.
  const parseForest = passiveItems.filter(isCompletelyIntersected);

  // Prepare the parse forest as a new CFG.
  const newStart = 'S';
  const newStartProductions = parseForest
    .filter((i) => i.production.lhs === cfg.startNonterminal)
    .map((i) => production(newStart, toProduction(i, cfg).lhs));
  const newProductions = [
    ...newStartProductions,
    ...parseForest.map((i) => toProduction(i, cfg))
  ];
  const newNonterminals = new Set(newProductions.map(({ lhs }) => lhs));
  const intersectionCfg = makeCfg(cfg.terminals, newNonterminals, newStart, newProductions);

  // Return the new CFG.
  return intersectionCfg;
}

module.exports = { intersect };
