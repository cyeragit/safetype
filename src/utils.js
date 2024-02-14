function formatSpaces(str) {
  return str.replace(/ /g, function (match, offset, string) {
    if (
      offset === 0 ||
      string[offset - 1] === '&' ||
      string[offset - 1] === '#'
    ) {
      // don't replace leading spaces, or spaces that are already part of an entity
      return ' ';
    } else {
      // replace with a non-breaking space
      return '&nbsp;';
    }
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>"'\/]/g, function (char) {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '/':
        return '&#x2F;';
      default:
        return char;
    }
  });
}

function unescapeHtml(str) {
  return str.replace(/(&amp;|&lt;|&gt;|&#x2F;)/g, function (char) {
    switch (char) {
      case '&amp;':
        return '&';
      case '&lt;':
        return '<';
      case '&gt;':
        return '>';
      case '&#x2F;':
        return '/';
      default:
        return char;
    }
  });
}

function replaceAll(str, search, replacement) {
  return str.replace(new RegExp(search, 'g'), replacement);
}

function applyStyles(element, styles) {
  if (element) {
    for (const property in styles) {
      element.style[property] = styles[property];
    }
  }
}

function getLocations(spans) {
  return spans.map((spanElement) => {
    const parentDiv = spanElement.parentElement;
    const spanRect = spanElement.getBoundingClientRect();
    const parentRect = parentDiv.getBoundingClientRect();

    const offsetX = parentDiv.scrollLeft;
    const offsetY = parentDiv.scrollTop;

    const x = spanRect.left - parentRect.left + offsetX;
    const y = spanRect.top - parentRect.top + offsetY;

    const width = spanRect.width;
    const height = spanRect.height;
    return { x, y, width, height };
  });
}

function getMouseCoordinatesRelativeToTextarea(chatOverlay, event) {
  const markerRect = chatOverlay.getBoundingClientRect();
  const x = event.clientX - markerRect.left + chatOverlay.scrollLeft;
  const y = event.clientY - markerRect.top + chatOverlay.scrollTop;
  return { x, y };
}

function getLocalSetting(settingName) {
  let allLocalSettings = JSON.parse(
    localStorage.getItem('SafetypeLocalSettings')
  );
  if (!allLocalSettings) {
    handlers.initializeSettings();
    allLocalSettings = JSON.parse(
      localStorage.getItem('SafetypeLocalSettings')
    );
  }
  return allLocalSettings[settingName];
}

function getSessionSetting(settingName) {
  let allSessionSettings = JSON.parse(
    sessionStorage.getItem('SafetypeSessionSettings')
  );
  if (!allSessionSettings) {
    handlers.initializeSettings();
    allSessionSettings = JSON.parse(
      sessionStorage.getItem('SafetypeSessionSettings')
    );
  }
  return allSessionSettings[settingName];
}

