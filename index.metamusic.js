import express from 'express';
import figlet from 'figlet';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { promisify } from 'util';
import * as uriTemplate from 'uri-template';

import { AlbumService } from '/src/albums.js';
import { AlbumServicePacalCaseStrategy, AlbumServiceCamelCaseStrategy, AlbumServiceRandomStrategy } from '/src/strategies.js';


const PORT = 3000;
const APP_NAME = process.env.APP_NAME || 'metamusic';
const APP_VERSION = process.env.APP_VERSION || '0.0.1';
const PATCH_SCHEMA_TEMPLATE_URI = `http://${APP_NAME}:3000/schemas/album/{albumId}/patch{?version,name}`;

const figletize = promisify(figlet);
const banner = await figletize(`${APP_NAME} v${APP_VERSION}`);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('tiny'));

const strategies = {
  v1: new AlbumServicePacalCaseStrategy(),
  v2: new AlbumServiceCamelCaseStrategy(),
  latest: new AlbumServiceRandomStrategy()
};

const resolvedPatches = {
  v1 : {},
  v2: {},
  latest: {}
};

const myAlbumService = new AlbumService();
const strategyNames = Object.keys(strategies);
const chooseRandomStrategy = (strategies) => {
  return strategies[Math.floor(Math.random()* strategies.length)];
};

/**
 * Get album metadata by album id
 */
app.get('/albums/:id', async (req, res) => {
  const version = req.query.version || chooseRandomStrategy(strategyNames);
  const albumId = req.params.id;

  myAlbumService.setStrategy(strategies[version]);

  const album = await myAlbumService.getAlbum(albumId);
  const albumList = [album];
  const tpl = uriTemplate.parse(PATCH_SCHEMA_TEMPLATE_URI);
  const name = myAlbumService.name;
  
  if (!resolvedPatches[version][req.params.id]) {
    resolvedPatches[version][req.params.id] = myAlbumService.generateAlbumPatchSpec(album);;
  }
  
  res.set({
    'x-vendor-metamusic-schema-patch': tpl.expand({
      albumId,
      version,
      name: myAlbumService.name
    }),
    'x-vendor-metamusic-schema-version': `${version}:${name}`
  });

  return res.json({
    _links: {
      self: {
        href: `http://metamusic:3000/albums/${albumId}`
      },
      get_patch_schema: {
        href: tpl.expand({
          albumId,
          version,
          name: myAlbumService.name
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
        href: `http://metamusic:3000/schemas/album/${albumId}/patch{?version,name}`,
        title: 'The patch schema for this resource',
        templated: true
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
  console.info(`Metamusic listening on port ${PORT}`);
});

