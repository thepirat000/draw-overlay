// Draw mode (D) / Interact mode (I)
// Colors:
// R = Red
// G = Green
// B = Blue
// Pen widths:
// 1 = Thin
// 2 = Medium
// 3 = Thick
// Shift + drag = Straight lines
// C = Clear
// H = Hide/show overlay (preserves drawing)
// X = Remove overlay completely

(() => {
  if (window.__drawOverlayCleanup) {
    window.__drawOverlayCleanup();
    return;
  }

  const state = {
    color: "red",
    width: 3,
    mode: "draw",
    hidden: false,
    drawing: false,
    startX: 0,
    startY: 0,
    snapshot: null
  };

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    cursor: "crosshair",
    pointerEvents: "auto"
  });

  document.body.appendChild(canvas);

  const toolbar = document.createElement("div");

  Object.assign(toolbar.style, {
    position: "fixed",
    top: "10px",
    right: "10px",
    zIndex: "2147483647",
    background: "rgba(0,0,0,.8)",
    color: "white",
    font: "12px monospace",
    padding: "8px",
    borderRadius: "6px",
    userSelect: "none"
  });

  document.body.appendChild(toolbar);

  function updateToolbar() {
    toolbar.innerHTML = `
      <div><b>DRAW OVERLAY</b></div>
      <div>Mode: ${state.mode.toUpperCase()}</div>
      <div>Color: ${state.color}</div>
      <div>Width: ${state.width}px</div>
      <div>D/I R/G/B 1/2/3</div>
      <div>Shift=line</div>
      <div>C=clear H=hide X=remove</div>
    `;
  }

  function configurePen() {
    ctx.strokeStyle = state.color;
    ctx.lineWidth = state.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  function resizeCanvas() {
    const temp = document.createElement("canvas");
    temp.width = canvas.width;
    temp.height = canvas.height;

    if (canvas.width && canvas.height) {
      temp.getContext("2d").drawImage(canvas, 0, 0);
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.drawImage(temp, 0, 0);

    configurePen();
  }

  function updateMode() {
    canvas.style.pointerEvents =
      state.mode === "draw" ? "auto" : "none";

    canvas.style.cursor =
      state.mode === "draw" ? "crosshair" : "default";

    updateToolbar();
  }

  resizeCanvas();
  configurePen();
  updateToolbar();

  canvas.addEventListener("mousedown", e => {
    if (state.mode !== "draw") return;

    state.drawing = true;
    state.startX = e.clientX;
    state.startY = e.clientY;

    if (e.shiftKey) {
      state.snapshot = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );
    } else {
      ctx.beginPath();
      ctx.moveTo(e.clientX, e.clientY);
    }
  });

  canvas.addEventListener("mousemove", e => {
    if (!state.drawing || state.mode !== "draw") return;

    if (e.shiftKey) {
      ctx.putImageData(state.snapshot, 0, 0);

      ctx.beginPath();
      ctx.moveTo(state.startX, state.startY);
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();
    } else {
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();
    }
  });

  window.addEventListener("mouseup", () => {
    state.drawing = false;
    state.snapshot = null;
  });

  function keyHandler(e) {
    switch (e.key.toLowerCase()) {
      case "r":
        state.color = "red";
        break;

      case "g":
        state.color = "lime";
        break;

      case "b":
        state.color = "deepskyblue";
        break;

      case "1":
        state.width = 1;
        break;

      case "2":
        state.width = 3;
        break;

      case "3":
        state.width = 6;
        break;

      case "d":
        state.mode = "draw";
        updateMode();
        break;

      case "i":
        state.mode = "interact";
        updateMode();
        break;

      case "c":
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        break;

      case "h":
        state.hidden = !state.hidden;
        canvas.style.display =
          state.hidden ? "none" : "block";
        toolbar.style.display =
          state.hidden ? "none" : "block";
        break;

      case "x":
        cleanup();
        return;

      default:
        return;
    }

    configurePen();
    updateToolbar();

    e.preventDefault();
    e.stopPropagation();
  }

  function cleanup() {
    window.removeEventListener("keydown", keyHandler, true);
    window.removeEventListener("resize", resizeCanvas);

    canvas.remove();
    toolbar.remove();

    delete window.__drawOverlayCleanup;
  }

  window.addEventListener("keydown", keyHandler, true);
  window.addEventListener("resize", resizeCanvas);

  window.__drawOverlayCleanup = cleanup;

  updateMode();
})();