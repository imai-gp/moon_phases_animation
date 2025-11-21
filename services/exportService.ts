/* eslint-disable @typescript-eslint/no-explicit-any */
declare const GIF: any;

/**
 * Triggers a download of a Blob.
 */
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Serializes an SVG element to a string, handling basic CSS inlining if needed.
 */
export const exportSVG = (svgElement: SVGSVGElement, filename: string) => {
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svgElement);
  
  // Add XML declaration
  const fullSvg = `<?xml version="1.0" standalone="no"?>\r\n` + source;
  
  const blob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, filename);
};

/**
 * Records a GIF using the gif.js library (loaded via CDN).
 * Since we are drawing SVGs, we need to rasterize them to a canvas first for each frame.
 */
export const generateGIF = async (
  angleGetter: () => number,
  angleSetter: (a: number) => void,
  rendererFn: () => Promise<HTMLCanvasElement>,
  totalFrames: number = 60
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof GIF === 'undefined') {
      alert('GIF library not loaded properly.');
      reject('GIF library missing');
      return;
    }

    // We need to construct a worker script blob because we can't load external worker files easily in this setup
    const workerBlob = new Blob([`
      importScripts('https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js');
    `], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(workerBlob);

    const gif = new GIF({
      workers: 2,
      quality: 10,
      workerScript: workerUrl,
      width: 800, // Output width
      height: 400 // Output height
    });

    const originalAngle = angleGetter();
    let currentFrame = 0;

    const captureFrame = async () => {
      if (currentFrame >= totalFrames) {
        // Finish
        angleSetter(originalAngle); // Reset
        gif.on('finished', (blob: Blob) => {
          downloadBlob(blob, 'moon-phases.gif');
          URL.revokeObjectURL(workerUrl);
          resolve();
        });
        gif.render();
        return;
      }

      // Calculate angle for this frame
      const frameAngle = (currentFrame / totalFrames) * 360;
      angleSetter(frameAngle);

      // Wait for React to render/update DOM? 
      // React updates are async. We need to wait a tick.
      await new Promise(r => setTimeout(r, 50));

      try {
        const canvas = await rendererFn();
        gif.addFrame(canvas, { delay: 100 }); // 100ms delay = 10fps
        currentFrame++;
        captureFrame();
      } catch (e) {
        reject(e);
      }
    };

    captureFrame();
  });
};

// Helper to draw SVG to Canvas
export const svgToCanvas = (svgElement: SVGSVGElement, width: number, height: number): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const img = new Image();
    
    // Check for encoded characters issues
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject('No context');
        return;
      }
      // Fill background (slate-950 equivalent)
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
};
