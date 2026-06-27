// import axios from "axios";
// import { PutObjectCommand } from "@aws-sdk/client-s3";
// import getS3Client from "../config/s3.js";
// import path from "path";
// import Upload from "../models/Upload.js";
// import Course from "../models/Course.js";
// import Session from "../models/Session.js";
// import Flashcard from "../models/Flashcard.js";
// import Interview from "../models/Interview.js";
// import Quiz from "../models/Quiz.js";
// import Notification from "../models/Notification.js";

// import { transcribeAudio } from "../services/transcriptionService.js";
// import { generateLectureContent } from "../services/bedrockService.js";
// import { runCriticPass } from "../services/criticService.js";
// import { generateConceptMap } from "../services/diagramService.js";
// import { generatePDF } from "../services/pdfService.js";
// import { generateFlashcards } from "../services/flashcardService.js";
// import { generateInterviewQuestions } from "../services/interviewService.js";
// import { generateQuiz } from "../services/quizService.js";
// import { extractTextFromPDF } from "../services/pdfParsingService.js";

// export const uploadFiles = async (req, res) => {
//   try {
//     const { sessionId, courseId } = req.body;
//     const mentorId = req.user._id;

//     if (!sessionId || !courseId) {
//       return res.status(400).json({ msg: "SessionId and CourseId are required." });
//     }

//     const session = await Session.findById(sessionId);
//     if (!session) {
//       return res.status(400).json({ msg: "Invalid sessionId" });
//     }

//     const files = req.files;
//     if (!files || files.length === 0) {
//       return res.status(400).json({ msg: "No files uploaded." });
//     }

//     const uploadPromises = files.map(async (file) => {
//       const filePath = `/uploads/${file.filename}`;
//       const url = `${process.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${filePath}`;

//       const uploadDoc = await Upload.create({
//         sessionId,
//         mentorId,
//         courseId,
//         originalname: file.originalname,
//         filename: file.filename,
//         size: file.size,
//         mimetype: file.mimetype,
//         isProcessed: false,
//         fileUrls: [url],
//         status: "idle" 
//       });
//       return uploadDoc;
//     });

//     const uploadedDocs = await Promise.all(uploadPromises);
//     console.log("Upload Success:", uploadedDocs.length, "files");

//     res.status(201).json({
//       msg: "Files uploaded successfully",
//       uploads: uploadedDocs,
//     });

//   } catch (error) {
//     console.error("Upload error details:", error);
//     res.status(500).json({ msg: "Server error during file upload.", error: error.message });
//   }
// };

// export const getUploadsBySession = async (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const uploads = await Upload.find({ sessionId });
//     res.json(uploads);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getAllUserUploads = async (req, res) => {
//   try {
//     const userCourses = await Course.find({
//       $or: [{ mentors: req.user._id }, { students: req.user._id }]
//     }).select('_id');

//     const courseIds = userCourses.map(c => c._id);

//     const uploads = await Upload.find({ courseId: { $in: courseIds } })
//       .populate('courseId', 'title')
//       .populate({
//         path: 'sessionId',
//         select: 'title date moduleId',
//         populate: {
//           path: 'moduleId',
//           select: 'title'
//         }
//       });

//     const uploadsWithStats = await Promise.all(uploads.map(async (u) => {
//       const uObj = u.toObject();
//       const sessionId = u.sessionId?._id;

//       if (sessionId) {
//         const [flashcardDoc, interviewDoc, quizDoc] = await Promise.all([
//           Flashcard.findOne({ sessionId }),
//           Interview.findOne({ sessionId }),
//           Quiz.findOne({ sessionId })
//         ]);

//         uObj.stats = {
//           flashcards: flashcardDoc?.cards?.length || 0,
//           interview: interviewDoc?.questions?.length || 0,
//           quiz: quizDoc?.questions?.length || 0
//         };
//       } else {
//         uObj.stats = { flashcards: 0, interview: 0, quiz: 0 };
//       }
//       return uObj;
//     }));
      
//     res.json(uploadsWithStats);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const generateTranscriptForUpload = async (req, res) => {
//   try {
//     const { uploadId } = req.params;
//     const uploadDoc = await Upload.findById(uploadId);
//     if (!uploadDoc) return res.status(404).json({ msg: "Upload not found" });

