import express, {type Request, type Response } from "express";
import morgan from 'morgan';
import SRouter from "./routes/studentRoutes.js";
import CRouter from "./routes/courseRoutes.js";
//import db
//import { students, course } from "./db/db.ts";

const app: any = express();
//const port = 3000;

//Middleware
app.use(express.json());
app.use(morgan('dev'));

app.listen(3000, () =>
  console.log("🚀 Server running on http://localhost:3000")
);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "lab 15 API service successfully",
  });
});

//endpoint me
app.get("/me",(req: Request, res: Response) => {
    return res.status(200).json({
	success : true,
	message : "Student Information",
	data : {
		studentId : "670612198",
		firstName : "Radissara",
		lastName : "Thananukul",
		program : "CPE",
		section : "801"
        }
    });
});

app.use("/api/students",SRouter);
app.use("/api/courses",CRouter);

export default app;
