const sumResults = (resultsOne, resultsTwo) => {
  const results = {};
  const keys = Object.keys(resultsOne);
  keys.forEach((key) => {
    results[key] = resultsOne[key] + resultsTwo[key];
  });

  return results;
};

module.exports = { sumResults };
