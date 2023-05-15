const assets = {
  cyeraLogoSvgBlack: loadSvgSync('assets/cyeraLogoSvgBlack.svg'),
  cyeraLogoSvgGreen: loadSvgSync('assets/cyeraLogoSvgGreen.svg'),
  powerIcon: loadSvgSync('assets/powerIcon.svg'),
  xIcon: loadSvgSync('assets/xIcon.svg'),
  checkMarkBox: loadSvgSync('assets/checkmarkBox.svg'),
  backDisabled: loadSvgSync('assets/backDisabled.svg'),
  backEnabled: loadSvgSync('assets/backEnabled.svg'),
  forwardDisabled: loadSvgSync('assets/forwardDisabled.svg'),
  forwardEnabled: loadSvgSync('assets/forwardEnabled.svg'),
  backButton: loadSvgSync('assets/backButton.svg'),
};

const safetypeMarkerTooltipHtml = `
<div style="padding: 20px 16px; user-select: none">
    <div style="color: #464646; font-size: 14px; line-height: 17px; font-weight: 400; cursor:text;">This instance is considered sensitive data as it is classified as</div>
    <div style="display: inline-flex">
        <div style="${getStyle(styles.dataTag)}">
            <div style="width: 8px;height: 8px;background: #FF08C2; border-radius: 2px;"></div>
            <div  id="tooltipCurrTitle" style="${getStyle(
              styles.tooltipCurrTitle
            )}">-</div>
        </div>
    </div>
    <div style="margin-top:24px; display: flex; flex-direction: row; justify-content: space-between; align-items: center">
        <div style="display: flex; flex-direction: row; align-items: center; gap:12px">
            <div  id="anonymizeButton" style="background: #121212; color: white; font-size: 14px; border-radius: 4px; padding: 8px 12px; cursor:pointer;">Anonymize</div>
            <div id="ignoreButton" style="color: #7B7B7B; font-size: 14px; cursor:pointer;" >Dismiss</div>
        </div>
    </div>
</div>
<div style="border-top: 1px solid #E7E7E7;">
    <a  href="https://www.cyera.io/solution" target="_blank" style="display: flex; justify-content: start; align-items: center; gap:12px; padding: 10px 16px;">
        <div style="font-size: 14px; color:#7b7b7b; text-decoration: underline">Learn more about classifications in Cyera</div>
    </a>
</div>
`;

const safetypeMainTooltipHtml = `
    <div style="${getStyle(styles.mainTooltipHeader)}">
        <div id="shutDownBackButton" style="visibility: hidden; cursor: pointer">${
          assets.backButton
        }</div>
        <div style="display: flex;">
            <div id="SafetypeMainTooltipPowerIcon" style="cursor: pointer; padding: 2px">${
              assets.powerIcon
            }</div>
            <div id="SafetypeMainTooltipXicon" style="cursor:pointer; padding: 2px">${
              assets.xIcon
            }</div>
        </div>
    </div>
    <div id="wellDoneStatus" style="${getStyle(styles.wellDoneStatus)}">
        ${assets.checkMarkBox}
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px">
            <div style="color: #121212; font-weight: 500;">Well Done!</div>
            <div style="color: #585858;">You don't have any sensitive data.</div>
        </div>
    </div>
    <div id="problemsStatus" style="padding: 20px 16px">
        <div style="color: #464646; font-size: 14px; line-height: 22px; font-weight: 400; cursor:text;">
            <span id="currentIssueText" style="${getStyle(
              styles.currentIssueText
            )}">This instance</span>&nbsp; is considered sensitive data as it is classified as</div>
        <div style="display: inline-flex;">
            <div style="${getStyle(styles.dataTag)}">
                <div style="width: 8px; height: 8px; background: #FF08C2; border-radius: 2px;"></div>
                <div id="currentIssueDataType" style="${getStyle(
                  styles.tooltipCurrTitle
                )}">Classified data</div>
            </div>
        </div>
        <div style="margin-top:24px; display: flex; flex-direction: row; justify-content: space-between; align-items: center">
            <div style="display: flex; flex-direction: row; align-items: center; gap:12px">
                <div  id="anonymizeButtonOnMain" style="user-select: none; background: #121212; color: white; font-size: 14px; border-radius: 4px; padding: 8px 12px; cursor:pointer;">Anonymize</div>
                <div id="ignoreButtonOnMain" style="user-select: none; color: #7B7B7B; font-size: 14px; cursor:pointer;" >Dismiss</div>
            </div>
            <div style="display:flex; gap: 20px; align-items: center">
                <div id="SafetypePagingParent" style="display:flex; gap: 8px">
                    <div id="SafetypePagingPrev" style="cursor: pointer">
                        <div id="SafetypeBackDisabled">${
                          assets.backDisabled
                        }</div>
                        <div id="SafetypeBackEnabled">${
                          assets.backEnabled
                        }</div>
                    </div>
                    <div id="SafetypePaging" style="font-size: 14px; font-weight: 400; color: #7B7B7B; word-spacing: 4px">1 of 1</div>
                    <div id="SafetypePagingNext" style="cursor: pointer">
                        <div id="SafetypeForwardDisabled">${
                          assets.forwardDisabled
                        }</div>
                        <div id="SafetypeForwardEnabled">${
                          assets.forwardEnabled
                        }</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="SafetypeShutdown" style="${getStyle(styles.safetypeShutDown)}">
        <div style="color: #2d2d2d; font-weight: 400;">Turn off Cyera plugin for ChatGPT</div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px">
            <div id="shutdownSession" style="${getStyle(
              styles.shutDownSession
            )}">Yes, for this session</div>
            <div id="shutdownPerm" style="${getStyle(
              styles.shutDownPerm
            )}">Yes, from now on</div>
        </div>
        <div id="shutdownCancel" style="color: #7b7b7b; font-size: 14px; cursor: pointer">No, don't turn off</div>
    </div>
    <a id="aboutSafetypeMainTooltip" href="https://www.cyera.io/solution" target="_blank" style="display: flex; justify-content: start; align-items: center; gap:12px; padding: 10px 16px; border-top: 1px solid #E7E7E7; ">
        <div style="font-size: 14px; color:#7b7b7b; text-decoration: underline">Learn more about classifications in Cyera</div>
    </a>
`;
