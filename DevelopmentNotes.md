Example how to inject Svelte component into HTML document:
      setTimeout(() => {
        console.log("Login button - Delayed for 1 second.");
        var div = document.createElement('DIV');
        div.setAttribute("style","position: absolute;top: 0;right: 0;width: 100%;height: 2em;display: flex;justify-content: end;align-items: end;z-index: 10;")
        const embed = new Login({
          target: div,
        });
        document.body.prepend(div);
      }, 1000);

Removed dependencies (2023-02-28):
    "lit-html": "^2.6.1",
    "html-webpack-plugin": "5.5.0",
    "stream-browserify": "3.0.0",
    "terser-webpack-plugin": "^5.3.6",