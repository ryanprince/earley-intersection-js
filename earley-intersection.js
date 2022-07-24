const { production, cfg: makeCfg } = require("./cfg");
const {
  item,
  getNextUnprocessedSymbol,
  getFirstIntersectedState,
  getLastIntersectedState,
  isCompletelyIntersected,
  spansAcceptingPath,
  toProduction
} = require("./item");

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
      .filter((i) => isCompletelyIntersected(i)
        && i.production.lhs === getNextUnprocessedSymbol(fromItem)
        && getFirstIntersectedState(i) === getLastIntersectedState(fromItem)
        && getFirstIntersectedState(i) !== getLastIntersectedState(i)
      )
      .map((i) => item(fromItem.production, [...fromItem.intersectedStates, getLastIntersectedState(i)]));
  const var2 = cfg.terminals.has(getNextUnprocessedSymbol(fromItem))
    ? []
    : [...activeItems, ...passiveItems]
      .filter((i) => isCompletelyIntersected(fromItem)
        && fromItem.production.lhs === getNextUnprocessedSymbol(i)
        && getFirstIntersectedState(fromItem) === getLastIntersectedState(i)
        && getFirstIntersectedState(fromItem) !== getLastIntersectedState(fromItem)
      )
      .map((i) => item(i.production, [...i.intersectedStates, getLastIntersectedState(fromItem)]));
  return [...var1, ...var2];
}

function deDuplicate(productions) {
  const seen = new Set();
  const result = [];

  productions.forEach((p) => {
    const hash = JSON.stringify(p);
    if (!seen.has(hash)) {
      seen.add(hash);
      result.push(p);
    }
  });

  return result;
}

// Returns a list of the completely intersected items that span from an initial state to an
// accepting state, along with all completely intersected items reachable from the rhs symbols
// of those items; i.e., the completely intersected start items with the items that comprise
// their sub-forest.
function pruneParseForest(completelyIntersectedItems, fsa) {

  // An index from each lhs nonterminal to a list of completely intersected items with that lhs.
  const lhsIndex = completelyIntersectedItems.reduce((index, i) => ({
    ...index,
    [i.production.lhs]: index[i.production.lhs] ? [...index[i.production.lhs], i] : [i]
  }), {});

  const seen = new Set();
  const prunedParseForest = [];

  const gatherItemsFrom = (startItem) => {
    if (seen.has(startItem.hash)) {
      return;
    }

    seen.add(startItem.hash);
    prunedParseForest.push(startItem);

    const nextItems = startItem.production.rhs.map(lhs => lhsIndex[lhs]?.flat() ?? []).flat();
    nextItems.forEach(gatherItemsFrom);
  }

  const initialItems = completelyIntersectedItems.filter((i) => spansAcceptingPath(i, fsa));
  initialItems.forEach(gatherItemsFrom);

  return prunedParseForest;
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

    const newItems = [
      ...predictions,
      ...sigmaScanResults,
      // ...epsilonScanResults,
      ...completions
    ];

    // Add new, unseen items to the queue.
    newItems.forEach((i) => {
      if (!seen.has(i.hash)) {

        // Track all new items in the seen set.
        seen.add(i.hash);

        // Enqueue new items.
        activeQueue.push(i);
      }
    })

    // Once we've finished processing an item, we keep a record of it and it won't be
    // processed again. Items in here that span from a start state to an end comprise the
    // parse forest and will become productions in the output CFG.
    passiveItems.push(activeItem);
  }

  // Find the completely intersected items.
  const parseForest = passiveItems.filter(isCompletelyIntersected);

  // Prune to productions that lead to accepting states.
  const prunedParseForest = pruneParseForest(parseForest, fsa);

  // Prepare the pruned parse forest as a new CFG.
  const newStart = 'S';
  const newStartProductions = deDuplicate(
    prunedParseForest
      .filter((i) => i.production.lhs === cfg.startNonterminal)
      .map((i) => production(newStart, toProduction(i, cfg).lhs))
  );
  const newProductions = [
    ...newStartProductions,
    ...prunedParseForest.map((i) => toProduction(i, cfg))
  ];
  const newNonterminals = new Set(newProductions.map(({ lhs }) => lhs));
  const intersectionCfg = makeCfg(cfg.terminals, newNonterminals, newStart, newProductions);

  // Return the new CFG.
  return intersectionCfg;
}

module.exports = { intersect };
