﻿'use strict';

function notify(msg, period = 750) {
  // Update status to let user know options were saved.
  const status = document.getElementById('status');
  status.textContent = msg;
  clearTimeout(notify.id);
  notify.id = setTimeout(() => status.textContent = '', period);
}

function prepare(str) {
  return str.split(/\s*,\s*/)
    .map(s => s.replace('http://', '')
      .replace('https://', '').split('/')[0].trim())
    .filter((h, i, l) => h && l.indexOf(h) === i);
}

function save() {
  let custom = {};
  const c = document.getElementById('custom').value;
  try {
    custom = JSON.parse(c);
  }
  catch (e) {
    window.setTimeout(() => {
      notify('Custom JSON error: ' + e.message, 5000);
      document.getElementById('custom').value = c;
    }, 1000);
  }

  let parser = {};
  const p = document.getElementById('parser').value;
  try {
    parser = JSON.parse(p);
  }
  catch (e) {
    window.setTimeout(() => {
      notify('Parser JSON error: ' + e.message, 5000);
      document.getElementById('parser').value = c;
    }, 1000);
  }

  chrome.storage.local.set({
    exactMatch: document.getElementById('exactMatch').checked,
    faqs: document.getElementById('faqs').checked,
    log: document.getElementById('log').checked,
    cache: document.getElementById('cache').checked,
    blacklist: prepare(document.getElementById('blacklist').value),
    whitelist: prepare(document.getElementById('whitelist').value),
    custom,
    parser,
    mode: document.querySelector('[name="mode"]:checked').value,
    protected: document.getElementById('protected').value.split(/\s*,\s*/).filter(s => s.length > 4)
  }, () => {
    restore();
    notify('Options saved.');
    chrome.contextMenus.update(document.querySelector('[name="mode"]:checked').value, {
      checked: true
    });
  });
}

function restore() {
  chrome.storage.local.get({
    exactMatch: false,
    faqs: true,
    log: false,
    cache: true,
    mode: 'custom',
    whitelist: [],
    blacklist: [],
    custom: {"qadci-uat": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4209.0 Safari/537.36",
 "qadci-uat.debortoli.*": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4209.0 Safari/537.36",
 "touriga": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4209.0 Safari/537.36",
 "touriga.debortoli.*": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4209.0 Safari/537.36",
 "qadci-unstable": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4209.0 Safari/537.36",
 "qadci-unstable.debortoli.*": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4209.0 Safari/537.36",
 "arneis": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4209.0 Safari/537.36",
 "arneis.debortoli.*": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4209.0 Safari/537.36",
 "qadci-dev": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4209.0 Safari/537.36",
 "qadci-dev.debortoli.*": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4209.0 Safari/537.36",
 "piccolo": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4209.0 Safari/537.36",
 "piccolo.debortoli.*": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4209.0 Safari/537.36"},
    parser: {},
    protected: ['google.com/recaptcha', 'gstatic.com/recaptcha']
  }, prefs => {
    document.getElementById('exactMatch').checked = prefs.exactMatch;
    document.getElementById('faqs').checked = prefs.faqs;
    document.getElementById('log').checked = prefs.log;
    document.getElementById('cache').checked = prefs.cache;
    document.querySelector(`[name="mode"][value="${prefs.mode}"`).checked = true;
    document.getElementById('blacklist').value = prefs.blacklist.join(', ');
    document.getElementById('whitelist').value = prefs.whitelist.join(', ');
    document.getElementById('custom').value = JSON.stringify(prefs.custom, null, 2);
    document.getElementById('parser').value = JSON.stringify(prefs.parser, null, 2);
    document.getElementById('protected').value = prefs.protected.join(', ');
  });
}
document.addEventListener('DOMContentLoaded', restore);
document.getElementById('save').addEventListener('click', save);

document.getElementById('sample').addEventListener('click', e => {
  e.preventDefault();

  document.getElementById('custom').value = JSON.stringify({
    'www.google.com': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36',
    'www.bing.com, www.yahoo.com, www.wikipedia.org': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:57.0) Gecko/20100101 Firefox/57.0',
    'www.example.com': ['random-useragent-1', 'random-user-agent-2'],
    '*': 'useragent-for-all-hostnames'
  }, null, 2);
});

document.getElementById('sample-2').addEventListener('click', e => {
  e.preventDefault();

  document.getElementById('parser').value = JSON.stringify({
    'my-custom-useragent': {
      'appVersion': 'custom app version',
      'platform': 'custom platform',
      'vendor': '[delete]',
      'product': 'custom product',
      'oscpu': 'custom oscpu',
      'custom-variable': 'this is a custom variable'
    }
  }, null, 2);
});

document.getElementById('donate').addEventListener('click', () => {
  chrome.tabs.create({
    url: chrome.runtime.getManifest().homepage_url + '?rd=donate'
  });
});

document.getElementById('reset').addEventListener('click', e => {
  if (e.detail === 1) {
    notify('Double-click to reset!');
  }
  else {
    localStorage.clear();
    chrome.storage.local.clear(() => {
      chrome.runtime.reload();
      window.close();
    });
  }
});

document.getElementById('help').addEventListener('click', () => {
  chrome.tabs.create({
    url: chrome.runtime.getManifest().homepage_url
  });
});

// export
document.getElementById('export').addEventListener('click', () => {
  chrome.storage.local.get(null, prefs => {
    const text = JSON.stringify(prefs, null, '  ');
    const blob = new Blob([text], {type: 'application/json'});
    const objectURL = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), {
      href: objectURL,
      type: 'application/json',
      download: 'useragent-switcher-preferences.json'
    }).dispatchEvent(new MouseEvent('click'));
    setTimeout(() => URL.revokeObjectURL(objectURL));
  });
});
// import
document.getElementById('import').addEventListener('click', () => {
  const input = document.createElement('input');
  input.style.display = 'none';
  input.type = 'file';
  input.accept = '.json';
  input.acceptCharset = 'utf-8';

  document.body.appendChild(input);
  input.initialValue = input.value;
  input.onchange = readFile;
  input.click();

  function readFile() {
    if (input.value !== input.initialValue) {
      const file = input.files[0];
      if (file.size > 100e6) {
        console.warn('100MB backup? I don\'t believe you.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = event => {
        input.remove();
        const json = JSON.parse(event.target.result);
        chrome.storage.local.clear(() => {
          chrome.storage.local.set(json, () => {
            window.close();
            chrome.runtime.reload();
          });
        });
      };
      reader.readAsText(file, 'utf-8');
    }
  }
});

/* toggle */
document.getElementById('toggle-blacklist-desc').addEventListener('click', () => {
  document.querySelector('[for="toggle-blacklist-desc"]').classList.toggle('hidden');
});
document.getElementById('toggle-whitelist-desc').addEventListener('click', () => {
  document.querySelector('[for="toggle-whitelist-desc"]').classList.toggle('hidden');
});
document.getElementById('toggle-custom-desc').addEventListener('click', () => {
  document.querySelector('[for="toggle-custom-desc"]').classList.toggle('hidden');
});
document.getElementById('toggle-protected-desc').addEventListener('click', () => {
  document.querySelector('[for="toggle-protected-desc"]').classList.toggle('hidden');
});
document.getElementById('toggle-parser-desc').addEventListener('click', () => {
  document.querySelector('[for="toggle-parser-desc"]').classList.toggle('hidden');
});
