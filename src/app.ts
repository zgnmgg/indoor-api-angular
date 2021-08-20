import express from 'express';
import routes from './routers';
import bodyParser from 'body-parser';
import cors from 'cors';
import i18next from 'i18next';
import i18nextMiddleware from 'i18next-http-middleware';
import i18nFsBackend from 'i18next-node-fs-backend';
import {errorHandler} from './common/error';

const app = express();

// noinspection JSIgnoredPromiseFromCall
i18next
    .use(i18nFsBackend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
      backend: {
        loadPath: `${__dirname}/locales/{{lng}}/{{ns}}.json`,
      },
      detection: {
        order: ['header', 'querystring', 'cookie'],
        caches: false
      },
      fallbackLng: 'tr',
      preload: ['tr', 'en']
    });

app.use(i18nextMiddleware.handle(i18next));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());

app.use(cors({
  origin: 'http://localhost:4200',
  methods: 'GET,HEAD,PUT,PATCH,POST,OPTIONS,DELETE',
  allowedHeaders: 'Content-Type, Authorization, Content-Length, X-Requested-With',
  preflightContinue: false,
  optionsSuccessStatus: 200,
}));

app.use(routes);

app.use(errorHandler);

export default app;
