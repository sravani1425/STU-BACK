import Timetable from '../models/Timetable.js';

// @desc    Create a timetable slot
// @route   POST /api/timetable
// @access  Private (Faculty or Admin)
export const createTimetableSlot = async (req, res) => {
  const { day, subject, timeSlot, course, room } = req.body;

  try {
    const slot = new Timetable({
      day,
      subject,
      timeSlot,
      course,
      room,
      instructor: req.user._id,
    });

    const createdSlot = await slot.save();
    res.status(201).json(createdSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all timetable slots
// @route   GET /api/timetable
// @access  Private
export const getTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.find()
      .populate('instructor', 'name email');
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a timetable slot
// @route   PUT /api/timetable/:id
// @access  Private (Faculty or Admin)
export const updateTimetableSlot = async (req, res) => {
  const { day, subject, timeSlot, course, room } = req.body;

  try {
    const slot = await Timetable.findById(req.params.id);

    if (slot) {
      slot.day = day || slot.day;
      slot.subject = subject || slot.subject;
      slot.timeSlot = timeSlot || slot.timeSlot;
      slot.course = course || slot.course;
      slot.room = room || slot.room;

      const updatedSlot = await slot.save();
      res.json(updatedSlot);
    } else {
      res.status(404).json({ message: 'Timetable slot not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a timetable slot
// @route   DELETE /api/timetable/:id
// @access  Private (Faculty or Admin)
export const deleteTimetableSlot = async (req, res) => {
  try {
    const slot = await Timetable.findById(req.params.id);

    if (slot) {
      await Timetable.deleteOne({ _id: slot._id });
      res.json({ message: 'Timetable slot removed' });
    } else {
      res.status(404).json({ message: 'Timetable slot not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
