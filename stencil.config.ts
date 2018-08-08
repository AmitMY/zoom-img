import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'img-zoom',
  outputTargets:[
    {
      type: 'dist'
    },
    {
      type: 'www',
      serviceWorker: null
    }
  ]
};
