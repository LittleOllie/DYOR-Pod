export function getCanvasDevicePixelRatio(): number {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, 2);
}

/** CSS pixel dimensions with a 1px floor so engine math never runs at 0×0. */
export function normalizeCanvasCssSize(width: number, height: number): {
  width: number;
  height: number;
} {
  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  };
}

export function applyCanvasSize(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number,
): { cssWidth: number; cssHeight: number; dpr: number } {
  const dpr = getCanvasDevicePixelRatio();
  const { width, height } = normalizeCanvasCssSize(cssWidth, cssHeight);
  const pixelWidth = Math.round(width * dpr);
  const pixelHeight = Math.round(height * dpr);

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  return { cssWidth: width, cssHeight: height, dpr };
}

export function applyCanvasTransform(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
): void {
  const dpr = canvas.width / Math.max(1, canvas.clientWidth);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function isCanvasContainerReady(width: number, height: number): boolean {
  return width >= 1 && height >= 1;
}
