import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './Routes/auth.js';
import childRoutes from './Routes/child.js';
import gameSessionRoutes from './Routes/gameSession.js';
import quizRoutes from './Routes/quiz.js';
import wordQuestionsRoutes from './Routes/wordQuestions.js';
import syllableRoutes from './Routes/syllableGame.js';
import mirrorQuestionRoutes from './Routes/mirrorQuestion.js';
import superadminRoutes from './Routes/superadmin.js';
import emotionRoutes from './Routes/emotion.js';
import phonicsContentRoutes  from './Routes/phonicsContent.js';
import phonemeTapRoutes      from './Routes/phonemeTap.js';
import letterSoundRoutes     from './Routes/letterSound.js';
import confusableLetterRoutes from './Routes/confusableLetter.js';
import ranRoutes             from './Routes/ran.js';
import verbalMemoryRoutes    from './Routes/verbalMemory.js';
import assignedSessionsRoutes from './Routes/assignedSessions.js';
import readingProgressRoutes  from './Routes/readingProgress.js';
import adaptationLogRoutes    from './Routes/adaptationLog.js';
import analyticsRoutes        from './Routes/analytics.js';
import reportsRoutes          from './Routes/reports.js';
dotenv.config();

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/phonics',             phonicsContentRoutes);
app.use('/api/phoneme-tap',        phonemeTapRoutes);
app.use('/api/letter-sound',       letterSoundRoutes);
app.use('/api/confusable-letter',  confusableLetterRoutes);
app.use('/api/ran',                ranRoutes);
app.use('/api/verbal-memory',     verbalMemoryRoutes);
app.use('/api/assigned-sessions', assignedSessionsRoutes);
app.use('/api/reading-progress',  readingProgressRoutes);
app.use('/api/adaptation-log',    adaptationLogRoutes);
app.use('/api/analytics',         analyticsRoutes);
app.use('/api/reports',           reportsRoutes);
app.use('/api/emotion', emotionRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/children', childRoutes);
app.use('/api/sessions', gameSessionRoutes);
app.use('/api', quizRoutes);
app.use('/api/wordQuestions', wordQuestionsRoutes); 
app.use('/api/syllable-game', syllableRoutes);
app.use("/api/mirrorquestions", mirrorQuestionRoutes);
app.listen(4000, () => console.log('Server running on port 4000'));
