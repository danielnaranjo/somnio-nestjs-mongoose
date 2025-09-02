import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return current timestamp"', () => {
      expect(appController.getHealth()).toBeTruthy();

      const { health } = appController.getHealth();
      expect(health).toBeGreaterThanOrEqual(0);
    });
  });
});
