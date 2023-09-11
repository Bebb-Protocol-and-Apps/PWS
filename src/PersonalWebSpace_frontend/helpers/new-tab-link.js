export const component = AFRAME.registerComponent('new-tab-link', {
  schema: {
    href: { default: 'https://aframe.io' },
  },

  init: function() {
    this.el.addEventListener('click', (e) => {
      if (!document.body.classList.contains('aframe-inspector-opened')) {
        // Only open if Inspector isn't opened.
        window.open(this.data.href, '_blank');
      };
    })
  },
});
