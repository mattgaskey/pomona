(() => {
  'use strict';

  const setUpAZFilter = () => {
    const letters = document.querySelector('#edit-letter');
    const azDirectory = document.querySelector('#az-directory');
    if (!letters || !azDirectory) return;

    const activeIds = new Set();

    for (const letterListing of azDirectory.children) {
      const activeId = letterListing.dataset.azDirectoryLetter;
      if (activeId) activeIds.add(`edit-letter-${activeId.toLowerCase()}`);
    }

    const links = letters.querySelectorAll('.bef-link:not([name*="All"])');

    for (const link of links) {
      if (activeIds.has(link.id)) continue;
      const span = document.createElement('span');
      span.textContent = link.textContent;
      link.getAttributeNames().forEach(attr => span.setAttribute(attr, link.getAttribute(attr)));
      span.removeAttribute('href');
      link.replaceWith(span);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setUpAZFilter);
  } else {
    setUpAZFilter();
  }
})();