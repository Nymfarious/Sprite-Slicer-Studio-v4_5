/**
 * Draw an octagon shape on a canvas context
 * @param ctx - Canvas 2D rendering context
 * @param x - X position of the octagon bounding box
 * @param y - Y position of the octagon bounding box
 * @param w - Width of the octagon bounding box
 * @param h - Height of the octagon bounding box
 */
export function drawOctagon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const cut = Math.min(w, h) * 0.29; // ~29% cut for regular octagon look
  ctx.beginPath();
  ctx.moveTo(x + cut, y);
  ctx.lineTo(x + w - cut, y);
  ctx.lineTo(x + w, y + cut);
  ctx.lineTo(x + w, y + h - cut);
  ctx.lineTo(x + w - cut, y + h);
  ctx.lineTo(x + cut, y + h);
  ctx.lineTo(x, y + h - cut);
  ctx.lineTo(x, y + cut);
  ctx.closePath();
}

/**
 * Draw an octagon path for use in canvas clipping or filling
 */
export function drawOctagonPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  drawOctagon(ctx, x, y, w, h);
}
