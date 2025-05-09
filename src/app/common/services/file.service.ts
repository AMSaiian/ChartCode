import { Injectable } from '@angular/core';
import { NodeDto } from '../dto/layout.dto';
import { FlowchartState } from './flowchart.service';
import serializer from '../utils/flowchart-serializer';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  async saveFlowchartToFile(state: FlowchartState, filename = 'diagram.chrtcd'): Promise<void> {
    try {
      const superJson = serializer.serialize(state);
      const jsonString = JSON.stringify(superJson);
      const binary = new TextEncoder().encode(jsonString);

      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'ChartCode Flowchart File',
          accept: { 'application/octet-stream': ['.chrtcd'] }
        }],
        excludeAcceptAllOption: true
      });

      const writable = await handle.createWritable();
      await writable.write(binary);
      await writable.close();
    } catch (err) {
      console.error('Save cancelled or failed:', err);
    }
  }

  async loadFlowchartFromFile(): Promise<FlowchartState | null> {
    try {
      const [handle] = await (window as any).showOpenFilePicker({
        types: [{
          description: 'ChartCode Flowchart File',
          accept: { 'application/octet-stream': ['.chrtcd'] }
        }],
        excludeAcceptAllOption: true,
        multiple: false
      });

      const file = await handle.getFile();
      const content = await file.text(); // decode from UTF-8
      const parsed = JSON.parse(content);
      const restored = serializer.deserialize<FlowchartState>(parsed);

      return restored;
    } catch (err) {
      console.error('File load cancelled or failed:', err);
      return null;
    }
  }

  async exportToJpg(flowchart: SVGSVGElement, procedureElement: NodeDto) {
    flowchart.setAttribute('width', `${procedureElement.width}`);
    flowchart.setAttribute('height', `${procedureElement.height}`);
    flowchart.setAttribute('viewBox', `0 0 ${procedureElement.width} ${procedureElement.height}`);

    const controls = flowchart.querySelector('.svg-pan-zoom-control');
    if (controls) controls.remove();

    const viewport = flowchart.querySelector('.svg-pan-zoom_viewport') as SVGGElement;
    if (viewport) {
      viewport.removeAttribute('transform');
      viewport.removeAttribute('style');
    }

    const jpegBlob = await this.convertSvgToJpeg(flowchart);

    const handle = await (window as any).showSaveFilePicker({
      suggestedName: 'flowchart.jpg',
      types: [
        {
          description: 'JPEG Image',
          accept: { 'image/jpeg': ['.jpg', '.jpeg'] },
        },
      ],
    });

    const writable = await handle.createWritable();
    await writable.write(jpegBlob);
    await writable.close();
  }

  async convertSvgToJpeg(svgElement: SVGSVGElement): Promise<Blob> {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context is null'));
        }

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to Blob'));
            }
          },
          'image/jpeg',
          1.0,
        );
        URL.revokeObjectURL(url);
      };
      img.onerror = reject;
      img.src = url;
    });
  }
}
