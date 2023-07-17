/* global AFRAME */
AFRAME.registerComponent('video-play-on-click', {
  init: function () {
    this.onClick = this.onClick.bind(this);
  },
  play: function () {
    window.addEventListener('click', this.onClick);
  },
  pause: function () {
    window.removeEventListener('click', this.onClick);
  },
  onClick: function (evt) {
    // Only play video if this element is clicked
    if (evt.target !== this.el) { return; }
    var videoEl = this.el.getAttribute('material').src;
    if (!videoEl) { return; }
    this.el.object3D.visible = true;
    videoEl.play();
  }
});