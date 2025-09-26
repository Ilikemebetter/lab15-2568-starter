import { Router, type Request, type Response } from "express";
import {type Student} from "../libs/types.js";
import { students, courses } from "../db/db.js";
import {
  zStudentPostBody,
  zStudentPutBody,
  zStudentDeleteBody,
  zStudentId,
} from "../schemas/studentValidator.js";


const router = Router();

 //get
router.get("/", (req: Request, res: Response) => {
  res.send("API services for Students Data");
});

// GET /api/v1/students
// get students (by program)
router.get("/students", (req: Request, res: Response) => {
  try {  //http:localhost:3000/students?program=CPE
    const program = req.query.program;

    if (program) {
      let filtered_students = students.filter(
        (student) => student.program === program
      );
      return res.status(200).json({
        success: true,
        data: filtered_students,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: students,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});


router.get("/:studentId", (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId;
    const result = zStudentId.safeParse(studentId);

    // validate req.body with predefined validator
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === studentId
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Student does not exists",
      });
    }

    // add response header 'Link'
    res.set("Link", `/students/${studentId}`);

    return res.json({
      success: true,
      message: `Student ${studentId} founded`,
      data: students[foundIndex],
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

//get studentId courses
router.get("/:studentId/courses", (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId;
    const result = zStudentId.safeParse(studentId);

    if (!result.success) {
      return res.status(400).json({
        check: studentId,
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === studentId
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Student does not exists",
      });
    }

    // add response header 'Link'
    res.set("Link", `/api/v2/students/${studentId}/courses`);

    const respondcourse = students[foundIndex]?.courses?.map((course) => {
        const enrolledcourse = courses.find((e) => e.courseId == course);
        return {
            courseId: enrolledcourse?.courseId,
            courseTitle: enrolledcourse?.courseTitle
        }
    })

    return res.json({
      success: true,
      message: `Get courses detail of student ${studentId}`,
      data: {
        studentId: studentId,
        courses: respondcourse
      }
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});


//post add new student
router.post("/", (req: Request, res: Response) => {
    try {
    const body = req.body as Student;  //ดึงจาก body
    const result = zStudentPostBody.safeParse(body);  //สร้างตัวแปรมาเช็ค 
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === body.studentId
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Student does not exists",
      });
    }
    //add new
    const new_student = body;
    students.push(new_student);

    // add response header 'Link'
    res.set("Link", `/students/${body.studentId}`);

    return res.json({
      success: true,
      message: `Student ${body.studentId} founded`,
      data: students[foundIndex],
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// PUT /students, body = {studentId}
// Update specified student
router.put("/", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    const result = zStudentPutBody.safeParse(body);
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === body.studentId
    );

    if (foundIndex === -1) {
      return res.json({
        success: false,
        message: "Student does not exists",
      });
    }

    // update student data
    students[foundIndex] = { ...students[foundIndex], ...body };

    // add response header 'Link'
    res.set("Link", `/students/${body.studentId}`);

    return res.json({
      success: true,
      message: `Student ${body.studentId} has been updated successfully`,
      data: students[foundIndex],
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// DELETE /students, body = {studentId}
router.delete("/", (req: Request, res: Response) => {
  try {
    const body = req.body;
    const parseResult = zStudentDeleteBody.safeParse(body);

    if (!parseResult.success) {
      return res.json({
        success: false,
        message: "Validation failed",
        error: parseResult.error.issues[0]?.message,
      });
    }

    const foundIndex = students.findIndex(
      (std: Student) => std.studentId === body.studentId
    );

    if (foundIndex === -1) {
      return res.json({
        success: false,
        message: "Student does not exists",
      });
    }

    students.splice(foundIndex, 1);

    res.json({
      success: true,
      message: `Student ${body.studentId} has been deleted successfully`,
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

export default router;