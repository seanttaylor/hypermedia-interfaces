import express from 'express';
import figlet from 'figlet';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import * as uriTemplate from 'uri-template';
import jsonPatch from 'fast-json-patch';
import { promisify } from 'util';


import { albums } from './albums.js';

const PORT = 3001;
const APP_NAME = process.env.APP_NAME || 'muzak';
const APP_VERSION = process.env.APP_VERSION || '0.0.1';
const METAMUSIC_URL = process.env.METAMUSIC_URL;

const figletize = promisify(figlet);
const banner = await figletize(`${APP_NAME} v${APP_VERSION}`);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('tiny'));
 
/**
 * Get an album by id
 */
app.get('/albums/:id', async (req, res) => {
  const albumId = req.params.id;
  const album = albums[albumId];
  const albumList = [album];

  try {
    const metadataRequest = await fetch(`${METAMUSIC_URL}/albums/${albumId}`);
    const albumMetadataResponse = await metadataRequest.json();
    const PATCH_SCHEMA_URI = albumMetadataResponse._links.get_patch_schema.href;
    const [albumMetadata] = albumMetadataResponse.albums;

    console.log(albumMetadataResponse)
    
    const tpl = uriTemplate.parse(PATCH_SCHEMA_URI);
    const uri = tpl.expand({
        albumId,
        version: 'latest'
    });

    const patchSchemaRequest = await fetch(uri);
    const patchSchemaResponse = await patchSchemaRequest.json();
    const [ patchSpecification ] = patchSchemaResponse.patches
    const { operations } = patchSpecification;

    console.log({ patchSchemaResponse, operations });
    
    const patchedAlbumMetadata = jsonPatch.applyPatch(albumMetadata, operations).newDocument;
    console.log(patchedAlbumMetadata);

  } catch(ex) {
    console.error(ex);
  }

  return res.json({
    _links: {
      self: {
        href: `http://muzak:3001/albums/${req.params.id}`
      },
    }, 
    albums: albumList,
    entries: albumList.length 
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