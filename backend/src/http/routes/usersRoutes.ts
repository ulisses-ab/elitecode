import express, { RequestHandler } from 'express';
import { UsersController } from '../controllers/UsersController';

export function createUsersRoutes(
  authMiddleware: RequestHandler, 
  userController: UsersController
) {
  const router = express.Router();

  router.get("/me",
    authMiddleware,
    userController.getUser.bind(userController)
  );

  router.get("/me/profile",
    authMiddleware,
    userController.getUserProfile.bind(userController)
  );

  router.patch("/me/handle",
    authMiddleware,
    userController.updateUsername.bind(userController)
  );

  return router;
}