
const port = process.env.PORT || 3000;

import mongodb from './shared/mongodb';
mongodb(process.env.MONGO_URI || 'mongodb://onura:test@localhost/indoorMap');

import app from './app';

import logger from './common/logger';
logger.info(`Starting server`, {
  pid: process.pid,
  time: (new Date()).toLocaleString(),
});

app.listen(port);
