const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth=require("../middleware/authMiddleware")
const Meeting = require('../schema/EventSchema');
const Executive = require('../schema/ExecutiveSchema');

// router.post('/create-and-addtasks', async (req, res) => {
//   try {
//     const { title, startTime, endTime, venue, project, participantEmails, createdBy } = req.body;
//     if (!title || !startTime || !endTime || !participantEmails || !Array.isArray(participantEmails) || participantEmails.length === 0) {
//       return res.status(400).json({ msg: 'Missing required fields' });
//     }

//     const emails = Array.from(new Set(participantEmails.map(e => (typeof e === 'string' ? e.trim().toLowerCase() : '')).filter(Boolean)));
//     if (!emails.length) return res.status(400).json({ msg: 'No valid participant emails provided' });

//     const invited = emails.map(email => ({ email, execId: null, status: 'invited' }));
// // inside router.post('/create-and-addtasks', ...)
// const creatorId = typeof createdBy === 'string' ? createdBy : (createdBy?._id || createdBy);

// const meeting = new Meeting({
//   title,
//   startTime: new Date(startTime),
//   endTime: new Date(endTime),
//   venue: venue || '',
//   project: project || '',
//   createdBy: creatorId,
//   participants: [],
//   invited,
//   status: 'pending',
//   notified: false
// });
// // assume meeting is a Mongoose doc (not yet saved) or plain object about to be saved
// // and `createdBy` is the ObjectId (string or ObjectId) of the creator (from req.user.id)


// // ensure participants contains creatorId
// meeting.participants = meeting.participants || [];
// if (!meeting.participants.map(String).includes(String(creatorId))) {
//   meeting.participants.push(creatorId);
// }

// // if invited array exists, mark creator's invited entry as accepted (if present)
// if (Array.isArray(meeting.invited)) {
//   meeting.invited = meeting.invited.map(inv => {
//     try {
//       const execId = inv.execId ? String(inv.execId) : null;
//       const email = inv.email ? String(inv.email).toLowerCase() : null;
//       // match by execId if available, else by email (fallback)
//       if ((execId && String(execId) === String(creatorId)) || (email && email === String(req.user?.email || '').toLowerCase())) {
//         return { ...inv, status: 'accepted' }; // mark accepted for creator
//       }
//       return inv;
//     } catch (e) {
//       return inv;
//     }
//   });
// }


//     await meeting.save();

//     const execs = await Executive.find({ email: { $in: emails } });
//     const execByEmail = {};
//     for (const ex of execs) execByEmail[ex.email.toLowerCase()] = ex;

//     const taskObj = {
//       title: meeting.title,
//       startTime: meeting.startTime,
//       endTime: meeting.endTime,
//       description: `Auto-added from meeting ${meeting._id}`,
//       meetingId: meeting._id
//     };

//     const updatedExecs = [];
//     for (const ex of execs) {
//       const already = Array.isArray(ex.tasks) && ex.tasks.some(t => String(t.meetingId) === String(meeting._id));
//       if (!already) {
//         ex.tasks.push(taskObj);
//         await ex.save();
//       }
//       if (!meeting.participants.map(String).includes(String(ex._id))) meeting.participants.push(ex._id);
//       const invIdx = meeting.invited.findIndex(i => i.email && i.email.toLowerCase() === ex.email.toLowerCase());
//       if (invIdx !== -1) meeting.invited[invIdx].execId = ex._id;
//       updatedExecs.push({ id: ex._id, name: ex.name, email: ex.email });
//     }

//     await meeting.save();

//     const populated = await Meeting.findById(meeting._id).populate('participants', 'name email department tasks').populate('createdBy', 'name email').lean();
//     const notFoundEmails = emails.filter(e => !execByEmail[e]);

//     return res.status(201).json({ meeting: populated, addedTasksTo: updatedExecs, notFoundEmails });
//   } catch (err) {
//     console.error('create-and-addtasks error:', err);
//     return res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// });

