chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSafetypeLocalSettings') {
    sendResponse({
      action: 'safetypeLocalSettingsResult',
      data: localStorage.getItem('SafetypeLocalSettings'),
    });
  } else if (request.action === 'getSafetypeSessionSettings') {
    sendResponse({
      action: 'safetypeSessionSettingsResult',
      data: sessionStorage.getItem('SafetypeSessionSettings'),
    });
  } else if (request.action === 'setSafetypeActive') {
    if (request.data !== false) {
      const currLocalSettings = JSON.parse(
        localStorage.getItem('SafetypeLocalSettings')
      );
      currLocalSettings.safetypeActive = request.data;
      localStorage.setItem(
        'SafetypeLocalSettings',
        JSON.stringify(currLocalSettings)
      );
    }

    const currSessionSettings = JSON.parse(
      sessionStorage.getItem('SafetypeSessionSettings')
    );
    currSessionSettings.safetypeSessionActive = request.data;
    sessionStorage.setItem(
      'SafetypeSessionSettings',
      JSON.stringify(currSessionSettings)
    );
    sendResponse({ action: 'safetypeSettingsActionAck', data: true });
  } else if (request.action === 'setSafetypeDisabledDataClasses') {
    const currLocalSettings = JSON.parse(
      localStorage.getItem('SafetypeLocalSettings')
    );
    currLocalSettings.dataClassesDisabled = request.data;
    localStorage.setItem(
      'SafetypeLocalSettings',
      JSON.stringify(currLocalSettings)
    );
    sendResponse({ action: 'safetypeSettingsActionAck', data: true });
  }
});
