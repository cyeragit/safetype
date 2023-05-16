if (typeof window === 'undefined') {
  wrappedClassify = require('../src/classifier.js');
}

let page = {
  shutDownShown: false,
  markedTextHighlightedIndex: null,
  spans: [],
  spansLocations: null,
  scrollToDisplayedIssue: () => {},
  chatTextareaOriginalStyles: null,
  ignored: new Set(),
  issueDisplayedIndex: 0,
  isLightMode: true,
  codeFound: new Set(),
};

const pageConstants = {
  checkInterval: 5,
};

loadGoogleFont('Inter', [400, 500]);

handlers.initializeSettings();
document.body.onmousemove = handlers.dismissTooltip;

// create safetype elements
const addedOverlay = document.createElement('div');
addedOverlay.id = 'safetypeOverlay';
addedOverlay.style = getStyle(styles.overlay);

const addedTooltip = document.createElement('div');
addedTooltip.id = 'safetypeMarkerTooltip';
addedTooltip.style = getStyle(styles.addedTooltip);
addedTooltip.innerHTML = safetypeMarkerTooltipHtml;

const addedSafetypeMainButton = document.createElement('div');
addedSafetypeMainButton.id = 'safetypeMainButton';
addedSafetypeMainButton.style = getStyle(styles.addedSafetypeMainButton);
addedSafetypeMainButton.innerHTML = `${
  assets.cyeraLogoSvgBlack
}<div id="countSafetypeIssues" style="${getStyle(
  styles.countSafetypeIssues
)}">0</div>`;
addedSafetypeMainButton.onclick = handlers.mainButtonClick;

const addedMainTooltip = document.createElement('div');
addedMainTooltip.id = 'safetypeMainTooltip';
addedMainTooltip.style = getStyle(styles.mainTooltip);
addedMainTooltip.innerHTML = safetypeMainTooltipHtml;

const getNumIssues = () => {
  if (page.codeFound.size > 0) {
    return page.spans.length + 1;
  }
  return page.spans.length;
};

const getDisplayIndexOfSpan = () => {
  if (page.codeFound.size > 0) {
    return page.issueDisplayedIndex - 1;
  }
  return page.issueDisplayedIndex;
};