// at top of file make sure you have these requires:
// const express = require('express');
// const router = express.Router();
// const Meeting = require('../schema/EventSchema'); // adjust path as needed
// const auth = require('../authMiddleware'); // your auth middleware

router.post('/create-and-addtasks', auth, async (req, res) => {
  try {
    // 1) Basic data and auth
    const userId = req.user?.id; // the creator's id (ObjectId string)
    const userEmail = (req.user?.email || '').toLowerCase();
    if (!userId) return res.status(401).json({ msg: 'Not authenticated' });

    const {
      title = 'Untitled',
      startTime,
      endTime,
      venue = '',
      project = '',
      participantEmails = [], // expected array of emails
      invited = [], // optional invited array objects { email, execId, status }
    } = req.body || {};

    // Validate times
    const parsedStart = startTime ? new Date(startTime) : null;
    const parsedEnd = endTime ? new Date(endTime) : null;
    if (!parsedStart || isNaN(parsedStart.getTime())) return res.status(400).json({ msg: 'Invalid startTime' });
    if (!parsedEnd || isNaN(parsedEnd.getTime())) return res.status(400).json({ msg: 'Invalid endTime' });
    if (parsedEnd.getTime() <= parsedStart.getTime()) return res.status(400).json({ msg: 'endTime must be after startTime' });

    // 2) Normalize participant emails into invited entries
    const normalizedParticipantEmails = Array.isArray(participantEmails)
      ? participantEmails.map(e => (e || '').toLowerCase()).filter(Boolean)
      : [];

    // Build invited array while preserving any execId if present
    const invitedFromPayload = Array.isArray(invited)
      ? invited.map(item => ({
          email: (item.email || '').toLowerCase() || undefined,
          execId: item.execId || null,
          status: item.status || 'invited',
        }))
      : [];

    // Merge both sources (explicit invited + participantEmails)
    const invitedMap = new Map();
    invitedFromPayload.forEach(i => {
      if (i.email) invitedMap.set(i.email, { email: i.email, execId: i.execId || null, status: i.status || 'invited' });
    });
    normalizedParticipantEmails.forEach(email => {
      if (!invitedMap.has(email)) invitedMap.set(email, { email, execId: null, status: 'invited' });
    });

    const finalInvited = Array.from(invitedMap.values());

    // 3) Prepare meeting object
    const meetingObj = {
      title,
      startTime: parsedStart,
      endTime: parsedEnd,
      venue,
      project,
      invited: finalInvited,
      participants: [], // will push creator below
      createdBy: userId,
      status: 'pending',
    };

    // 4) Ensure creator is accepted by default:
    //   - add creatorId to participants
    //   - if invited list contains creator email/execId, mark that entry as 'accepted'
    const creatorId = userId; // declare before using (prevents hoisting errors)
    meetingObj.participants = meetingObj.participants || [];
    if (!meetingObj.participants.map(String).includes(String(creatorId))) {
      meetingObj.participants.push(creatorId);
    }

    // Mark invited entry for creator as accepted (if it exists by execId or email)
    const normalizedCreatorEmail = (userEmail || '').toLowerCase();
    if (Array.isArray(meetingObj.invited)) {
      meetingObj.invited = meetingObj.invited.map(inv => {
        const invEmail = inv.email ? String(inv.email).toLowerCase() : null;
        const invExecId = inv.execId ? String(inv.execId) : null;
        if ((invExecId && String(invExecId) === String(creatorId)) || (invEmail && invEmail === normalizedCreatorEmail)) {
          return { ...inv, status: 'accepted' };
        }
        return inv;
      });
    }

    // 5) Create & save meeting
    const meetingDoc = await Meeting.create(meetingObj);

    // 6) populate createdBy and participants for response
    const populated = await Meeting.findById(meetingDoc._id)
      .populate('participants', 'name email')
      .populate('createdBy', 'name email')
      .lean();

    return res.json({ meeting: populated });
  } catch (err) {
    console.error('create-and-addtasks error:', err);
    // friendly error
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});


  // backend/routes/meetings.js (or events.js) - update my-day route
router.get('/my-day', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = (req.user?.email || '').toLowerCase();

    if (!userId && !userEmail) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    // Parse and normalize the target date
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const start = new Date(dateStr);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    // ✅ Proper conditions — include:
    //  1. participant in meeting
    //  2. invited by execId or email
    //  3. meeting created by this user
    const orConditions = [
      { participants: userId },
      { 'invited.execId': userId },
      { createdBy: userId }, // FIX: match ObjectId reference instead of createdBy.id
    ];

    if (userEmail) {
      orConditions.push({ 'invited.email': userEmail });
      // createdBy is an ObjectId ref, not an email field
    }

    const query = {
      startTime: { $lt: end },
      endTime: { $gt: start },
      $or: orConditions,
    };

    // ✅ Populate both participants and creator so frontend sees all names/emails
    const meetings = await Meeting.find(query)
      .populate('participants', 'name email')
      .populate('createdBy', 'name email') // added this
      .sort('startTime')
      .lean();

    return res.json({ meetings });
  } catch (err) {
    console.error('my-day route error:', err);
    return res.status(500).json({ error: err.message });
  }
});


