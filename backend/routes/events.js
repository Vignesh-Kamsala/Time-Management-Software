const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Meeting = require('../schema/EventSchema');
const Executive = require('../schema/ExecutiveSchema');

router.post('/create-and-addtasks', async (req, res) => {
  try {
    const { title, startTime, endTime, venue, project, participantEmails, createdBy } = req.body;
    if (!title || !startTime || !endTime || !participantEmails || !Array.isArray(participantEmails) || participantEmails.length === 0) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    const emails = Array.from(new Set(participantEmails.map(e => (typeof e === 'string' ? e.trim().toLowerCase() : '')).filter(Boolean)));
    if (!emails.length) return res.status(400).json({ msg: 'No valid participant emails provided' });

    const invited = emails.map(email => ({ email, execId: null, status: 'invited' }));

    const meeting = new Meeting({
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      venue: venue || '',
      project: project || '',
      createdBy: createdBy || null,
      participants: [],
      invited,
      status: 'pending',
      notified: false
    });

    await meeting.save();

    const execs = await Executive.find({ email: { $in: emails } });
    const execByEmail = {};
    for (const ex of execs) execByEmail[ex.email.toLowerCase()] = ex;

    const taskObj = {
      title: meeting.title,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      description: `Auto-added from meeting ${meeting._id}`,
      meetingId: meeting._id
    };

    const updatedExecs = [];
    for (const ex of execs) {
      const already = Array.isArray(ex.tasks) && ex.tasks.some(t => String(t.meetingId) === String(meeting._id));
      if (!already) {
        ex.tasks.push(taskObj);
        await ex.save();
      }
      if (!meeting.participants.map(String).includes(String(ex._id))) meeting.participants.push(ex._id);
      const invIdx = meeting.invited.findIndex(i => i.email && i.email.toLowerCase() === ex.email.toLowerCase());
      if (invIdx !== -1) meeting.invited[invIdx].execId = ex._id;
      updatedExecs.push({ id: ex._id, name: ex.name, email: ex.email });
    }

    await meeting.save();

    const populated = await Meeting.findById(meeting._id).populate('participants', 'name email department tasks').populate('createdBy', 'name email').lean();
    const notFoundEmails = emails.filter(e => !execByEmail[e]);

    return res.status(201).json({ meeting: populated, addedTasksTo: updatedExecs, notFoundEmails });
  } catch (err) {
    console.error('create-and-addtasks error:', err);
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
