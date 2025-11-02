import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { loginSchema } from "../validation/authSchemas.js";
import { UserService } from "../services/userService.js";
import { env } from "../config/env.js";

const tokenForUser = (id: string, email: string) =>
  jwt.sign({ sub: id, email }, env.jwtSecret, {
    expiresIn: `${env.sessionDurationMinutes}m`,
  });

export const login = (req: Request, res: Response) => {
  try {
    const payload = loginSchema.parse(req.body);
    const user = UserService.verifyCredentials(payload.email, payload.password);

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = tokenForUser(user.id, user.email);
    return res.json({ token, email: user.email });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : "Error" });
  }
};

export const profile = (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  res.json({ id: user.id, email: user.email });
};
