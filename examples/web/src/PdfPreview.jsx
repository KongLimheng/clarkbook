import { useEffect, useRef } from "react";
import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export default function PdfPreview({ url }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    const container = containerRef.current;
    let cancelled = false;

    async function render() {
      const doc = await pdfjs.getDocument(url).promise;
      if (cancelled) return;

      container.innerHTML = "";

      const dpr = window.devicePixelRatio || 1;
      const containerWidth = container.clientWidth || 800;

      for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
        if (cancelled) break;

        const page = await doc.getPage(pageNum);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = (containerWidth / baseViewport.width) * dpr;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;
        canvas.style.display = "block";
        canvas.style.marginBottom = "8px";
        canvas.style.boxShadow = "0 1px 4px rgba(0,0,0,0.12)";

        container.appendChild(canvas);

        await page.render({
          canvasContext: canvas.getContext("2d"),
          viewport,
        }).promise;
      }
    }

    render().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="w-full h-full overflow-auto bg-[#f0f0f0] dark:bg-[#1a1a1a] p-4">
      <div ref={containerRef} />
    </div>
  );
}
