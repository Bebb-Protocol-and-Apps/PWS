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
    sandboxPortal: { default: true },
  },

  init: function() {
    const el = this.el;
    const data = this.data;

    if (data.autoSceneStyling) {
      el.sceneEl.style.position = 'absolute';
      el.sceneEl.style.zIndex = '1';
    }

    if (data.isInteractable) {
      //geometry for click detection
      el.setAttribute('geometry', `primitive:plane; width:${data.width}; height:${data.height};`);

      el.addEventListener('click', function() {
        // Make the iframe take the full viewport when trying to interact
        if (data.mouseHasLeftScreen) {
          document.exitPointerLock();
          data.context.domElement.style.zIndex = '2000';
          data.context.domElement.style.width = '100%';
          data.context.domElement.style.height = '100%';
          data.mouseHasLeftScreen = false;
        }
      });

      el.addEventListener('mouseenter', function() {
        data.context.domElement.style.zIndex = '0';
      });

      el.addEventListener('mouseleave', function() {
        data.mouseHasLeftScreen = true;
      });
    }

    el.addEventListener('cam-loaded', function() {
      const iframe = document.createElement('iframe');
      iframe.setAttribute('id', data.url);
      iframe.setAttribute('src', data.url);
      // Secure iframe
      iframe.setAttribute('referrerpolicy', 'no-referrer');
      if (data.sandboxPortal) {
        //iframe.setAttribute('credentialless', 'true');
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
      }
      iframe.style.border = 'none';

      const camera = el.sceneEl.camera;
      const context = new DOMContext(camera, el);
      context.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(context.domElement);

      const element = new DOMElement(context, iframe, data.width, data.height);
      let isInVRMode = el.sceneEl.is('vr-mode');
      let isInFullscreenMode = document.fullscreenElement != null;
      if (!isInVRMode && !isInFullscreenMode) {
        el.object3D.add(element);
      }

      if (data.isInteractable) {
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.top = '0';
        div.style.width = '100%';
        div.style.height = '100%';
        div.style.zIndex = '1'; // Placed below the iframe but above the A-Frame scene
        context.domElement.appendChild(div);

        div.addEventListener('click', function() {
          // Minimize or hide the iframe when the interaction is done
          data.context.domElement.style.zIndex = '0';
          data.context.domElement.style.width = '0';
          data.context.domElement.style.height = '0';
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
    el.sceneEl.addEventListener('enter-vr', function() {
      el.object3D.remove(data.element);
    });

    el.sceneEl.addEventListener('exit-vr', function() {
      el.object3D.add(data.element);
    });

    el.sceneEl.addEventListener('enter-fullscreen', function() {
      el.object3D.remove(data.element);
    });

    el.sceneEl.addEventListener('exit-fullscreen', function() {
      el.object3D.add(data.element);
    });

    data.frames = 0;
    data.isCamLoaded = false;
  },

  tick: function() {
    const el = this.el;
    const data = this.data;

    if (data.isPaused) return;

    if (!data.isCamLoaded) {
      const camera = el.sceneEl.camera;
      if (camera) {
        this.el.emit('cam-loaded');
        data.isCamLoaded = true;
      }
      return;
    }

    const context = data.context;
    const element = data.element;
    if (data.frames % data.frameSkips === 0) {
      if (context) {
        context.update();
      }
      if (element) {
        element.update(el.object3D);
      }
    }

    data.frames++;
  },

  pause: function() {
    this.data.isPaused = true;
  },

  play: function() {
    this.data.isPaused = false;
  },
});