setInterval(() => {
  // if page not loaded yet
  if (document.getElementsByTagName('textarea').length !== 1) {
    return;
  }
  // read page elements
  page.isLightMode = document
    .getElementsByTagName('html')[0]
    .classList.contains('light');
  const chatTextarea = document.getElementsByTagName('textarea')[0];
  const submitButton =
    chatTextarea.parentElement.getElementsByTagName('button')[0];

  // add safetype elements
  if (!document.getElementById('safetypeOverlay')) {
    chatTextarea.parentElement.appendChild(addedOverlay);
  }
  if (!document.getElementById('safetypeMarkerTooltip')) {
    document.body.appendChild(addedTooltip);
    const chatTextareComputedStyles = window.getComputedStyle(chatTextarea);
    page.chatTextareaOriginalStyles = {
      fontWeight: chatTextareComputedStyles.getPropertyValue('font-weight'),
      caretColor: chatTextareComputedStyles.getPropertyValue('caret-color'),
      color: chatTextareComputedStyles.getPropertyValue('color'),
      whiteSpace: chatTextareComputedStyles.getPropertyValue('white-space'),
      overflowX: chatTextareComputedStyles.getPropertyValue('overflow-x'),
    };
  }
  if (!document.getElementById('safetypeMainButton')) {
    document.body.appendChild(addedSafetypeMainButton);
  }
  const rightOffset =
    Math.max(
      window.innerWidth - chatTextarea.getBoundingClientRect().right - 73,
      50
    ) + 'px';
  document.getElementById('safetypeMainButton').style.right = rightOffset;
  if (!document.getElementById('safetypeMainTooltip')) {
    document.body.appendChild(addedMainTooltip);
    document.getElementById('safetypeMainTooltip').style.right = rightOffset;
    document.getElementById('SafetypeMainTooltipXicon').onclick =
      handlers.closeMainTooltip;
    document.getElementById('SafetypeMainTooltipPowerIcon').onclick =
      handlers.toggleShutdownPopup;
  }

  // set safetype handlers
  document.getElementById('shutdownCancel').onclick = handlers.shutDownCancel;
  document.getElementById('shutDownBackButton').onclick =
    handlers.shutDownCancel;
  document.getElementById('shutdownSession').onclick =
    handlers.shutDownForSession;
  document.getElementById('shutdownPerm').onclick = handlers.shutDownPerm;

  // initiate safetype elements
  const chatOverlay = document.getElementById('safetypeOverlay');
  const chatTooltip = document.getElementById('safetypeMarkerTooltip');
  const mainTooltip = document.getElementById('safetypeMainTooltip');
  const mainButton = document.getElementById('safetypeMainButton');

  // handle active/disabled state
  if (!handlers.isSafetypeActive()) {
    hide([chatOverlay, chatTooltip, mainTooltip, mainButton]);
  } else {
    chatOverlay.style.display = 'block';
    mainButton.style.display = 'flex';
  }

  // initialize handlers
  chatTextarea.onmousemove = handlers.getHandleMouseMove(
    chatOverlay,
    chatTextarea,
    chatTooltip
  );
  chatTextarea.onfocus = handlers.closeMainTooltip;
  document.getElementById('ignoreButtonOnMain').onclick =
    handlers.ignoreFromMain;
  document.getElementById('anonymizeButtonOnMain').onclick =
    handlers.getAnonymizeFromMain(chatTextarea, chatTooltip);

  // initialize current spans of issues and their locations
  page.spans = [...chatOverlay.getElementsByTagName('span')];
  page.spansLocations = getLocations(page.spans);

  // update main button and tooltip
  if (
    handlers.isSafetypeActive() &&
    document.getElementById('countSafetypeIssues')
  ) {
    if (page.shutDownShown) {
      // show the shutdown screen
      if (document.getElementById('SafetypeShutdown')) {
        hide([
          'countSafetypeIssues',
          'wellDoneStatus',
          'problemsStatus',
          'aboutSafetypeMainTooltip',
        ]);
        document.getElementById('SafetypeShutdown').style.display = 'flex';
        document.getElementById('shutDownBackButton').style.visibility =
          'visible';
      }
    } else {
      // show the main tooltip
      hide(['SafetypeShutdown']);
      document.getElementById('shutDownBackButton').style.visibility = 'hidden';
      document.getElementById('aboutSafetypeMainTooltip').style.display =
        'flex';
      if (getNumIssues() > 1) {
        document.getElementById('SafetypePagingParent').style.display = 'flex';
      } else {
        hide(['SafetypePagingParent']);
      }
      document.getElementById('SafetypePaging').innerHTML =
        page.issueDisplayedIndex + 1 + ' of ' + getNumIssues();

      // set the scroll to dipslay handler
      page.scrollToDisplayedIssue = handlers.getScrollDisplay(
        chatTextarea,
        chatOverlay
      );

      // set paging buttons
      const backDisabled = page.issueDisplayedIndex === 0;
      const forwardDisabled = page.issueDisplayedIndex === getNumIssues() - 1;
      document.getElementById('SafetypeBackDisabled').style.display =
        backDisabled ? 'block' : 'none';
      document.getElementById('SafetypeBackEnabled').style.display =
        backDisabled ? 'none' : 'block';
      document.getElementById('SafetypeForwardDisabled').style.display =
        forwardDisabled ? 'block' : 'none';
      document.getElementById('SafetypeForwardEnabled').style.display =
        forwardDisabled ? 'none' : 'block';
      document.getElementById('SafetypePagingPrev').onclick =
        handlers.safetypePagingPrev;
      document.getElementById('SafetypePagingNext').onclick =
        handlers.safetypePagingNext;

      // in case we have issues in the prompt show the counter
      if (getNumIssues() > 0) {
        document.getElementById('countSafetypeIssues').style.display = 'flex';
        hide(['wellDoneStatus']);
        document.getElementById('problemsStatus').style.display = 'block';
        page.issueDisplayedIndex = Math.max(
          0,
          Math.min(page.issueDisplayedIndex, getNumIssues() - 1)
        );
        document.getElementById('currentIssueText').innerHTML =
          getDisplayIndexOfSpan() === -1
            ? 'This is code!'
            : page.spans[getDisplayIndexOfSpan()].innerText;
        document.getElementById('currentIssueDataType').innerHTML =
          getDisplayIndexOfSpan() === -1
            ? 'Code'
            : page.spans[getDisplayIndexOfSpan()].getAttribute('data-type');
        if (
          document.getElementById('safetypeMainTooltip').style.display !==
          'none'
        ) {
          page.markedTextHighlightedIndex =
            page.codeFound.size > 0
              ? page.issueDisplayedIndex - 1
              : page.issueDisplayedIndex;
        }
      } else {
        hide(['countSafetypeIssues', 'problemsStatus']);
        document.getElementById('wellDoneStatus').style.display = 'flex';
      }
      document.getElementById('countSafetypeIssues').innerHTML = getNumIssues();
    }
  }

  if (handlers.isSafetypeActive()) {
    // if the prompt is not empty - classify and mark issues
    if (chatTextarea.value.length > 0) {
      let newText = escapeHtml(chatTextarea.value);

      let newTextParts = [];
      let lastIndex = 0;

      const breakIndices = getWrapIndices(chatTextarea);
      let replacedText = '';
      let start = 0;
      for (let i = 0; i <= breakIndices.length; i++) {
        if (i !== 0) {
          start = breakIndices[i - 1];
          if (chatTextarea.value[start] === ' ') {
            start += 1;
          }
        }
        const lastText = chatTextarea.value.slice(start, breakIndices[i]);
        replacedText += lastText;
        if (i !== breakIndices.length) {
          replacedText += '\n';
        }
      }

      newText = escapeHtml(replacedText);

      const fixText = (text) => formatSpaces(text).replace(/\n/g, '<br>');

      const filteredMatches = wrappedClassify(newText);
      page.codeFound = new Set();
      for (const match of filteredMatches) {
        if (match.kind === 'code') {
          page.codeFound.add(match.dataType);
          continue;
        }
        newTextParts.push(fixText(newText.slice(lastIndex, match.start)));
        const backgroundColor =
          page.markedTextHighlightedIndex === filteredMatches.indexOf(match)
            ? page.isLightMode
              ? '#FB651459'
              : '#FFAE8333'
            : page.isLightMode
            ? '#FB65142E'
            : '#FB651433';
        newTextParts.push(
          `<span style="background-color:${backgroundColor}; text-decoration: underline; text-decoration-color: #fb6514;" class="SafetypeMarked" data-type="${
            match.dataType
          }">${fixText(newText.slice(match.start, match.end))}</span>`
        );

        lastIndex = match.end;
      }

      newTextParts.push(fixText(newText.slice(lastIndex)));
      newText = newTextParts.join('');

      if (addedOverlay.innerHTML !== newText) {
        addedOverlay.innerHTML = newText;
      }

      const chatTextareaStyles = {
        fontWeight: '100',
        caretColor: page.isLightMode ? 'black' : 'white',
        color: page.isLightMode ? 'white' : 'rgb(64, 65, 80)',
        overflowX: 'hidden',
      };

      const submitButtonStyles = {
        zIndex: '1',
        padding: '3px',
        backgroundColor: page.isLightMode ? 'white' : 'rgb(64, 65, 80)',
      };

      applyStyles(chatTextarea, chatTextareaStyles);
      applyStyles(submitButton, submitButtonStyles);
      applyStyles(addedOverlay, {
        ...styles.dynamicOverlay,
        maxHeight: chatTextarea.style.maxHeight,
        height: chatTextarea.style.height,
      });

      // sync scroll positions
      chatOverlay.scrollTop = chatTextarea.scrollTop;
      chatOverlay.scrollLeft = chatTextarea.scrollLeft;
    } else {
      addedOverlay.innerHTML = '';
      addedOverlay.style.visibility = 'hidden';
    }

    // sync scroll positions to max
    if (chatOverlay && chatTextarea) {
      const maxMarkerScroll =
        chatOverlay.scrollHeight - chatOverlay.clientHeight;
      const maxTextareaScroll =
        chatTextarea.scrollHeight - chatTextarea.clientHeight;
      const maxScroll = Math.min(maxMarkerScroll, maxTextareaScroll);
      if (chatOverlay.scrollTop > maxScroll) {
        chatOverlay.scrollTop = maxScroll;
      }
      if (chatTextarea.scrollTop > maxScroll) {
        chatTextarea.scrollTop = maxScroll;
      }
    }
  } else {
    applyStyles(chatTextarea, page.chatTextareaOriginalStyles);
  }
}, pageConstants.checkInterval);
