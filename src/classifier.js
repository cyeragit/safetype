if (typeof window === 'undefined') {
  const utils = require('../src/utils.js');
  sliceStringFromLastDelimiter = utils.sliceStringFromLastDelimiter;
  sliceStringUpToFirstDelimiter = utils.sliceStringUpToFirstDelimiter;
}

const classifyCache = {
  lastKey: null,
  lastResult: null,
};

function classify(newText, supportedRecognizers, disabledTypes, ignored) {
  let matchesArray = [];
  for (const recognizer of supportedRecognizers) {
    if (disabledTypes.includes(recognizer.name)) {
      continue;
    }
    const regex = recognizer.positiveMatch;
    regex.lastIndex = 0;
    if (recognizer.kind === 'code') {
      // if (page.codeIgnored) {
      //   continue;
      // }
      // newText = unescapeHtml(newText);
    }
    const matches = [...newText.matchAll(regex)];

    if (
      recognizer.minCount !== undefined &&
      matches.length < recognizer.minCount
    ) {
      continue;
    }

    for (const match of matches) {
      if (
        match.length <=
        Math.max(
          recognizer.displayRegexGroupId,
          recognizer.validationRegexGroupId
        )
      ) {
        continue;
      }
      const matchedString = match[recognizer.displayRegexGroupId];

      // validate matching positiveFilter
      if (recognizer.positiveFilter) {
        recognizer.positiveFilter.lastIndex = 0;
        if (!recognizer.positiveFilter.test(matchedString)) {
          continue;
        }
      }

      // validate not matching negativeFilter
      if (recognizer.negativeFilter) {
        recognizer.negativeFilter.lastIndex = 0;
        if (recognizer.negativeFilter.test(matchedString)) {
          continue;
        }
      }

      const matchedValidationString = match[recognizer.validationRegexGroupId];
      if (recognizer.validators) {
        let negative = false;
        for (const validators of recognizer.validators) {
          if (!validators(matchedValidationString)) {
            negative = true;
            break;
          }
        }
        if (negative) {
          continue;
        }
      }

      let prevContext = '',
        nextContext = '';
      if (recognizer.positiveContext || recognizer.negativeContext) {
        prevContext = sliceStringFromLastDelimiter(
          recognizer.contextDelimiters,
          newText.slice(
            Math.max(0, match.index - recognizer.prevContextLength),
            match.index
          )
        );

        nextContext = sliceStringUpToFirstDelimiter(
          recognizer.contextDelimiters,
          newText.slice(
            match.index + matchedString.length,
            match.index + matchedString.length + recognizer.nextContextLength
          )
        );
      }

      let prevContextPositiveMatched = false,
        nextContextPositiveMatched = false;
      if (recognizer.positiveContext) {
        recognizer.positiveContext.lastIndex = 0;
        prevContextPositiveMatched =
          recognizer.positiveContext.test(prevContext);

        recognizer.positiveContext.lastIndex = 0;
        nextContextPositiveMatched =
          recognizer.positiveContext.test(nextContext);
      }

      let prevContextNegativeMatched = false,
        nextContextNegativeMatched = false;
      if (recognizer.negativeContext) {
        recognizer.negativeContext.lastIndex = 0;
        prevContextNegativeMatched =
          recognizer.negativeContext.test(prevContext);

        recognizer.negativeContext.lastIndex = 0;
        nextContextNegativeMatched =
          recognizer.negativeContext.test(nextContext);
      }

      const positiveContextMatched =
        prevContextPositiveMatched || nextContextPositiveMatched;
      const negativeContextMatched =
        prevContextNegativeMatched || nextContextNegativeMatched;

      if (recognizer.mustMatchPositiveContext && !positiveContextMatched) {
        continue;
      }

      if (recognizer.mustNotMatchNegativeContext && negativeContextMatched) {
        continue;
      }

      if (negativeContextMatched && !positiveContextMatched) {
        continue;
      }

      const start =
        match.index + match.input.slice(match.index).indexOf(matchedString);
      const end = start + matchedString.length;
      if (
        !ignored.has(matchedString) &&
        !ignored.has(newText.slice(start, end)) &&
        matchedString !== recognizer.anonymous
      ) {
        matchesArray.push({
          start,
          end,
          kind: recognizer.kind,
          dataType: recognizer.name,
          value: matchedString,
        });
      }
    }
  }

  const filteredMatches = matchesArray.filter((match, index) => {
    if (index === 0) {
      return true;
    }

    // if there's any overlap between the current match and any previous match, remove the current match
    for (let i = 0; i < index; i++) {
      if (
        match.start < matchesArray[i].end &&
        match.end > matchesArray[i].start
      ) {
        return false;
      }
    }

    return true;
  });

  filteredMatches.sort((a, b) => a.start - b.start);
  return filteredMatches;
}

function wrappedClassify(newText) {
  const disabledTypes = JSON.parse(
    localStorage.getItem('SafetypeLocalSettings')
  ).dataClassesDisabled;
  const cacheKey = JSON.stringify({
    newText,
    disabledTypes,
    codeIgnored: page.codeIgnored,
    ignored: Array.from(page.ignored),
  });
  if (classifyCache.lastKey === cacheKey) {
    return classifyCache.lastResult;
  }

  const matchesArray = classify(
    newText,
    supportedRecognizers,
    disabledTypes,
    page.ignored
  );
  classifyCache.lastKey = cacheKey;
  classifyCache.lastResult = matchesArray;
  return matchesArray;
}

if (typeof window === 'undefined') {
  module.exports = classify;
}
