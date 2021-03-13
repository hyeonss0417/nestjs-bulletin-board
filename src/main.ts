import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.intercepter';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new LoggingInterceptor());

  app.use((req, res, next) => {
    if (isDisableKeepAlive) {
      res.set('Connection', 'close');
    }
    next();
  });

  const sysLogger = new Logger('System', true);

  await app.listen(PORT, () => {
    if (process.send) process.send('ready');
    sysLogger.log(`Server is running on ${PORT}`);
  });

  let isDisableKeepAlive = false;

  process.on('SIGINT', async () => {
    // Disable KeepAlive to disconnect the client from the old app.
    isDisableKeepAlive = true;
    // Do not receive a new request, and exit process after responding to old requests
    app.close().then(() => {
      sysLogger.error('Server closed');
      process.exit(0);
    });
  });
}
bootstrap();