//     res.status(202).json({ msg: "Transcription started." });

//     await Upload.findByIdAndUpdate(uploadId, { status: "processing", lastError: null });

//     setImmediate(async () => {
//       try {
//         let transcript = "";
//         if (uploadDoc.mimetype.startsWith("audio")) {
//           transcript = await transcribeAudio(uploadDoc.fileUrls[0]);
//         } else if (uploadDoc.mimetype === "application/pdf") {
//           transcript = await extractTextFromPDF(uploadDoc.fileUrls[0]);
//         } else {
//           transcript = `Content from file: ${uploadDoc.originalname}`;
//         }
        
//         await Upload.findByIdAndUpdate(uploadId, { 
//           transcript, 
//           isProcessed: true, 
//           status: "idle" // Set back to idle so mentor can click next buttons
//         });

//         await Notification.create({
//           recipient: uploadDoc.mentorId,
//           title: "Transcription Complete",
//           message: `The transcription for "${uploadDoc.originalname}" is ready. You can now generate other resources.`,
//           type: "success"
//         });

//         console.log(`[${uploadId}] Transcription finished.`);
//       } catch (error) {
//         console.error(`[${uploadId}] Transcription failed:`, error);
//         await Upload.findByIdAndUpdate(uploadId, { status: "failed", lastError: error.message });
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const getCombinedTranscript = async (sessionId) => {
//   const uploads = await Upload.find({ sessionId, transcript: { $exists: true, $ne: "" } });
//   if (uploads.length === 0) return "";
  
//   return uploads.map(u => `### MATERIAL SOURCE: ${u.originalname}\n\n${u.transcript}`).join('\n\n---\n\n');
// };

// export const generatePdfForUpload = async (req, res) => {
//   const { uploadId } = req.params;
//   console.log(`[${uploadId}] Received request to generate PDF Study Guide.`);

//   res.status(202).json({ msg: "PDF Generation started." });

//   await Upload.findByIdAndUpdate(uploadId, { status: "processing", lastError: null });

//   setImmediate(async () => {
//     try {
//       const uploadDoc = await Upload.findById(uploadId).populate('sessionId');
//       if (!uploadDoc || !uploadDoc.transcript) {
//         throw new Error("Transcript not found.");
//       }

//       const sessionIdStr = uploadDoc.sessionId?._id || uploadDoc.sessionId;
//       const combinedTranscript = await getCombinedTranscript(sessionIdStr);
      
//       const aiResponse = await generateLectureContent(combinedTranscript || uploadDoc.transcript);
//       const polishedContent = await runCriticPass(aiResponse);
//       const diagram = generateConceptMap(polishedContent.topics);
      
//       const sessionTitle = uploadDoc.sessionId?.title || uploadDoc.originalname;
      
//       const pdfBuffer = await generatePDF({
//         lecture_title: sessionTitle,
//         topics: polishedContent.topics,
//         conceptMap: diagram,
//       });

//       const pdfKey = `study-guides/${Date.now()}-${uploadDoc.originalname.replace(/\s+/g, '_')}.pdf`;
//       const pdfPath = `uploads/${path.basename(pdfKey)}`;
//       const fs = await import('fs');
//       fs.writeFileSync(pdfPath, pdfBuffer);
//       const pdfUrl = `${process.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${path.basename(pdfKey)}`;

//       await Upload.findByIdAndUpdate(uploadId, { pdfUrl, pdfGenerated: true, status: "idle", lastError: null });

//       await Notification.create({
//         recipient: uploadDoc.mentorId,
//         title: "Study Guide Ready",
//         message: `The PDF Study Guide for "${uploadDoc.originalname}" has been generated successfully.`,
//         type: "success",
//         link: `/study-guide/${uploadDoc.sessionId}/${uploadDoc._id}`
//       });

//       console.log(`[${uploadId}] ✅ PDF Study Guide generated.`);
//     } catch (error) {
//       console.error(`[${uploadId}] PDF Generation failed:`, error);
//       await Upload.findByIdAndUpdate(uploadId, { status: "failed", lastError: error.message });
//     }
//   });
// };

// export const generateFlashcardsForUpload = async (req, res) => {
//   try {
//     const { uploadId } = req.params;
//     const uploadDoc = await Upload.findById(uploadId);
//     if (!uploadDoc || !uploadDoc.transcript) {
//       return res.status(400).json({ msg: "Transcript not found. Please generate it first." });
//     }

//     res.status(202).json({ msg: "Flashcard generation started." });

//     await Upload.findByIdAndUpdate(uploadId, { status: "processing", lastError: null });

//     setImmediate(async () => {
//       try {
//         const combinedTranscript = await getCombinedTranscript(uploadDoc.sessionId);
//         const flashcards = await generateFlashcards(combinedTranscript || uploadDoc.transcript);
        
//         await Flashcard.findOneAndUpdate(
//           { uploadId },
//           { sessionId: uploadDoc.sessionId, uploadId, cards: flashcards },
//           { upsert: true, new: true }
//         );

//         await Upload.findByIdAndUpdate(uploadId, { flashcardsGenerated: true, status: "idle", lastError: null });

//         await Notification.create({
//           recipient: uploadDoc.mentorId,
//           title: "Flashcards Ready",
//           message: `AI-powered flashcards for "${uploadDoc.originalname}" are now available.`,
//           type: "success",
//           link: `/study-guide/${uploadDoc.sessionId}/${uploadDoc._id}?tab=flashcards`
//         });

//         console.log(`[${uploadId}] ✅ Flashcards generated.`);
//       } catch (error) {
//         console.error(`[${uploadId}] 💥 Flashcard generation failed:`, error);
//         await Upload.findByIdAndUpdate(uploadId, { status: "failed", lastError: error.message });
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const generateInterviewForUpload = async (req, res) => {
//   try {
//     const { uploadId } = req.params;
//     const uploadDoc = await Upload.findById(uploadId);
//     if (!uploadDoc || !uploadDoc.transcript) {
//       return res.status(400).json({ msg: "Transcript not found. Please generate it first." });
//     }

//     res.status(202).json({ msg: "Interview questions generation started." });

//     await Upload.findByIdAndUpdate(uploadId, { status: "processing", lastError: null });

//     setImmediate(async () => {
//       try {
//         const combinedTranscript = await getCombinedTranscript(uploadDoc.sessionId);
//         const interviewQuestions = await generateInterviewQuestions(combinedTranscript || uploadDoc.transcript);
        
//         await Interview.findOneAndUpdate(
//           { uploadId },
//           { sessionId: uploadDoc.sessionId, uploadId, questions: interviewQuestions },
//           { upsert: true, new: true }
//         );

//         await Upload.findByIdAndUpdate(uploadId, { interviewGenerated: true, status: "idle", lastError: null });

//         await Notification.create({
//           recipient: uploadDoc.mentorId,
//           title: "Interview Prep Ready",
//           message: `Interview questions and prep materials for "${uploadDoc.originalname}" have been generated.`,
//           type: "success",
//           link: `/study-guide/${uploadDoc.sessionId}/${uploadDoc._id}?tab=interview`
//         });

//         console.log(`[${uploadId}] ✅ Interview questions generated.`);
//       } catch (error) {
//         console.error(`[${uploadId}] 💥 Interview generation failed:`, error);
//         await Upload.findByIdAndUpdate(uploadId, { status: "failed", lastError: error.message });
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const generateQuizForUpload = async (req, res) => {
//   try {
//     const { uploadId } = req.params;
//     const uploadDoc = await Upload.findById(uploadId);
//     if (!uploadDoc || !uploadDoc.transcript) {
//       return res.status(400).json({ msg: "Transcript not found. Please generate it first." });
//     }

//     res.status(202).json({ msg: "Quiz generation started." });

//     await Upload.findByIdAndUpdate(uploadId, { status: "processing", lastError: null });

//     setImmediate(async () => {
//       try {
//         const combinedTranscript = await getCombinedTranscript(uploadDoc.sessionId);
//         const quiz = await generateQuiz(combinedTranscript || uploadDoc.transcript);
        
//         await Quiz.findOneAndUpdate(
//           { uploadId },
//           { sessionId: uploadDoc.sessionId, uploadId, questions: quiz },
//           { upsert: true, new: true }
//         );

//         await Upload.findByIdAndUpdate(uploadId, { quizGenerated: true, status: "idle", lastError: null });

//         await Notification.create({
//           recipient: uploadDoc.mentorId,
//           title: "Practice Quiz Ready",
//           message: `The practice quiz for "${uploadDoc.originalname}" is now live.`,
//           type: "success",
//           link: `/study-guide/${uploadDoc.sessionId}/${uploadDoc._id}?tab=quiz`
//         });

//         console.log(`[${uploadId}] ✅ Quiz generated.`);
//       } catch (error) {
//         console.error(`[${uploadId}] 💥 Quiz generation failed:`, error);
//         await Upload.findByIdAndUpdate(uploadId, { status: "failed", lastError: error.message });
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getUploadStatus = async (req, res) => {
//   try {
//     const { uploadId } = req.params;
//     const upload = await Upload.findById(uploadId);
//     if (!upload) return res.status(404).json({ msg: "Upload not found" });
//     res.json(upload);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getUploadPdf = async (req, res) => {
//   try {
//     const { uploadId } = req.params;
//     const upload = await Upload.findById(uploadId);
//     if (!upload || !upload.pdfUrl) return res.status(404).json({ msg: "PDF not found" });

//     const response = await axios.get(upload.pdfUrl, { responseType: 'arraybuffer' });

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename="MindForge_Study_Guide_${uploadId.substring(0, 6)}.pdf"`);
    
//     res.send(response.data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getFlashcards = async (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const flashcards = await Flashcard.findOne({ sessionId });
    
//     if (!flashcards) return res.status(404).json({ msg: "Flashcards not found" });
//     res.json(flashcards);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getInterviewQuestions = async (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const interview = await Interview.findOne({ sessionId });
    
//     if (!interview) return res.status(404).json({ msg: "Interview questions not found" });
//     res.json(interview);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getQuiz = async (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const quiz = await Quiz.findOne({ sessionId });
    
//     if (!quiz) return res.status(404).json({ msg: "Quiz not found" });
//     res.json(quiz);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const deleteUpload = async (req, res) => {
//   try {
//     const { uploadId } = req.params;
//     const upload = await Upload.findById(uploadId);

//     if (!upload) return res.status(404).json({ msg: "Upload not found" });

//     const course = await Course.findById(upload.courseId);
//     const isCreator = upload.mentorId && upload.mentorId.toString() === req.user._id.toString();
//     const isCourseMentor = course && course.mentors.some(m => m.toString() === req.user._id.toString());

//     if (!isCreator && !isCourseMentor) {
//       return res.status(403).json({ msg: "Not authorized to delete this upload" });
//     }

//     await Promise.all([
//       Flashcard.deleteMany({ uploadId }),
//       Interview.deleteMany({ uploadId }),
//       Quiz.deleteMany({ uploadId }),
//       Upload.findByIdAndDelete(uploadId)
//     ]);

//     res.json({ msg: "Upload and all related study materials deleted successfully" });
//   } catch (error) {
//     console.error("Delete upload error:", error);
//     res.status(500).json({ msg: "Failed to delete upload" });
//   }
// };

import axios from "axios";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import getS3Client from "../config/s3.js";
import path from "path";
import Upload from "../models/Upload.js";
import Course from "../models/Course.js";
import Session from "../models/Session.js";
import Flashcard from "../models/Flashcard.js";
import Interview from "../models/Interview.js";
import Quiz from "../models/Quiz.js";
import Notification from "../models/Notification.js";

import { transcribeAudio } from "../services/transcriptionService.js";
import { generateLectureContent } from "../services/bedrockService.js";
import { runCriticPass } from "../services/criticService.js";
import { generateConceptMap } from "../services/diagramService.js";
import { generatePDF } from "../services/pdfService.js";
import { generateFlashcards } from "../services/flashcardService.js";
import { generateInterviewQuestions } from "../services/interviewService.js";
import { generateQuiz } from "../services/quizService.js";
import { extractTextFromPDF } from "../services/pdfParsingService.js";

export const uploadFiles = async (req, res) => {
  try {
    const { sessionId, courseId } = req.body;
    const mentorId = req.user._id;

    if (!sessionId || !courseId) {
      return res.status(400).json({ msg: "SessionId and CourseId are required." });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(400).json({ msg: "Invalid sessionId" });
    }

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ msg: "No files uploaded." });
    }

    const uploadPromises = files.map(async (file) => {
      const filePath = `/uploads/${file.filename}`;
      const url = `${process.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${filePath}`;

      const uploadDoc = await Upload.create({
        sessionId,
        mentorId,
        courseId,
        originalname: file.originalname,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        isProcessed: false,
        fileUrls: [url],
        status: "idle" 
      });
      return uploadDoc;
    });

    const uploadedDocs = await Promise.all(uploadPromises);
    console.log("Upload Success:", uploadedDocs.length, "files");

    res.status(201).json({
      msg: "Files uploaded successfully",
      uploads: uploadedDocs,
    });

  } catch (error) {
    console.error("Upload error details:", error);
    res.status(500).json({ msg: "Server error during file upload.", error: error.message });
  }
};

export const getUploadsBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const uploads = await Upload.find({ sessionId });
    res.json(uploads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUserUploads = async (req, res) => {
  try {
    const userCourses = await Course.find({
      $or: [{ mentors: req.user._id }, { students: req.user._id }]
    }).select('_id');

    const courseIds = userCourses.map(c => c._id);

    const uploads = await Upload.find({ courseId: { $in: courseIds } })
      .populate('courseId', 'title')
      .populate({
        path: 'sessionId',
        select: 'title date moduleId',
        populate: {
          path: 'moduleId',
          select: 'title'
        }
      });

    const uploadsWithStats = await Promise.all(uploads.map(async (u) => {
      const uObj = u.toObject();
      const sessionId = u.sessionId?._id;

      if (sessionId) {
        const [flashcardDoc, interviewDoc, quizDoc] = await Promise.all([
          Flashcard.findOne({ sessionId }),
          Interview.findOne({ sessionId }),
          Quiz.findOne({ sessionId })
        ]);

        uObj.stats = {
          flashcards: flashcardDoc?.cards?.length || 0,
          interview: interviewDoc?.questions?.length || 0,
          quiz: quizDoc?.questions?.length || 0
        };
      } else {
        uObj.stats = { flashcards: 0, interview: 0, quiz: 0 };
      }
      return uObj;
    }));
      
    res.json(uploadsWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateTranscriptForUpload = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const uploadDoc = await Upload.findById(uploadId);
    if (!uploadDoc) return res.status(404).json({ msg: "Upload not found" });

    res.status(202).json({ msg: "Transcription started." });

    await Upload.findByIdAndUpdate(uploadId, { status: "processing", lastError: null });

    setImmediate(async () => {
      try {
        let transcript = "";
        if (uploadDoc.mimetype.startsWith("audio")) {
          transcript = await transcribeAudio(uploadDoc.fileUrls[0]);
        } else if (uploadDoc.mimetype === "application/pdf") {
          transcript = await extractTextFromPDF(uploadDoc.fileUrls[0]);
        } else {
          transcript = `Content from file: ${uploadDoc.originalname}`;
        }
        
        await Upload.findByIdAndUpdate(uploadId, { 
          transcript, 
          isProcessed: true, 
          status: "idle" // Set back to idle so mentor can click next buttons
        });

        await Notification.create({
          recipient: uploadDoc.mentorId,
          title: "Transcription Complete",
          message: `The transcription for "${uploadDoc.originalname}" is ready. You can now generate other resources.`,
          type: "success"
        });

        console.log(`[${uploadId}] Transcription finished.`);
      } catch (error) {
        console.error(`[${uploadId}] Transcription failed:`, error);
        await Upload.findByIdAndUpdate(uploadId, { status: "failed", lastError: error.message });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCombinedTranscript = async (sessionId) => {
  const uploads = await Upload.find({ sessionId, transcript: { $exists: true, $ne: "" } });
  if (uploads.length === 0) return "";
  
  return uploads.map(u => `### MATERIAL SOURCE: ${u.originalname}\n\n${u.transcript}`).join('\n\n---\n\n');
};

export const generatePdfForUpload = async (req, res) => {
  const { uploadId } = req.params;
  console.log(`[${uploadId}] Received request to generate PDF Study Guide.`);

  res.status(202).json({ msg: "PDF Generation started." });

  await Upload.findByIdAndUpdate(uploadId, { status: "processing", lastError: null });

  setImmediate(async () => {
    try {
      const uploadDoc = await Upload.findById(uploadId).populate('sessionId');
      if (!uploadDoc || !uploadDoc.transcript) {
        throw new Error("Transcript not found.");
      }

      const sessionIdStr = uploadDoc.sessionId?._id || uploadDoc.sessionId;
      const combinedTranscript = await getCombinedTranscript(sessionIdStr);
      
      const aiResponse = await generateLectureContent(combinedTranscript || uploadDoc.transcript);
      const polishedContent = await runCriticPass(aiResponse);
      const diagram = generateConceptMap(polishedContent.topics);
      
      const sessionTitle = uploadDoc.sessionId?.title || uploadDoc.originalname;
      
      const pdfBuffer = await generatePDF({
        lecture_title: sessionTitle,
        topics: polishedContent.topics,
        conceptMap: diagram,
      });

      const pdfKey = `study-guides/${Date.now()}-${uploadDoc.originalname.replace(/\s+/g, '_')}.pdf`;
      const s3Client = getS3Client();
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: pdfKey,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
      }));
      const pdfUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${pdfKey}`;

      await Upload.findByIdAndUpdate(uploadId, { pdfUrl, pdfGenerated: true, status: "idle", lastError: null });

      await Notification.create({
        recipient: uploadDoc.mentorId,
        title: "Study Guide Ready",
        message: `The PDF Study Guide for "${uploadDoc.originalname}" has been generated successfully.`,
        type: "success",
        link: `/study-guide/${uploadDoc.sessionId}/${uploadDoc._id}`
      });

      console.log(`[${uploadId}] ✅ PDF Study Guide generated.`);
    } catch (error) {
      console.error(`[${uploadId}] PDF Generation failed:`, error);
      await Upload.findByIdAndUpdate(uploadId, { status: "failed", lastError: error.message });
    }
  });
};

export const generateFlashcardsForUpload = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const uploadDoc = await Upload.findById(uploadId);
    if (!uploadDoc || !uploadDoc.transcript) {
      return res.status(400).json({ msg: "Transcript not found. Please generate it first." });
    }

    res.status(202).json({ msg: "Flashcard generation started." });

    await Upload.findByIdAndUpdate(uploadId, { status: "processing", lastError: null });

    setImmediate(async () => {
      try {
        const combinedTranscript = await getCombinedTranscript(uploadDoc.sessionId);
        const flashcards = await generateFlashcards(combinedTranscript || uploadDoc.transcript);
        
        await Flashcard.findOneAndUpdate(
          { uploadId },
          { sessionId: uploadDoc.sessionId, uploadId, cards: flashcards },
          { upsert: true, new: true }
        );

        await Upload.findByIdAndUpdate(uploadId, { flashcardsGenerated: true, status: "idle", lastError: null });

        await Notification.create({
          recipient: uploadDoc.mentorId,
          title: "Flashcards Ready",
          message: `AI-powered flashcards for "${uploadDoc.originalname}" are now available.`,
          type: "success",
          link: `/study-guide/${uploadDoc.sessionId}/${uploadDoc._id}?tab=flashcards`
        });

        console.log(`[${uploadId}] ✅ Flashcards generated.`);
      } catch (error) {
        console.error(`[${uploadId}] 💥 Flashcard generation failed:`, error);
        await Upload.findByIdAndUpdate(uploadId, { status: "failed", lastError: error.message });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateInterviewForUpload = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const uploadDoc = await Upload.findById(uploadId);
    if (!uploadDoc || !uploadDoc.transcript) {
      return res.status(400).json({ msg: "Transcript not found. Please generate it first." });
    }

    res.status(202).json({ msg: "Interview questions generation started." });

    await Upload.findByIdAndUpdate(uploadId, { status: "processing", lastError: null });

    setImmediate(async () => {
      try {
        const combinedTranscript = await getCombinedTranscript(uploadDoc.sessionId);
        const interviewQuestions = await generateInterviewQuestions(combinedTranscript || uploadDoc.transcript);
        
        await Interview.findOneAndUpdate(
          { uploadId },
          { sessionId: uploadDoc.sessionId, uploadId, questions: interviewQuestions },
          { upsert: true, new: true }
        );

        await Upload.findByIdAndUpdate(uploadId, { interviewGenerated: true, status: "idle", lastError: null });

        await Notification.create({
          recipient: uploadDoc.mentorId,
          title: "Interview Prep Ready",
          message: `Interview questions and prep materials for "${uploadDoc.originalname}" have been generated.`,
          type: "success",
          link: `/study-guide/${uploadDoc.sessionId}/${uploadDoc._id}?tab=interview`
        });

        console.log(`[${uploadId}] ✅ Interview questions generated.`);
      } catch (error) {
        console.error(`[${uploadId}] 💥 Interview generation failed:`, error);
        await Upload.findByIdAndUpdate(uploadId, { status: "failed", lastError: error.message });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateQuizForUpload = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const uploadDoc = await Upload.findById(uploadId);
    if (!uploadDoc || !uploadDoc.transcript) {
      return res.status(400).json({ msg: "Transcript not found. Please generate it first." });
    }

    res.status(202).json({ msg: "Quiz generation started." });

    await Upload.findByIdAndUpdate(uploadId, { status: "processing", lastError: null });

    setImmediate(async () => {
      try {
        const combinedTranscript = await getCombinedTranscript(uploadDoc.sessionId);
        const quiz = await generateQuiz(combinedTranscript || uploadDoc.transcript);
        
        await Quiz.findOneAndUpdate(
          { uploadId },
          { sessionId: uploadDoc.sessionId, uploadId, questions: quiz },
          { upsert: true, new: true }
        );

        await Upload.findByIdAndUpdate(uploadId, { quizGenerated: true, status: "idle", lastError: null });

        await Notification.create({
          recipient: uploadDoc.mentorId,
          title: "Practice Quiz Ready",
          message: `The practice quiz for "${uploadDoc.originalname}" is now live.`,
          type: "success",
          link: `/study-guide/${uploadDoc.sessionId}/${uploadDoc._id}?tab=quiz`
        });

        console.log(`[${uploadId}] ✅ Quiz generated.`);
      } catch (error) {
        console.error(`[${uploadId}] 💥 Quiz generation failed:`, error);
        await Upload.findByIdAndUpdate(uploadId, { status: "failed", lastError: error.message });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUploadStatus = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const upload = await Upload.findById(uploadId);
    if (!upload) return res.status(404).json({ msg: "Upload not found" });
    res.json(upload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUploadPdf = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const upload = await Upload.findById(uploadId);
    if (!upload || !upload.pdfUrl) return res.status(404).json({ msg: "PDF not found" });

    const response = await axios.get(upload.pdfUrl, { responseType: 'arraybuffer' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="MindForge_Study_Guide_${uploadId.substring(0, 6)}.pdf"`);
    
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFlashcards = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const flashcards = await Flashcard.findOne({ sessionId });
    
    if (!flashcards) return res.status(404).json({ msg: "Flashcards not found" });
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getInterviewQuestions = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const interview = await Interview.findOne({ sessionId });
    
    if (!interview) return res.status(404).json({ msg: "Interview questions not found" });
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const quiz = await Quiz.findOne({ sessionId });
    
    if (!quiz) return res.status(404).json({ msg: "Quiz not found" });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUpload = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const upload = await Upload.findById(uploadId);

    if (!upload) return res.status(404).json({ msg: "Upload not found" });

    const course = await Course.findById(upload.courseId);
    const isCreator = upload.mentorId && upload.mentorId.toString() === req.user._id.toString();
    const isCourseMentor = course && course.mentors.some(m => m.toString() === req.user._id.toString());

    if (!isCreator && !isCourseMentor) {
      return res.status(403).json({ msg: "Not authorized to delete this upload" });
    }

    await Promise.all([
      Flashcard.deleteMany({ uploadId }),
      Interview.deleteMany({ uploadId }),
      Quiz.deleteMany({ uploadId }),
      Upload.findByIdAndDelete(uploadId)
    ]);

    res.json({ msg: "Upload and all related study materials deleted successfully" });
  } catch (error) {
    console.error("Delete upload error:", error);
    res.status(500).json({ msg: "Failed to delete upload" });
  }
};