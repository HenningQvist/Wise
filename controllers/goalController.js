const goalModel = require('../models/goalModel');
const taskModel = require('../models/goalModel');

// Hämta mål för en deltagare
const getGoal = async (req, res) => {
  const participantId = req.params.participantId;

  try {
    const goal = await goalModel.getGoalByParticipantId(participantId);

    if (!goal) {
      return res.status(200).json({ goal: null });
    }

    res.status(200).json(goal);
  } catch (error) {
    console.error('Fel vid hämtning av mål:', error);
    res.status(500).json({ message: 'Kunde inte hämta målet', error });
  }
};

// Spara eller uppdatera mål för en deltagare
const saveGoal = async (req, res) => {
  const participantId = req.params.participantId;
  const { goal, progress, reflection1, reflection2, completionDate, createdBy } = req.body;

  if (!goal || !progress || !completionDate) {
    return res.status(400).json({ message: 'Mål, progress och datum för målets uppfyllelse är obligatoriska' });
  }

  const goalData = {
    goal,
    progress,
    reflection1,
    reflection2,
    completionDate,
    createdBy,
    is_completed: false,     // Rensa fältet
    completed_at: null       // Rensa fältet
  };

  try {
    const result = await goalModel.saveGoalForParticipant(participantId, goalData);
    res.status(200).json(result);
  } catch (error) {
    console.error('Fel vid sparande/uppradering av mål:', error);
    res.status(500).json({ message: 'Kunde inte spara målet', error });
  }
};



// Klarmarkera ett mål
const markGoalAsCompleted = async (req, res) => {
  const { participantId, goalId } = req.params;

  if (!goalId) {
    return res.status(400).json({ message: 'Goal ID är obligatoriskt' });
  }

  try {
    const updatedGoal = await goalModel.markGoalAsCompleted(participantId, goalId, {
      is_completed: 'completed',
      completedAt: new Date().toISOString()
    });

    res.status(200).json({
      message: 'Mål klarmarkerat',
      result: updatedGoal,
    });
  } catch (error) {
    console.error('Fel vid klarmarkering av mål:', error.message);
    res.status(500).json({ message: 'Kunde inte klarmarkera målet', error });
  }
};

// Hämta uppgifter för en deltagare
const getTasks = async (req, res) => {
  const { participantId } = req.params;

  if (!participantId) {
    return res.status(400).json({ message: 'participantId måste anges' });
  }

  try {
    const tasks = await taskModel.getTasksByParticipantId(participantId);

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: 'Inga uppgifter hittades för denna deltagare' });
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Fel vid hämtning av uppgifter:', error);
    res.status(500).json({ message: 'Kunde inte hämta uppgifterna', error });
  }
};

// Hämta alla uppgifter
const getAllTasks = async (req, res) => {
  try {
    const tasks = await taskModel.getAllTasks();

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: 'Inga uppgifter hittades' });
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Fel vid hämtning av uppgifter:', error);
    res.status(500).json({ message: 'Kunde inte hämta uppgifterna', error });
  }
};

// Lägg till ett nytt SMART-mål
const saveTask = async (req, res) => {
  console.log('Received body:', req.body);
  const { specific, measurable, achievable, relevant, timeBound, responsible, progress, participantId, createdBy } = req.body;

  console.log('Before calling addTask:', { specific, measurable, achievable, relevant, timeBound, responsible, progress, participantId, createdBy });

  try {
    const newTask = await taskModel.addTask({
      specific,
      measurable,
      achievable,
      relevant,
      timeBound,
      responsible,
      progress,
      participantId,
      createdBy // Sparar vem som skapade uppgiften
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error while saving task:', error);
    res.status(500).json({ message: 'Could not save the task', error });
  }
};

// Klarmarkera en uppgift
const completeTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const updatedTask = await taskModel.completeTask(taskId);

    if (!updatedTask) {
      return res.status(404).json({ message: 'Uppgiften hittades inte' });
    }

    res.status(200).json({
      message: 'Uppgiften har klarmarkerats',
      task: updatedTask
    });

  } catch (error) {
    console.error('Fel vid klarmarkering av uppgift:', error.message);
    res.status(500).json({ message: 'Något gick fel vid klarmarkering av uppgiften', error });
  }
};

// Hämta alla mål
const getAllGoals = async (req, res) => {
  try {
    const goals = await goalModel.getAllGoals();

    if (!goals || goals.length === 0) {
      return res.status(404).json({ message: 'Inga mål hittades' });
    }

    res.status(200).json(goals);
  } catch (error) {
    console.error('Fel vid hämtning av alla mål:', error);
    res.status(500).json({ message: 'Kunde inte hämta alla mål', error });
  }
};

// Uppdatera endast progress för ett mål
const updateGoalProgress = async (req, res) => {
  const { participantId } = req.params;
  const { progress } = req.body;

  if (progress === undefined) {
    return res.status(400).json({ message: 'Progress krävs' });
  }

  try {
    const updatedGoal = await goalModel.updateGoalProgress(participantId, progress);
    res.status(200).json({
      message: 'Progress uppdaterad',
      goal: updatedGoal,
    });
  } catch (error) {
    console.error('Fel vid uppdatering av progress:', error.message);
    res.status(500).json({ message: 'Kunde inte uppdatera progress', error });
  }
};

module.exports = { getGoal, saveGoal, getAllGoals, getTasks, getAllTasks, saveTask, completeTask, markGoalAsCompleted, updateGoalProgress };
