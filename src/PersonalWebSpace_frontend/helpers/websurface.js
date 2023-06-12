//uses a modified version of https://github.com/CodyJasonBennett/three-dom-elements
import { DOMContext } from './lib/DOMContext';
import { DOMElement } from './lib/DOMElement';

export const component = AFRAME.registerComponent('websurface', {
  schema: {
    url: { default: 'https://aframe.io' },
    width: { default: 1 },
    height: { default: 0.75 },
    isInteractable: { default: true },
    frameSkips: { default: 1 },
    autoSceneStyling: { default: true },
  },

  init: function () {
    const el = this.el;
    const data = this.data;

    if (data.autoSceneStyling == true) {
      el.sceneEl.style.position = 'absolute';
      el.sceneEl.style.zIndex = '1';
    }

    if (data.isInteractable == true) {
      data.mouseHasLeftScreen = true;
      //geometry for click detection
      el.setAttribute('geometry', `primitive:plane; width:${data.width}; height:${data.height};`);

      el.addEventListener('click', function () {
        if (data.mouseHasLeftScreen == false) return;
        document.exitPointerLock();
        el.sceneEl.style.zIndex = '-1';
        data.mouseHasLeftScreen = false;
      });

      el.addEventListener('mouseenter', function () {
        data.context.domElement.style.zIndex = '0';
      });

      el.addEventListener('mouseleave', function () {
        data.context.domElement.style.zIndex = '-2';
        data.mouseHasLeftScreen = true;
      });
    }

    el.addEventListener('cam-loaded', function () {
      const iframe = document.createElement('iframe');
      iframe.setAttribute('id', data.url);
      iframe.setAttribute('src', data.url);
      // Secure iframe
      //iframe.setAttribute('credentialless', 'true');
      iframe.setAttribute('referrerpolicy', 'no-referrer');
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');      
      iframe.style.border = 'none';

      const camera = el.sceneEl.camera;
      const context = new DOMContext(camera, el);
      context.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(context.domElement);

      const element = new DOMElement(context, iframe, data.width, data.height);
      
      // Add the iframe visualization to the element only if the user currently isn't in VR/fullscreen mode
      let isInVRMode = el.sceneEl.is('vr-mode'); // returns true if in VR mode
      let isInFullscreenMode = document.fullscreenElement != null; // returns true if in Fullscreen mode
      if (!isInVRMode && !isInFullscreenMode) {
        el.object3D.add(element);
      };

      if (data.isInteractable == true) {
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.top = '0';
        div.style.width = '100%';
        div.style.height = '100%';
        div.style.zIndex = '-1';
        context.domElement.appendChild(div);
        div.addEventListener('click', function () {
          el.sceneEl.style.zIndex = 1;
        });
      }

      this.websurface_iframe = iframe;
      this.css3d_context = context;

      data.context = context;
      data.element = element;

      window.addEventListener('resize', () => {
        context.setSize(window.innerWidth, window.innerHeight);
      });
    });

    // Iframes don't work in VR/fullscreen mode, so we remove the texture based on them
    el.sceneEl.addEventListener('enter-vr', function () {
      el.object3D.remove(data.element);
    });
  
    el.sceneEl.addEventListener('exit-vr', function () {
      el.object3D.add(data.element);
    });

    el.sceneEl.addEventListener('enter-fullscreen', function () {
      el.object3D.remove(data.element);
    });
  
    el.sceneEl.addEventListener('exit-fullscreen', function () {
      el.object3D.add(data.element);
    });

    data.frames = 0;
    data.isCamLoaded = false;
  },

  tick: function () {
    const el = this.el;
    const data = this.data;

    if (data.isPaused == true) return;

    if (data.isCamLoaded == false) {
      const camera = el.sceneEl.camera;
      if (camera) {
        this.el.emit('cam-loaded');
        data.isCamLoaded = true;
      }
      return;
    }

    const context = data.context;
    const element = data.element;
    if (data.frames % data.frameSkips == 0) {
      if (context) {
        context.update();
      }
      if (element) {
        element.update(el.object3D);
      }
    }

    data.frames++;
  },

  pause: function () {
    const data = this.data;

    data.isPaused = true;
  },

  play: function () {
    const data = this.data;

    data.isPaused = false;
  },
});
