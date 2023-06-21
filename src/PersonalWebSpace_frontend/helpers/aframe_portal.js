AFRAME.registerComponent('neighbor-portal', {
  schema: {
    url: { default: 'https://aframe.io' },
    text: { default: '' },
    width: { default: 1.5 },
    height: { default: 2.4 },
    frameWidth: { default: 0.15 },
    enableFrame: { default: true },
  },

  init: function () {
    const el = this.el;
    const data = this.data;
    const scene = this.el.sceneEl;

    el.object3D.position.y += data.height / 2;

    var iframe;

    el.setAttribute('geometry', { primitive: 'plane', width: data.width, height: data.height });
    el.setAttribute('material', { color: '' });

    iframe = document.createElement('iframe');
    iframe.src = data.url;
    //document.body.appendChild(iframe);

    //iframe.style.position = 'fixed';
    //iframe.style.top = '0';
    //iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.overflow = 'none';

    iframe.style.zIndex = 10;
    //iframe.style.display = 'none';
    el.appendChild(iframe);

    const title = document.createElement('a-text');
    title.setAttribute('value', data.text);
    title.setAttribute('position', `0 ${data.height * 0.5 + 0.25 + data.frameWidth} 0`);
    title.setAttribute('align', 'center');
    title.setAttribute('side', 'double');
    el.appendChild(title);
    data.titleEl = title;

    if (data.enableFrame == true) {
      const frameWidth = data.frameWidth;
      const width = data.width;
      const height = data.height;

      const box1 = document.createElement('a-box');
      box1.setAttribute('position', `${(width + frameWidth) / 2} 0 0`);
      box1.setAttribute('scale', `${frameWidth} ${height} ${frameWidth}`);
      el.appendChild(box1);

      const box2 = document.createElement('a-box');
      box2.setAttribute('position', `${-(width + frameWidth) / 2} 0 0`);
      box2.setAttribute('scale', `${frameWidth} ${height} ${frameWidth}`);
      el.appendChild(box2);

      const box3 = document.createElement('a-box');
      box3.setAttribute('position', `0 ${(height + frameWidth) / 2} 0`);
      box3.setAttribute('scale', `${width + frameWidth * 2} ${frameWidth} ${frameWidth}`);
      el.appendChild(box3);

      const box4 = document.createElement('a-box');
      box4.setAttribute('position', `0 0 ${-frameWidth / 4 - 0.01}`);
      box4.setAttribute('scale', `${width + frameWidth * 2} ${height + frameWidth * 2} ${frameWidth / 2}`);
      el.appendChild(box4);
    };

    el.addEventListener('click', function () {
        window.location.href = data.url;
    });
  },

  update: function () {
    const data = this.data;

    data.titleEl.setAttribute('value', data.text);
  },
});