import express from 'express';
import figlet from 'figlet';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { promisify } from 'util';

import { albums, generateAlbumTrackPatchSpec } from './albums.js';

const PORT = 3000;
const APP_NAME = process.env.APP_NAME || 'metamusic';
const APP_VERSION = process.env.APP_VERSION || '0.0.1';
const PATCH_SCHEMA_TEMPLATE_URI = `http://${APP_NAME}:3000/schemas/album/{albumId}/patch{?version}`

const figletize = promisify(figlet);
const banner = await figletize(`${APP_NAME} v${APP_VERSION}`);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('tiny'));

const basePatch = {
  latest: [
    { op: 'move', from: '/AlbumId', path: '/album_id' },
    { op: 'move', from: '/AlbumTitle', path: '/album_title' },
    { op: 'move', from: '/ReleaseDate', path: '/release_date' },
    { op: 'move', from: '/Genre', path: '/genre' },
    { op: 'move', from: '/Tracks', path: '/tracks' },
    { op: 'move', from: '/Artist', path: '/artist' },
  ],
  v2: [
    { op: 'move', from: '/albumId', path: '/album_id' },
    { op: 'move', from: '/albumTitle', path: '/album_title' },
    { op: 'move', from: '/releaseDate', path: '/release_date' },
    { op: 'move', from: '/genre', path: '/genre' },
    { op: 'move', from: '/tracks', path: '/tracks' },
    { op: 'move', from: '/artist', path: '/artist' },
  ],
};

const renderedPatches = {
  latest: {},
  v2: {}
}; 

/**
 * Get album metadata by album id
 */
app.get('/albums/:id', async (req, res) => {
  const album = albums[req.params.id];
  const albumList = [album];
  const version = req.query.version || 'latest';
  const patchSpec = generateAlbumTrackPatchSpec(album.Tracks, basePatch.latest);

  renderedPatches[version][req.params.id] = patchSpec;

  return res.json({
    _links: {
      self: {
        href: `http://metamusic:3000/albums/${req.params.id}`
      },
      get_patch_schema: {
        href: PATCH_SCHEMA_TEMPLATE_URI,
        title: 'Get JSON Patch specification to translate this resource to service interface schemas',
        templated: true
      }
    }, 
    albums: albumList,
    entries: albumList.length 
  });
});

/**
 * Get get ablum patch schema
 */
app.get('/schemas/album/:id/patch', async (req, res) => {
  const albumId = req.params.id;
  const version = req.query.version || 'latest';
    
  return res.json({
    _links: {
      self: {
        href: `http://metamusic:3000/schemas/album/${albumId}/patch`
      },
      get_album: {
        href: `http://metamusic:3000/albums/{albumId}`,
        title: 'Get album metadata by id',
        templated: true
      }
    },
    patches: [{
      id: albumId,
      version,
      operations: renderedPatches[version][albumId],
      operationCount: renderedPatches[version][albumId].length
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

