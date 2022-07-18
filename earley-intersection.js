const { production, cfg } = require("./cfg");
const { item } = require("./item");

function computeAxioms(fsa, cfg) {
  return [...fsa.initalStates]
    .map((start) => [...cfg.productions]
      .filter(({ lhs }) => lhs === cfg.startNonterminal)
      .map((production) => item(production, [start]))
    ).flat();
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
    const predictions = [];
    const sigmaScanResults = [];
    const epsilonScanResults = [];
    const completions = [];

    // Filter down to the generated items that we haven't seen before.
    const newItems = [
      ...predictions,
      ...sigmaScanResults,
      ...epsilonScanResults,
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

  // Find the items that span from a start state to an end one.

  // Convert them to a new CFG.

  // Return the new CFG.
}

module.exports = { intersect };
