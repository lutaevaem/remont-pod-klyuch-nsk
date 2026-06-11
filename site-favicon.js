(() => {
  const faviconHref = '/favicon.svg?v=1';
  const links = [
    ['icon', 'image/svg+xml', faviconHref],
    ['shortcut icon', 'image/svg+xml', faviconHref],
    ['apple-touch-icon', '', faviconHref],
  ];

  links.forEach(([rel, type, href]) => {
    const existing = document.querySelector(`link[rel="${rel}"]`);
    const link = existing || document.createElement('link');
    link.rel = rel;
    if (type) link.type = type;
    link.href = href;
    if (!existing) document.head.appendChild(link);
  });

  const themeColor = document.querySelector('meta[name="theme-color"]') || document.createElement('meta');
  themeColor.name = 'theme-color';
  themeColor.content = '#11100e';
  if (!themeColor.parentNode) document.head.appendChild(themeColor);
})();
