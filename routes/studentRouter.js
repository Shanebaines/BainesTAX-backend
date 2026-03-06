import express from 'express';
import Student from '../models/Students.js';
import { getStudents, createStudent, deleteStudent } from '../Controllers/studentControllers.js';

const studentRouter = express.Router();

studentRouter.get('/', getStudents);

studentRouter.post('/', createStudent);

studentRouter.delete('/:id', deleteStudent);    

export default studentRouter;
