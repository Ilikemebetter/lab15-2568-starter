import { Router, type Request, type Response } from "express";
import { type Course} from "../libs/types.js";
import {courses} from "../db/db.js";
import {
  zCoursePostBody,
  zCoursePutBody,
  zCourseDeleteBody,
  zCourseId,
} from "../schemas/courseValidator.js";

// import endpoint not found middleware
//import notFoundMiddleware from "../middlewares/notFoundMiddleware.js";


const router: Router = Router();
// READ all

router.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Courses Information",
    data: courses,
  });
});

// Params URL
router.get("/:courseId", (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId;
    const result = zCourseId.safeParse(Number(courseId));

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    const foundIndex = courses.findIndex(
      (course) => course.courseId === Number(courseId)
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Course does not exists",
      });
    }

    // add response header 'Link'
    res.set("Link", `/api/v2/courses/${courseId}`);

    return res.json({
      success: true,
      message: `Get course ${courseId} successfully`,
      data: courses[foundIndex],
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

router.post("/", (req: Request, res: Response) => {
  try {
    const body = req.body as Course;

    // validate req.body with predefined validator
    const result = zCoursePostBody.safeParse(body);
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    const found = courses.find(
      (course) => course.courseId === body.courseId
    );
    if (found) {
      return res.status(409).json({
        success: false,
        message: "Course Id already exists",
      });
    }

    const new_course = body;
    courses.push(new_course);

    // add response header 'Link'
    res.set("Link", `/api/v2/courses`);

    return res.status(201).json({
      success: true,
      message: `Course ${body.courseId} has been added successfully`,
      data: new_course,
    });

  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

router.put("/", (req:Request,res: Response) => {
try {
    const body = req.body as Course;

    // validate req.body with predefined validator
    const result = zCoursePutBody.safeParse(body); 
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    const foundIndex = courses.findIndex(
      (course) => course.courseId === body.courseId
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Course Id does not exists",
      });
    }

    // update student data
    courses[foundIndex] = { ...courses[foundIndex], ...body };

    // add response header 'Link'
    res.set("Link", `/api/v2/courses/${body.courseId}`);

    return res.status(200).json({
      success: true,
      message: `course ${body.courseId} has been updated successfully`,
      data: courses[foundIndex],
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

router.delete("/", (req:Request,res:Response) => {
    try {
    const body = req.body;
    const parseResult = zCourseDeleteBody.safeParse(body);
    
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: parseResult.error.issues[0]?.message,
      });
    }

    const foundIndex = courses.findIndex(
      (course: Course) => course.courseId === body.courseId
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Course Id does not exists",
      });
    }

    // delete found student from array
    courses.splice(foundIndex, 1);

    res.json({
      success: true,
      message: `Course ${body.courseId} has been deleted successfully`,
      data: courses
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
