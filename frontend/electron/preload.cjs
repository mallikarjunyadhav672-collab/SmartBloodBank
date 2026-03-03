const { contextBridge } = require('electron');

// Expose a minimal API to the renderer if needed
contextBridge.exposeInMainWorld('electron', {
  // noop for now, add secure APIs here when required
});
