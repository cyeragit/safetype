let dataClassDiv;
const colors = {
  personal: '#FF08C2',
  security: '#18BFFF',
  financial: '#00D47C',
  code: '#7C39ED',
};
const dataClasses = [...supportedRecognizers];
for (const dataClass of dataClasses) {
  dataClassDiv = document.createElement('div');
  dataClassDiv.style =
    'display: flex; justify-content: space-between; align-items: center;';
  dataClassDiv.innerHTML = `<div style="display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 8px; padding: 0px 8px; height: 24px; background: #FFFFFF; border: 1px solid #D0D0D0; border-radius: 4px;">
        <div style="width: 8px;height: 8px;background: ${
          colors[dataClass.kind]
        }; border-radius: 2px;"></div>
        <div  id="tooltipCurrTitle" style="font-size: 14px; line-height: 18px; text-align: center;color: #121212;">${
          dataClass.name
        }</div>
    </div>
    <label class="switch">
        <input data-class="${dataClass.name}" type="checkbox" checked>
        <span class="slider round"></span>
    </label>`;
  document.getElementById('dataClasses').appendChild(dataClassDiv);
  document
    .querySelector(`[data-class="${dataClass.name}"]`)
    .addEventListener('change', (event) => {
      toggleDataClass(event.target.getAttribute('data-class'));
    });
  // if not last element, add seperator
  if (dataClass !== dataClasses[dataClasses.length - 1]) {
    const seperatorDiv = document.createElement('div');
    seperatorDiv.style =
      'margin: 12px 0px; border: 1px solid rgba(231, 231, 231, 0.5);';
    document.getElementById('dataClasses').appendChild(seperatorDiv);
  }
}

function openSafetype() {
  window.open('www.cyera.io', '_blank');
}
window.openSafetype = openSafetype;

let safetypeActive = true;
let dataClassesDisabled = [];

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(
    tabs[0].id,
    { action: 'getSafetypeLocalSettings' },
    (response) => {
      if (
        response &&
        JSON.parse(response.data) &&
        response.action === 'safetypeLocalSettingsResult'
      ) {
        safetypeActive =
          safetypeActive && JSON.parse(response.data).safetypeActive;
        dataClassesDisabled = JSON.parse(response.data).dataClassesDisabled;
        if (!safetypeActive) {
          document
            .getElementById('mainSafetypeChecked')
            .removeAttribute('checked');
        }
        for (const dataClass of dataClasses) {
          const dataClassInput = document.querySelector(
            `[data-class="${dataClass.name}"]`
          );
          if (dataClassesDisabled.includes(dataClass.name)) {
            dataClassInput.removeAttribute('checked');
          }
        }
      }
    }
  );
  chrome.tabs.sendMessage(
    tabs[0].id,
    { action: 'getSafetypeSessionSettings' },
    (response) => {
      if (
        response &&
        JSON.parse(response.data) &&
        response.action === 'safetypeSessionSettingsResult'
      ) {
        safetypeActive =
          safetypeActive && JSON.parse(response.data).safetypeSessionActive;
        if (!safetypeActive) {
          document
            .getElementById('mainSafetypeChecked')
            .removeAttribute('checked');
        }
      }
    }
  );
});

function toggleSafetypePlugin() {
  if (safetypeActive === null) {
    return;
  }
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    safetypeActive = !safetypeActive;
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'setSafetypeActive', data: safetypeActive },
      () => {}
    );
  });
}
document.getElementById('mainSafetypeChecked').onchange = toggleSafetypePlugin;

function toggleDataClass(dataClass) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const dataClassInput = document.querySelector(
      `[data-class="${dataClass}"]`
    );
    if (dataClassInput.checked) {
      dataClassesDisabled = dataClassesDisabled.filter((e) => e !== dataClass);
    } else {
      dataClassesDisabled.push(dataClass);
    }
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'setSafetypeDisabledDataClasses', data: dataClassesDisabled },
      () => {}
    );
  });
}
