// Launch params {itemId, itemType, fallbackTitle, fallbackPoster,
// fallbackBackground} open that title's detail page. Read once at load for
// a cold start, and from each webOSRelaunch event for a warm one. The app
// bundle calls __sillOpen from its route-restore paths.
(function () {
  function parse(raw) {
    if (!raw) return null;
    try {
      var p = typeof raw === 'string' ? JSON.parse(raw) : raw;
      var id = p && p.itemId ? String(p.itemId).trim() : '';
      if (!id) return null;
      var type = p.itemType ? String(p.itemType) : 'movie';
      return {
        itemId: id, itemType: type, catalogType: type,
        fallbackTitle: p.fallbackTitle || 'Untitled',
        fallbackPoster: p.fallbackPoster || '',
        fallbackBackground: p.fallbackBackground || ''
      };
    } catch (e) { return null; }
  }
  var sys = window.webOSSystem || window.PalmSystem;
  window.__sillTarget = parse(sys && sys.launchParams);
  document.addEventListener('webOSRelaunch', function (e) {
    window.__sillTarget = parse(e && e.detail);
  }, true);
  window.__sillOpen = async function (router) {
    var t = window.__sillTarget;
    window.__sillTarget = null;
    if (!t) return false;
    if (router.getCurrent() !== 'home') await router.navigate('home', {}, { replaceHistory: true, skipStackPush: true });
    await router.navigate('detail', t);
    return true;
  };
})();
