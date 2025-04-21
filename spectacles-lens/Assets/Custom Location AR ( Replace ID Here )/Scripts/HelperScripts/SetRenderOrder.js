// SetRenderOrder.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: Set the render order of a post effect component

// @input Component.PostEffectVisual segmentation
// @input int renderOrder = 1000

if (script.segmentation) {
    script.segmentation.setRenderOrder(script.renderOrder);
}