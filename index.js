import express from 'express';
import figlet from 'figlet';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { promisify } from 'util';

import { albums, generateAlbumPatchSpec } from './albums.js';

const PORT = 3000;
const APP_NAME = process.env.APP_NAME || 'metamusic';
const APP_VERSION = process.env.APP_VERSION || '0.0.1';
const PATCH_SCHEMA_TEMPLATE_URI = `http://${APP_NAME}:3001/schemas/album/{partnerId}/{version}/patch`

const figletize = promisify(figlet);
const banner = await figletize(`${APP_NAME} v${APP_VERSION}`);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('tiny'));

const basePatch = {
  latest: [
    { op: 'replace', path: '/id', value: '/album_id' },
    { op: 'replace', path: '/title', value: '/album_title' },
    { op: 'replace', path: '/releaseDate', value: '/release_date' },
    { op: 'move', from: '/genre', path: '/genre' },
    { op: 'move', from: '/tracks', path: '/tracks' },
    { op: 'move', from: '/tracks/0/trackId', path: '/tracks/0/track_id' },
    { op: 'move', from: '/tracks/0/trackTitle', path: '/tracks/0/track_title' },
    { op: 'move', from: '/tracks/0/duration', path: '/tracks/0/duration' },
    { op: 'move', from: '/tracks/0/lyrics', path: '/tracks/0/lyrics' },
    { op: 'move', from: '/tracks/0/credits', path: '/tracks/0/credits' },
    { op: 'move', from: '/tracks/0/bpm', path: '/tracks/0/bpm' },
  ]
};

const renderedPatches = {
  latest: {}
}; 

/**
 * Get album metadata by album id
 */
app.get('/albums/:id', async (req, res) => {
  const album = albums[req.params.id];
  const albumList = [album];
  const version = req.query.version || 'latest';
  const patchSpec = generateAlbumPatchSpec(album, basePatch.latest);

  renderedPatches[version][req.params.id] = patchSpec;

  return res.json({
    _links: {
      href: PATCH_SCHEMA_TEMPLATE_URI,
      title: 'Get JSON Patch specification to translate resources to service interface schemas',
      templated: true
    }, 
    albums: albumList,
    entries: albumList.length 
  });
});

/**
 * Get get ablum patch schema
 */
app.get('/schemas/album/:id/:partnerId/patch', async (req, res) => {
  const albumId = req.params.id;
  const version = req.query.version || 'latest';
  const partnerId = req.params.partnerId;
    
  return res.json({
    _links: {},
    patches: [{
      id: albumId,
      partnerId,
      version,
      operations: renderedPatches[version][albumId]
    }] 
  });
});



app.use((req, res) => {
  res.status(404).send({ status: 404, error: 'Not Found' });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error(err);
  res.status(status).send({ status, error: 'There was an error.' });
});

// SERVER START
app.listen(PORT,() => {
  console.log(banner);
  console.info(`Application listening on port ${PORT}`);
});

