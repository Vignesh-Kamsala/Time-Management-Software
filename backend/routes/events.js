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
// inside router.post('/create-and-addtasks', ...)
const creatorId = req.user?.id || createdBy || null; // prefer logged-in user

const meeting = new Meeting({
  title,
  startTime: new Date(startTime),
  endTime: new Date(endTime),
  venue: venue || '',
  project: project || '',
  createdBy: creatorId,
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


const auth = require('../middleware/authMiddleware');         // <- import auth

  // backend/routes/meetings.js (or events.js) - update my-day route
router.get('/my-day', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = (req.user?.email || '').toLowerCase();

    if (!userId && !userEmail) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const start = new Date(dateStr);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    const orConditions = [
      { participants: userId },
      { 'invited.execId': userId },
      { 'createdBy.id': String(userId) }, // ✅ show meetings created by this user
    ];
    if (userEmail) {
      orConditions.push({ 'invited.email': userEmail });
      orConditions.push({ 'createdBy.email': userEmail }); // ✅ also match by creator email
    }

    const query = {
      startTime: { $lt: end },
      endTime: { $gt: start },
      $or: orConditions
    };

    const meetings = await Meeting.find(query)
      .populate('participants', 'name email')
      .sort('startTime')
      .lean();

    return res.json({ meetings });
  } catch (err) {
    console.error('my-day route error:', err);
    return res.status(500).json({ error: err.message });
  }
});



const ALLOWED = new Set(['accepted', 'declined', 'tentative']);

router.post('/rsvp', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

    const { meetingId, response } = req.body;
    if (!meetingId || !response) return res.status(400).json({ msg: 'meetingId and response required' });

    const normalized = String(response).trim().toLowerCase();
    if (!ALLOWED.has(normalized)) {
      return res.status(400).json({ msg: 'Invalid response. Allowed: accepted, declined, tentative' });
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ msg: 'Meeting not found' });

    const exec = await Executive.findById(userId).select('email name');
    if (!exec) return res.status(404).json({ msg: 'Executive not found' });

    // find invited entry by execId or email
    let invitedEntry = meeting.invited.find(i => i.execId && String(i.execId) === String(userId));
    if (!invitedEntry) {
      invitedEntry = meeting.invited.find(i => i.email && i.email.toLowerCase() === exec.email.toLowerCase());
      if (invitedEntry) invitedEntry.execId = exec._id;
    }

    if (!invitedEntry) {
      // not explicitly invited earlier — add as invited with response
      meeting.invited.push({
        email: exec.email,
        execId: exec._id,
        status: normalized
      });
    } else {
      invitedEntry.status = normalized;
    }

    // manage participants
    if (normalized === 'accepted') {
      if (!meeting.participants.map(String).includes(String(userId))) {
        meeting.participants.push(userId);
      }
    } else if (normalized === 'declined') {
      meeting.participants = meeting.participants.filter(id => String(id) !== String(userId));
    }
    // tentative -> do not modify participants

    // --- key: update meeting.status based on invited statuses ---
    // If there is at least one invited person and ALL invited entries are 'accepted', mark scheduled.
    // Otherwise keep as 'pending' (we do NOT auto-set to 'cancelled' here).
    const invitedList = Array.isArray(meeting.invited) ? meeting.invited : [];
    if (invitedList.length > 0 && invitedList.every(i => i.status === 'accepted')) {
      meeting.status = 'scheduled';
    } else {
      meeting.status = 'pending';
    }

    await meeting.save();

    const updatedMeeting = await Meeting.findById(meeting._id)
      .populate('participants', 'name email')
      .populate('createdBy', 'name email')
      .lean();

    return res.json({ msg: 'RSVP updated', meeting: updatedMeeting });
  } catch (err) {
    console.error('RSVP error:', err);
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
});




//status changing function by creator only 
router.post('/:id/complete',auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

    const meetingId = req.params.id;
    if (!meetingId) return res.status(400).json({ msg: 'Missing meeting id' });

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ msg: 'Meeting not found' });

    // ensure createdBy exists and is same as requester
    if (!meeting.createdBy || String(meeting.createdBy) !== String(userId)) {
      return res.status(403).json({ msg: 'Only the meeting creator can mark as completed' });
    }

    // check endTime — allow marking completed only after meeting end (or equal)
    const now = new Date();
    if (meeting.endTime && new Date(meeting.endTime) > now) {
      return res.status(400).json({ msg: 'Meeting has not finished yet; cannot mark completed' });
    }

    // optional: only change if not already completed
    if (meeting.status === 'completed') {
      return res.status(200).json({ msg: 'Meeting already completed', meeting });
    }

    meeting.status = 'completed';
    await meeting.save();

    // respond with populated meeting if you like
    const populated = await Meeting.findById(meetingId)
      .populate('participants', 'name email')
      .populate('createdBy', 'name email')
      .lean();

    return res.json({ msg: 'Meeting marked completed', meeting: populated });
  } catch (err) {
    console.error('mark-complete error:', err);
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
});


module.exports = router;
