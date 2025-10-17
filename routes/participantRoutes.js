const express = require('express');
const passport = require('passport');  // Importera Passport för autentisering
const { register, getCaseList, getParticipantById, updateParticipant, avslutaDeltagare } = require('../controllers/participantController');
const { saveData, getData } = require('../controllers/sensitiveDataController');
const { saveRatings, getLatestRating, getFirstAndLatestRating, getAllRatings } = require('../controllers/ratings.controller');
const { getGoal, saveGoal, getAllGoals, getTasks, saveTask, getAllTasks, completeTask, markGoalAsCompleted, updateGoalProgress } = require('../controllers/goalController');
const { saveStepController, getStepController, getAllStepsController } = require('../controllers/stepController');
const { getNotes, getLatest, addNote } = require('../controllers/noteController');
const { getChatMessages, postChatMessage, getAllChatMessages } = require('../controllers/chatController');
const { uploadDocuments, getDocuments } = require('../controllers/documentController');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

// Skydda alla rutter här nedan genom att lägga till passport.authenticate('jwt', { session: false })

// POST-rutt för att registrera deltagare (utan autentisering här, för att låta alla registrera sig)
router.post('/participants/registerParticipant', passport.authenticate('jwt', { session: false }), register); 

// Skyddad GET-rutt för att hämta deltagarlistan
router.get('/participants/caseList', passport.authenticate('jwt', { session: false }), getCaseList);

// POST-rutt för att avsluta en deltagare
router.post('/participants/avsluta', passport.authenticate('jwt', { session: false }), avslutaDeltagare);

// Skyddad POST-rutt för att spara kartläggning för en deltagare
router.post('/participants/:participantId/sensitive-data', passport.authenticate('jwt', { session: false }), saveData);

// Skyddad GET-rutt för att hämta den senaste kartläggningen för en deltagare
router.get('/participants/:participantId/sensitive-data', passport.authenticate('jwt', { session: false }), getData);

// Skyddad POST-rutt för att spara eller uppdatera ratings för en deltagare
router.post('/participants/:participantId/ratings', passport.authenticate('jwt', { session: false }), saveRatings);

// Skyddad GET-rutt för att hämta den senaste ratingen för en deltagare
router.get('/participants/:participantId/getLatestRating', passport.authenticate('jwt', { session: false }), getLatestRating);

// Skyddad GET-rutt för att hämta en specifik deltagare baserat på deras ID
router.get('/participants/:id', passport.authenticate('jwt', { session: false }), getParticipantById);

// Skyddad PUT-rutt för att uppdatera en specifik deltagare
router.put('/participants/:id', passport.authenticate('jwt', { session: false }), updateParticipant);

// Skyddad GET-rutt för att hämta alla ratings för en deltagare
router.get('/participants/:participantId/ratings', passport.authenticate('jwt', { session: false }), getAllRatings);

// Skyddad GET-rutt för att hämta progression (första och senaste rating)
router.get('/ratings/progression/:participantId', passport.authenticate('jwt', { session: false }), getFirstAndLatestRating);

// Skyddad GET-rutt för att hämta mål för en deltagare
router.get('/participants/:participantId/goal', passport.authenticate('jwt', { session: false }), getGoal);

// Skyddad POST-rutt för att spara eller uppdatera mål för en deltagare
router.post('/participants/:participantId/goal', passport.authenticate('jwt', { session: false }), saveGoal);

router.patch('/participants/:participantId/goal/progress', passport.authenticate('jwt', { session: false }), updateGoalProgress);

// Skyddad PUT-rutt för att markera mål som fullföljt
router.put('/participants/:participantId/goal/:goalId/complete', passport.authenticate('jwt', { session: false }), markGoalAsCompleted);

// Skyddad GET-rutt för att hämta uppgifter för en deltagare
router.get('/participants/:participantId/tasks', passport.authenticate('jwt', { session: false }), getTasks);

// Skyddad GET-rutt för att hämta alla uppgifter
router.get('/tasks', passport.authenticate('jwt', { session: false }), getAllTasks);

// Skyddad POST-rutt för att spara eller uppdatera tasks för en deltagare
router.post('/participants/:participantId/task', passport.authenticate('jwt', { session: false }), saveTask);

// Skyddad POST-rutt för att markera uppgift som fullföljd
router.post('/tasks/:taskId/complete', passport.authenticate('jwt', { session: false }), completeTask);

// Skyddad GET-rutt för att hämta alla mål
router.get('/goals', passport.authenticate('jwt', { session: false }), getAllGoals);

// Skyddad POST-rutt för att spara ett steg för en deltagare
router.post('/participants/:participantId/step', passport.authenticate('jwt', { session: false }), saveStepController);

// Skyddad GET-rutt för att hämta ett steg för en deltagare
router.get('/participants/:participantId/step', passport.authenticate('jwt', { session: false }), getStepController);

// Skyddad GET-rutt för att hämta alla deltagares steg
router.get('/steps', passport.authenticate('jwt', { session: false }), getAllStepsController);

// Skyddad GET-rutt för att hämta alla anteckningar för en deltagare
router.get('/participants/:participantId/notes', passport.authenticate('jwt', { session: false }), getNotes);

// Skyddad GET-rutt för att hämta den senaste anteckningen för en deltagare
router.get('/participants/:participantId/notes/latest', passport.authenticate('jwt', { session: false }), getLatest);

// Skyddad POST-rutt för att spara en anteckning för en deltagare
router.post('/participants/:participantId/notes', passport.authenticate('jwt', { session: false }), addNote);

// Skyddad GET-rutt för att hämta alla meddelanden för en deltagare
router.get('/participants/:participantId/chat', passport.authenticate('jwt', { session: false }), getChatMessages);

// Skyddad POST-rutt för att skicka ett nytt meddelande för en deltagare
router.post('/participants/:participantId/chat', passport.authenticate('jwt', { session: false }), postChatMessage);

// Skyddad GET-rutt för att hämta alla meddelanden för alla deltagare
router.get('/chat', passport.authenticate('jwt', { session: false }), getAllChatMessages);

// Skyddad POST-rutt för att ladda upp dokument
router.post('/documents/upload', passport.authenticate('jwt', { session: false }), upload.array('files'), uploadDocuments);

// Skyddad GET-rutt för att hämta dokument för en deltagare
router.get('/documents/:participantId', passport.authenticate('jwt', { session: false }), getDocuments);

module.exports = router;
