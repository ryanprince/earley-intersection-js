function item(production, intersectedStates) {
  const i = {
    production,
    intersectedStates,
  };
  const hash = JSON.stringify(i);
  return { ...i, hash };
}

module.exports = { item };