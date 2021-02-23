import * as functions from 'firebase-functions';
import * as express from 'express';
const useragent = require('express-useragent');
import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as admin from 'firebase-admin';

const db = admin.firestore();

const file = readFileSync(resolve(__dirname, 'index.html'), {
  encoding: 'utf-8',
});

const replacer = (data: string) => {
  return (match: string, content: string): string => {
    return match.replace(content, data);
  };
};

const buildHtml = (event: { [key: string]: string }) => {
  return file
    .replace(
      /<meta name="description" content="(.+)" \/>/gm,
      replacer(event.body?.substr(0, 200))
    )
    .replace(
      /<meta property="og:description" content="(.+)" \/>/gm,
      replacer(event.body?.substr(0, 200))
    )
    .replace(/content="(.+ogp-cover.png)"/gm, replacer(event.thumbnailURL))
    .replace(/<title>(.+)<\/title>"/gm, replacer(event.title))
    .replace(
      /<meta property="og:title" content="(.+)" \/>/gm,
      replacer(event.title)
    )
    .replace(
      /<meta property="og:url" content="(.+)" \/>/g,
      replacer('https://instacircle.web.app/event/' + event.id)
    );
};

const app = express();

app.use(useragent.express());

app.get('/events/:id', async (req: any, res: any) => {
  functions.logger.info('req:', req);
  functions.logger.info('res:', res);
  if (req.useragent.isBot) {
    functions.logger.info('req.useragent.isBot:', req.useragent.isBot);

    const id = req.params.id;
    functions.logger.info('id:', id);

    const event = (await db.doc(`events/${id}`).get())?.data();
    functions.logger.info('event:', event);

    if (event) {
      res.send(buildHtml(event));

      return;
    }
  }

  res.send(file);
  functions.logger.info('file:', file);
});

export const render = functions.https.onRequest(app);
