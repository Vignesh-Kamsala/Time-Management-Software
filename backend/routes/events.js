const express = require('express');
const router = express.Router();
const Event = require('../schema/EventSchema');
const User = require('../schema/userSchema');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/events/schedule
// @desc    Schedule a new event (meeting, task, etc.)
// @access  Private
router.post('/schedule', authMiddleware, async (req, res) => {
  const { title, eventType, startTime, endTime, venue, participants, project } = req.body;
  
  try {
    // 1. Check for conflicts for all participants
    const conflictingEvent = await Event.findOne({
      // Find events where any of the participants are already booked
      'participants.user': { $in: participants },
      // And the time slots overlap
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    if (conflictingEvent) {
      // A conflict was found
      const conflictingUser = await User.findById(conflictingEvent.participants.find(p => participants.includes(p.user.toString())).user);
      return res.status(409).json({ 
        msg: `Scheduling conflict: ${conflictingUser.name} is already booked during this time.`,
        conflictingEvent
      });
    }

    // 2. If no conflict, create the new event
    const newEvent = new Event({
      title,
      eventType,
      startTime,
      endTime,
      venue,
      organizer: req.user.id, // The logged-in user is the organizer
      participants: participants.map(userId => ({ user: userId, status: 'Pending' })),
      project,
    });

    // Add the organizer to the participants list with 'Accepted' status
    const organizerParticipant = newEvent.participants.find(p => p.user.toString() === req.user.id);
    if (organizerParticipant) {
      organizerParticipant.status = 'Accepted';
    } else {
      newEvent.participants.push({ user: req.user.id, status: 'Accepted' });
    }

    await newEvent.save();
    res.status(201).json(newEvent);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
