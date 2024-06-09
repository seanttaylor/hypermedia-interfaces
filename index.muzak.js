import express from 'express';
import figlet from 'figlet';
import bodyParser from 'body-parser';
import morgan from 'morgan';
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
    const [ albumMetadata ] = albumMetadataResponse.albums;

    console.log(metadataRequest.headers);

    // console.log('********* API response received from metamusic *********');
    // console.log( { albumMetadataResponse });

    // console.log('********* album metadata received from metamusic *********');
    // console.log({ albumMetadata: JSON.stringify(albumMetadata) });
   
    const patchSchemaRequest = await fetch(PATCH_SCHEMA_URI);
    const patchSchemaResponse = await patchSchemaRequest.json();
    const [ patchSpecification ] = patchSchemaResponse.patches
    const { operations } = patchSpecification;

    // console.log('********* patch schema received from metamusic *********');
    // console.log({ operations });
    
    const patchedAlbumMetadata = jsonPatch.applyPatch({ ...album, ...albumMetadata }, operations).newDocument;

    // console.log('********* patch schema applied metadata from metamusic *********');
    // console.log({ patchedAlbumMetadata: JSON.stringify(patchedAlbumMetadata) });

    return res.json({
      _links: {
        self: {
          href: `http://muzak:3001/albums/${req.params.id}`
        }, 
        partner_patch_schema: {
          href: `${PATCH_SCHEMA_URI}`,
          title: `Uri referencing the JSON Patch document provided by an upstream API partner to translate to the interface schema`
        }
      }, 
      albums: [ patchedAlbumMetadata ],
      entries: albumList.length 
    });

  } catch(ex) {
    console.error(ex);
  }

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
  console.info(`Muzak listening on port ${PORT}`);
});