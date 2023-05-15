const handlers = {
  initializeSettings: () => {
    if (localStorage.getItem('SafetypeLocalSettings') === null) {
      localStorage.setItem(
        'SafetypeLocalSettings',
        JSON.stringify({
          safetypeActive: true,
          dataClassesDisabled: [],
        })
      );
    }
    if (sessionStorage.getItem('SafetypeSessionSettings') === null) {
      sessionStorage.setItem(
        'SafetypeSessionSettings',
        JSON.stringify({ safetypeSessionActive: true })
      );
    }
  },
  isSafetypeActive: () => {
    return (
      getLocalSetting('safetypeActive') &&
      getSessionSetting('safetypeSessionActive')
    );
  },
  closeMainTooltip: () => {
    page.shutDownShown = false;
    document.getElementById('safetypeMainTooltip').style.display = 'none';
  },
  safetypePagingPrev: () => {
    if (page.issueDisplayedIndex > 0) {
      page.issueDisplayedIndex -= 1;
    }
    page.scrollToDisplayedIssue();
  },
  safetypePagingNext: () => {
    if (page.issueDisplayedIndex < page.spans.length - 1) {
      page.issueDisplayedIndex += 1;
    }
    page.scrollToDisplayedIssue();
  },
  dismissTooltip: (event) => {
    if (
      event.target.tagName !== 'TEXTAREA' &&
      event.target.id !== 'safetypeMarkerTooltip' &&
      document.getElementById('safetypeMainTooltip') &&
      !document
        .getElementById('safetypeMarkerTooltip')
        .contains(event.target) &&
      document.getElementById('safetypeMarkerTooltip').style.display !== 'none'
    ) {
      document.getElementById('safetypeMarkerTooltip').style.display = 'none';
    }
  },
  getHandleMouseMove: (chatOverlay, chatTextarea, chatTooltip) => {
    return (event) => {
      const coordinates = getMouseCoordinatesRelativeToTextarea(
        chatOverlay,
        event
      );
      if (page.spansLocations) {
        const targetElementIndex = page.spansLocations.findIndex(
          (element) =>
            coordinates.x >= element.x &&
            coordinates.x <= element.x + element.width &&
            coordinates.y >= element.y &&
            coordinates.y <= element.y + element.height
        );
        if (targetElementIndex !== -1) {
          handlers.closeMainTooltip();
          page.markedTextHighlightedIndex = targetElementIndex;
          const relevantSpan = [...chatOverlay.getElementsByTagName('span')][
            targetElementIndex
          ];
          const markerRect = chatOverlay.getBoundingClientRect();
          chatTooltip.style.top =
            markerRect.top -
            chatOverlay.scrollTop +
            page.spansLocations[targetElementIndex].y -
            dimensions.tooltipHeight +
            'px';
          const leftStart =
            markerRect.left + page.spansLocations[targetElementIndex].x - 5;
          if (leftStart + dimensions.tooltipWidth < window.innerWidth) {
            chatTooltip.style.left = leftStart + 'px';
            chatTooltip.style.right = 'unset';
          } else {
            chatTooltip.style.left = 'unset';
            chatTooltip.style.right =
              window.innerWidth -
              markerRect.right +
              (markerRect.width -
                chatOverlay.scrollLeft -
                (page.spansLocations[targetElementIndex].x +
                  page.spansLocations[targetElementIndex].width)) +
              'px';
          }
          document.getElementById('tooltipCurrTitle').innerHTML =
            relevantSpan.getAttribute('data-type');
          chatTooltip.style.display = 'block';
          document.getElementById('anonymizeButton').onclick = function () {
            const relevantRegex = supportedRecognizers.find(
              (regexType) =>
                regexType.name === relevantSpan.getAttribute('data-type')
            );
            chatTextarea.select();
            document.execCommand(
              'insertText',
              false,
              replaceAll(
                chatTextarea.value,
                relevantSpan.innerText,
                relevantRegex.anonymous
              )
            );
            chatTooltip.style.display = 'none';
          };
          document.getElementById('ignoreButton').onclick = function () {
            page.ignored.add(relevantSpan.innerText);
            chatTooltip.style.display = 'none';
          };
          setHoverColors(
            document.getElementById('anonymizeButton'),
            'background',
            '#464646',
            '#121212'
          );
          setHoverColors(
            document.getElementById('ignoreButton'),
            'color',
            '#121212',
            '#b7b7b7'
          );
        } else {
          chatTooltip.style.display = 'none';
          if (
            document.getElementById('safetypeMainTooltip').style.display ===
            'none'
          ) {
            page.markedTextHighlightedIndex = null;
          }
        }
      }
    };
  },
  getScrollDisplay: (chatTextarea, chatOverlay) => {
    return () => {
      if (!page.spansLocations[page.issueDisplayedIndex]) {
        return;
      }
      chatTextarea.scrollTop = page.spansLocations[page.issueDisplayedIndex].y;
      const myTextareaRect = chatTextarea.getBoundingClientRect();
      if (
        page.spansLocations[page.issueDisplayedIndex].x < myTextareaRect.width
      ) {
        chatTextarea.scrollLeft = 0;
      } else if (
        page.spansLocations[page.issueDisplayedIndex].x > myTextareaRect.width
      ) {
        chatTextarea.scrollLeft =
          page.spansLocations[page.issueDisplayedIndex].x;
      }
      chatTextarea.scrollLeft = page.spansLocations[page.issueDisplayedIndex].x;
      chatOverlay.scrollTop = chatTextarea.scrollTop;
      chatOverlay.scrollLeft = chatTextarea.scrollLeft;
    };
  },
  ignoreFromMain: () => {
    const relevantText = page.spans[page.issueDisplayedIndex].innerText;
    page.ignored.add(relevantText);
    page.spans = page.spans.filter((span) => span.innerText !== relevantText);
    const newSpanSize = page.spans.length;
    if (page.issueDisplayedIndex >= newSpanSize - 1) {
      page.issueDisplayedIndex = newSpanSize - 1;
    }
    page.issueDisplayedIndex = Math.max(page.issueDisplayedIndex, 0);
    page.spansLocations = getLocations(page.spans);
    page.scrollToDisplayedIssue();
  },
  getAnonymizeFromMain: (chatTextarea, chatTooltip) => {
    return () => {
      const relevantSpan = page.spans[page.issueDisplayedIndex];
      const relevantText = page.spans[page.issueDisplayedIndex].innerText;
      const relevantRegex = supportedRecognizers.find(
        (regexType) => regexType.name === relevantSpan.getAttribute('data-type')
      );
      chatTextarea.select();
      document.execCommand(
        'insertText',
        false,
        replaceAll(
          chatTextarea.value,
          relevantSpan.innerText,
          relevantRegex.anonymous
        )
      );
      chatTooltip.style.display = 'none';
      page.spans = page.spans.filter((span) => span.innerText !== relevantText);
      const newSpanSize = page.spans.length;
      if (page.issueDisplayedIndex >= newSpanSize - 1) {
        page.issueDisplayedIndex = newSpanSize - 1;
      }
      page.issueDisplayedIndex = Math.max(page.issueDisplayedIndex, 0);
      page.spansLocations = getLocations(page.spans);
      page.scrollToDisplayedIssue();
    };
  },
  mainButtonClick: () => {
    if (
      document.getElementById('safetypeMainTooltip').style.display === 'block'
    ) {
      document.getElementById('safetypeMainTooltip').style.display = 'none';
    } else {
      document.getElementById('safetypeMainTooltip').style.display = 'block';
      page.scrollToDisplayedIssue();
    }
    setHoverColors(
      document.getElementById('SafetypeMainTooltipPowerIcon'),
      'background',
      '#efefef',
      '#f7f7f7'
    );
    setHoverColors(
      document.getElementById('SafetypeMainTooltipXicon'),
      'background',
      '#efefef',
      '#f7f7f7'
    );
    setHoverColors(
      document.getElementById('anonymizeButtonOnMain'),
      'background',
      '#464646',
      '#121212'
    );
    setHoverColors(
      document.getElementById('ignoreButtonOnMain'),
      'color',
      '#121212',
      '#b7b7b7'
    );
    document.getElementById('safetypeMarkerTooltip').style.display = 'none';
  },
  shutDownCancel: () => {
    page.shutDownShown = false;
  },
  shutDownPerm: () => {
    handlers.closeMainTooltip();
    const currSettings = JSON.parse(
      localStorage.getItem('SafetypeLocalSettings')
    );
    currSettings.safetypeActive = false;
    localStorage.setItem('SafetypeLocalSettings', JSON.stringify(currSettings));
  },
  shutDownForSession: () => {
    handlers.closeMainTooltip();
    const currSettings = JSON.parse(
      sessionStorage.getItem('SafetypeSessionSettings')
    );
    currSettings.safetypeSessionActive = false;
    sessionStorage.setItem(
      'SafetypeSessionSettings',
      JSON.stringify(currSettings)
    );
  },
  toggleShutdownPopup: () => {
    page.shutDownShown = !page.shutDownShown;
    setHoverColors(
      document.getElementById('shutdownSession'),
      'background',
      '#464646',
      '#121212'
    );
    setHoverColors(
      document.getElementById('shutdownPerm'),
      'background',
      '#f7f7f7',
      'white'
    );
    setHoverColors(
      document.getElementById('shutdownCancel'),
      'color',
      '#121212',
      '#7b7b7b'
    );
  },
};
