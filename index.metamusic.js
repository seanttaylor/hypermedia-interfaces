import express from 'express';
import figlet from 'figlet';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { promisify } from 'util';
import * as uriTemplate from 'uri-template';

import { AlbumService } from '/src/albums.js';
import { AlbumServicePacalCaseStrategy, AlbumServiceCamelCaseStrategy } from '/src/strategies.js';


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
  v3: [
    { op: 'move', from: '/albumIdentifier', path: '/album_id' },
    { op: 'move', from: '/title', path: '/album_title' },
    { op: 'move', from: '/releaseDateISO', path: '/release_date' },
    { op: 'move', from: '/category', path: '/genre' },
    { op: 'move', from: '/trackListing', path: '/tracks' },
    { op: 'move', from: '/artistName', path: '/artist' },
  ],
};

const strategies = {
  v1: new AlbumServicePacalCaseStrategy(),
  latest: new AlbumServiceCamelCaseStrategy()
};

const resolvedPatches = {
  v2: {},
  latest: {}
};

const myAlbumService = new AlbumService();

/**
 * Get album metadata by album id
 */
app.get('/albums/:id', async (req, res) => {
  const version = req.query.version || 'latest';
  const albumId = req.params.id;

  myAlbumService.setStrategy(strategies[version]);

  const album = await myAlbumService.getAlbum(albumId);
  const albumList = [album];
  const patchSpec = myAlbumService.generateAlbumPatchSpec(album);
  const tpl = uriTemplate.parse(PATCH_SCHEMA_TEMPLATE_URI);
  
  resolvedPatches[version][req.params.id] = patchSpec;

  return res.json({
    _links: {
      self: {
        href: `http://metamusic:3000/albums/${albumId}`
      },
      get_patch_schema: {
        href: tpl.expand({
          albumId,
          version,
        }),
        title: 'Get JSON Patch specification to translate this resource to service interface schemas',
        templated: true
      }
    }, 
    albums: albumList,
    entries: albumList.length 
  });
});

/**
 * Get get album patch schema
 */
app.get('/schemas/album/:id/patch', async (req, res) => {
  const albumId = req.params.id;
  const version = req.query.version || 'latest';
    
  return res.json({
    _links: {
      self: {
        href: `http://metamusic:3000/schemas/album/${albumId}/patch`,
        title: 'The patch schema for this resource'
      },
      get_album: {
        href: `http://metamusic:3000/albums/${albumId}`,
        title: 'Get album metadata by id from the provider',
      }
    },
    patches: [{
      id: albumId,
      version,
      operations: resolvedPatches[version][albumId],
      operationCount: resolvedPatches[version][albumId].length
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

