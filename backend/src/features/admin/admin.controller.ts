import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service';

export const getStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getSystemStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, role } = req.query;
    const users = await adminService.getAllUsers(search as string, role as string);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await adminService.createAdminUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;
    const updated = await adminService.updateUserRole(id, role);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const toggleStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const updated = await adminService.updateUserStatus(id, status);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const resetProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const result = await adminService.resetUserProgress(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const result = await adminService.deleteUserById(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getQuestions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const questions = await adminService.getAllQuestions();
    res.json({ success: true, data: questions });
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await adminService.createQuizQuestion(req.body);
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const result = await adminService.deleteQuizQuestion(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getLabs = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const telemetry = await adminService.getLabTelemetry();
    res.json({ success: true, data: telemetry });
  } catch (error) {
    next(error);
  }
};

export const getAnnouncements = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await adminService.getAnnouncements();
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ann = await adminService.createAnnouncement(req.body);
    res.status(201).json({ success: true, data: ann });
  } catch (error) {
    next(error);
  }
};

export const toggleAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const updated = await adminService.toggleAnnouncementStatus(id);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const result = await adminService.deleteAnnouncementById(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
