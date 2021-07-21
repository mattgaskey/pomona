'use strict';

var contactNavigation = {
  items: ['Contact Us', 'Location & Maps']
};

var footerNavigation = {
  items: ['The Arts', 'Emergency', 'TCCS', 'Athletics', 'Employment', 'Accessibility']
};

var legal = {
  items: ['Privacy', 'Feedback', 'Directory']
};

var mainNavigation = {
  items: ['Admissions & Aid', 'Academics', 'Life @ Pomona', 'Home', 'News & Events', 'About', 'Alumni & Families']
};

var quicklinks = {
  items: ['A-Z Directory', 'Academic Calendar', 'Athletics', 'Campus Map', 'Catalog', 'Dining Menus', 'Give Today']
};

var pagesFor = {
  items: ['New Students', 'Students', 'Faculty', 'Staff']
};

module.exports = {
  order: 3,
  context: {
    contactNavigation: contactNavigation,
    footerNavigation: footerNavigation,
    legal: legal,
    mainNavigation: mainNavigation,
    quicklinks: quicklinks,
    pagesFor: pagesFor
  }
};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9yZ2FuaXNtcy9vcmdhbmlzbXMuY29uZmlnLmpzIl0sIm5hbWVzIjpbImNvbnRhY3ROYXZpZ2F0aW9uIiwiaXRlbXMiLCJmb290ZXJOYXZpZ2F0aW9uIiwibGVnYWwiLCJtYWluTmF2aWdhdGlvbiIsInF1aWNrbGlua3MiLCJwYWdlc0ZvciIsIm1vZHVsZSIsImV4cG9ydHMiLCJvcmRlciIsImNvbnRleHQiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLElBQU1BLG9CQUFvQjtBQUN4QkMsU0FBTyxDQUFDLFlBQUQsRUFBZSxpQkFBZjtBQURpQixDQUExQjs7QUFJQSxJQUFNQyxtQkFBbUI7QUFDdkJELFNBQU8sQ0FBQyxVQUFELEVBQWEsV0FBYixFQUEwQixNQUExQixFQUFrQyxXQUFsQyxFQUErQyxZQUEvQyxFQUE2RCxlQUE3RDtBQURnQixDQUF6Qjs7QUFJQSxJQUFNRSxRQUFRO0FBQ1pGLFNBQU8sQ0FBQyxTQUFELEVBQVksVUFBWixFQUF3QixXQUF4QjtBQURLLENBQWQ7O0FBSUEsSUFBTUcsaUJBQWlCO0FBQ3JCSCxTQUFPLENBQUMsa0JBQUQsRUFBb0IsV0FBcEIsRUFBZ0MsZUFBaEMsRUFBZ0QsTUFBaEQsRUFBdUQsZUFBdkQsRUFBdUUsT0FBdkUsRUFBK0UsbUJBQS9FO0FBRGMsQ0FBdkI7O0FBSUEsSUFBTUksYUFBYTtBQUNqQkosU0FBTyxDQUFDLGVBQUQsRUFBaUIsbUJBQWpCLEVBQXFDLFdBQXJDLEVBQWlELFlBQWpELEVBQThELFNBQTlELEVBQXdFLGNBQXhFLEVBQXVGLFlBQXZGO0FBRFUsQ0FBbkI7O0FBSUEsSUFBTUssV0FBVztBQUNmTCxTQUFPLENBQUMsY0FBRCxFQUFnQixVQUFoQixFQUEyQixTQUEzQixFQUFxQyxPQUFyQztBQURRLENBQWpCOztBQUlBTSxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFNBQU8sQ0FEUTtBQUVmQyxXQUFTO0FBQ1BWLHdDQURPO0FBRVBFLHNDQUZPO0FBR1BDLGdCQUhPO0FBSVBDLGtDQUpPO0FBS1BDLDBCQUxPO0FBTVBDO0FBTk87QUFGTSxDQUFqQiIsImZpbGUiOiJvcmdhbmlzbXMuY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBjb250YWN0TmF2aWdhdGlvbiA9IHtcbiAgaXRlbXM6IFsnQ29udGFjdCBVcycsICdMb2NhdGlvbiAmIE1hcHMnXVxufTtcblxuY29uc3QgZm9vdGVyTmF2aWdhdGlvbiA9IHtcbiAgaXRlbXM6IFsnVGhlIEFydHMnLCAnRW1lcmdlbmN5JywgJ1RDQ1MnLCAnQXRobGV0aWNzJywgJ0VtcGxveW1lbnQnLCAnQWNjZXNzaWJpbGl0eSddXG59O1xuXG5jb25zdCBsZWdhbCA9IHtcbiAgaXRlbXM6IFsnUHJpdmFjeScsICdGZWVkYmFjaycsICdEaXJlY3RvcnknXVxufTtcblxuY29uc3QgbWFpbk5hdmlnYXRpb24gPSB7XG4gIGl0ZW1zOiBbJ0FkbWlzc2lvbnMgJiBBaWQnLCdBY2FkZW1pY3MnLCdMaWZlIEAgUG9tb25hJywnSG9tZScsJ05ld3MgJiBFdmVudHMnLCdBYm91dCcsJ0FsdW1uaSAmIEZhbWlsaWVzJ11cbn07XG5cbmNvbnN0IHF1aWNrbGlua3MgPSB7XG4gIGl0ZW1zOiBbJ0EtWiBEaXJlY3RvcnknLCdBY2FkZW1pYyBDYWxlbmRhcicsJ0F0aGxldGljcycsJ0NhbXB1cyBNYXAnLCdDYXRhbG9nJywnRGluaW5nIE1lbnVzJywnR2l2ZSBUb2RheSddXG59O1xuXG5jb25zdCBwYWdlc0ZvciA9IHtcbiAgaXRlbXM6IFsnTmV3IFN0dWRlbnRzJywnU3R1ZGVudHMnLCdGYWN1bHR5JywnU3RhZmYnXVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG9yZGVyOiAzLFxuICBjb250ZXh0OiB7XG4gICAgY29udGFjdE5hdmlnYXRpb24sXG4gICAgZm9vdGVyTmF2aWdhdGlvbixcbiAgICBsZWdhbCxcbiAgICBtYWluTmF2aWdhdGlvbixcbiAgICBxdWlja2xpbmtzLFxuICAgIHBhZ2VzRm9yXG4gIH1cbn07XG5cbiJdfQ==
