import { Injectable } from '@angular/core';
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
}