function getStyle(styleObject) {
  return Object.entries(styleObject)
    .map(([key, value]) => {
      const cssPropertyName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssPropertyName}: ${value}`;
    })
    .join('; ');
}

function setHoverColors(element, styleKind, color1, color2) {
  element.onmouseover = function () {
    element.style[styleKind] = color1;
  };
  element.onmouseout = function () {
    element.style[styleKind] = color2;
  };
}

function loadSvgSync(filename) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', chrome.runtime.getURL(filename), false);
  xhr.send(null);

  if (xhr.status === 200) {
    var parser = new DOMParser();
    var svgDoc = parser.parseFromString(xhr.responseText, 'image/svg+xml');
    return svgDoc.documentElement.outerHTML;
  } else {
    return null;
  }
}

function loadGoogleFont(fontName, weights) {
  const fontLink = document.createElement('link');
  fontLink.href = `https://fonts.googleapis.com/css?family=${fontName.replace(
    ' ',
    '+'
  )}:${weights.join(',')}&display=swap`;
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);
}

function sliceStringFromLastDelimiter(delimiters, str) {
  let lastDelimiterIndex = -1;

  const lineBreakDelimiters = ['\n', '\r'];
  const preLineBreakDelimiters = [':', '-'];
  for (let i = 0; i < delimiters.length; i++) {
    const delimiterIndex = str.lastIndexOf(delimiters[i]);
    if (delimiterIndex === -1) {
      continue;
    }
    if (lineBreakDelimiters.includes(delimiters[i])) {
      let negative = false;
      for (const preLineDel of preLineBreakDelimiters) {
        const preLineDelimiterIndex = str.lastIndexOf(
          preLineDel,
          delimiterIndex - 1
        );
        const strFromPreLine = str.slice(
          preLineDelimiterIndex + 1,
          delimiterIndex
        );
        if (new RegExp('^\\s*$').test(strFromPreLine)) {
          negative = true;
          break;
        }
      }
      if (negative) {
        continue;
      }
    }
    if (delimiterIndex > lastDelimiterIndex) {
      lastDelimiterIndex = delimiterIndex;
    }
  }

  if (lastDelimiterIndex === -1) {
    return str;
  } else {
    return str.slice(lastDelimiterIndex + 1);
  }
}

function sliceStringUpToFirstDelimiter(delimiters, str) {
  let firstDelimiterIndex = -1;

  for (let i = 0; i < delimiters.length; i++) {
    const delimiterIndex = str.indexOf(delimiters[i]);
    if (
      delimiterIndex !== -1 &&
      (firstDelimiterIndex === -1 || delimiterIndex < firstDelimiterIndex)
    ) {
      firstDelimiterIndex = delimiterIndex;
    }
  }

  if (firstDelimiterIndex === -1) {
    return str;
  } else {
    return str.slice(0, firstDelimiterIndex);
  }
}

function hide(elements) {
  for (const element of elements) {
    if (typeof element === 'string') {
      document.getElementById(element).style.display = 'none';
    } else {
      element.style.display = 'none';
    }
  }
}

const wrapIndicesCache = {
  lastText: null,
  lastIndices: [],
};
function getWrapIndices(textarea) {
  // Get the text from the textarea
  let text = textarea.value;

  if (wrapIndicesCache.lastText === text) {
    return wrapIndicesCache.lastIndices;
  }

  // Create a test textarea with the same styles
  let testTextarea = textarea.cloneNode();
  testTextarea.style.position = 'absolute';
  testTextarea.style.top = '-9999px';
  testTextarea.style.left = '-9999px';
  testTextarea.style.visibility = 'hidden'; // Hide the textarea
  testTextarea.style.width = textarea.offsetWidth + 'px';
  testTextarea.style.height = 'auto';
  testTextarea.value = '';
  document.body.appendChild(testTextarea);

  const MAX_CHARS_PER_LINE = 48;
  let lastIndexIncluded = 0;

  let wrapIndices = [];
  let lastHeight = 24;
  for (let i = 0; i < text.length; i++) {
    if (i !== 0 && i !== text.length - 1) {
      const lastLineBreak = text.lastIndexOf('\n', i - 1);
      if (i - lastLineBreak <= MAX_CHARS_PER_LINE) {
        if (text[i] !== ' ' && text[i] !== '-' && text[i] !== '\n') {
          continue;
        }
      }
    }

    // Add characters to the test element
    testTextarea.value = text.slice(0, i + 1);

    // Check if the height has changed
    let scrollHeight;
    if (text[i] === '\n') {
      scrollHeight = lastHeight + 24;
    } else {
      // try adding all the characters up to the next row break
      let nextPossibleBreak = Math.min(
        Math.min(text.indexOf('\n', i), text.indexOf(' ', i)),
        text.indexOf('-', i)
      );
      if (nextPossibleBreak === -1 || nextPossibleBreak === i) {
        scrollHeight = testTextarea.scrollHeight;
      } else {
        testTextarea.value = text.slice(0, nextPossibleBreak);
        if (testTextarea.scrollHeight === lastHeight) {
          i = nextPossibleBreak - 1;
          scrollHeight = testTextarea.scrollHeight;
        } else {
          testTextarea.value = text.slice(0, i + 1);
          scrollHeight = testTextarea.scrollHeight;
        }
      }
    }
    if (scrollHeight > lastHeight) {
      lastHeight = scrollHeight;
      // Step back to the last space character
      if (text[i] !== '\n') {
        let wrapIndex = Math.max(
          text.lastIndexOf(' ', i - 1),
          text.lastIndexOf('-', i - 1)
        );
        const emptyWrapIndices = wrapIndices.length === 0;
        if (
          wrapIndex !== -1 &&
          (emptyWrapIndices || wrapIndex > wrapIndices[wrapIndices.length - 1])
        ) {
          if (
            emptyWrapIndices ||
            wrapIndices[wrapIndices.length - 1] !== wrapIndex + 1
          ) {
            wrapIndices.push(wrapIndex + 1);
          }
        } else if (i !== 0) {
          wrapIndices.push(i);
        }
      }
    }
  }

  // Clean up
  document.body.removeChild(testTextarea);

  wrapIndicesCache.lastText = text;
  wrapIndicesCache.lastIndices = wrapIndices;
  return wrapIndices;
}

if (typeof window === 'undefined') {
  module.exports = {
    sliceStringFromLastDelimiter,
    sliceStringUpToFirstDelimiter,
    unescapeHtml,
  };
}