//cancel 
// POST /api/meetings/:id/cancel
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const meetingId = req.params.id;
    const userId = req.user?.id;
    const userEmail = (req.user?.email || '').toLowerCase();

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ msg: 'Meeting not found' });

    // Only creator can cancel
    if (!meeting.createdBy || String(meeting.createdBy) !== String(userId)) {
      return res.status(403).json({ msg: 'Only the meeting creator may cancel the meeting' });
    }

    // If already cancelled, return current state
    if (meeting.status === 'cancelled') {
      const populated = await Meeting.findById(meeting._id)
        .populate('participants', 'name email')
        .populate('createdBy', 'name email')
        .lean();
      return res.json({ meeting: populated });
    }

    // Mark meeting cancelled and mark all invited entries as cancelled
    meeting.status = 'cancelled';
    meeting.cancelledAt = new Date();
    meeting.cancelledBy = userId;           // optional metadata
    meeting.cancelledByEmail = userEmail;  // optional, useful for the UI

    if (Array.isArray(meeting.invited)) {
      meeting.invited = meeting.invited.map(inv => ({ ...inv.toObject?.() ?? inv, status: 'cancelled' }));
    }

    // optionally empty participants or leave them — we only update statuses so UI shows cancelled
    await meeting.save();

    const populated = await Meeting.findById(meeting._id)
      .populate('participants', 'name email')
      .populate('createdBy', 'name email')
      .lean();

    return res.json({ meeting: populated });
  } catch (err) {
    console.error('cancel meeting error', err);
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
// POST /api/meetings/:id/complete
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const meetingId = req.params.id;
    const userId = req.user?.id;

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ msg: 'Meeting not found' });

    // Only creator can mark completed
    if (!meeting.createdBy || String(meeting.createdBy) !== String(userId)) {
      return res.status(403).json({ msg: 'Only the meeting creator may mark it completed' });
    }

    // Must be past endTime
    if (meeting.endTime && new Date(meeting.endTime).getTime() > Date.now()) {
      return res.status(400).json({ msg: 'Meeting end time not reached yet' });
    }

    meeting.status = 'completed';
    meeting.completedAt = new Date();
    await meeting.save();

    const populated = await Meeting.findById(meeting._id)
      .populate('participants', 'name email')
      .populate('createdBy', 'name email')
      .lean();

    return res.json({ meeting: populated });
  } catch (err) {
    console.error('complete meeting error', err);
    return res.status(500).json({ error: err.message });
  }
});



module.exports = router;
