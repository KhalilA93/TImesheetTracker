const { TimesheetEntry, UserSettings } = require('../models');

// Get all timesheet entries with optional filtering
const getAllEntries = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      project,
      category,
      status,
      page = 1,
      limit = 100,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object (only current user's entries)
    const filter = { owner: req.user._id };
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    if (project) filter.project = new RegExp(project, 'i');
    if (category) filter.category = category;
    if (status) filter.status = status;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const entries = await TimesheetEntry.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await TimesheetEntry.countDocuments(filter);

    res.json({
      entries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timesheet entries', error: error.message });
  }
};

// Get entries for calendar view (specific date range)
const getCalendarEntries = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    // Parse the dates and ensure they cover the full range
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    
    // Ensure we capture entries from the start of startDate to the end of endDate
    const queryStartDate = new Date(startDateTime);
    queryStartDate.setHours(0, 0, 0, 0);
    
    const queryEndDate = new Date(endDateTime);
    queryEndDate.setHours(23, 59, 59, 999);

    console.log(`Calendar query: ${queryStartDate.toISOString()} to ${queryEndDate.toISOString()}`);

    // Use a more flexible query that matches entries whose dates fall within the range
    // We'll use startTime for the range check since it's more precise
    const entries = await TimesheetEntry.find({
      owner: req.user._id,
      $or: [
        // Match by date field (for entries where date is the primary field)
        {
          date: {
            $gte: queryStartDate,
            $lte: queryEndDate
          }
        },
        // Also match by startTime (for more precise filtering)
        {
          startTime: {
            $gte: queryStartDate,
            $lte: queryEndDate
          }
        }
      ]
    }).sort({ startTime: 1 });

    console.log(`Found ${entries.length} entries for calendar`);

    // Transform entries for calendar format
    const calendarEvents = entries.map(entry => ({
      id: entry._id.toString(),
      title: entry.project || entry.description || 'Work Entry',
      start: entry.startTime, // Send as ISO string, frontend will convert to Date
      end: entry.endTime,     // Send as ISO string, frontend will convert to Date
      allDay: false,
      // Main event properties (for calendar component)
      hoursWorked: entry.hoursWorked,
      calculatedPay: entry.calculatedPay,
      project: entry.project,
      category: entry.category,
      description: entry.description,
      status: entry.status,
      payRateOverride: entry.payRateOverride,
      // Resource data for detailed view
      resource: {
        entryId: entry._id.toString(),
        hoursWorked: entry.hoursWorked,
        calculatedPay: entry.calculatedPay,
        project: entry.project,
        category: entry.category,
        description: entry.description,
        status: entry.status,
        payRateOverride: entry.payRateOverride,
        date: entry.date
      },
      // Color will be determined by frontend based on category
      color: entry.category || 'regular'
    }));

    res.json({ events: calendarEvents });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching calendar entries', error: error.message });
  }
};

// Get single timesheet entry by ID
const getEntryById = async (req, res) => {
  try {
    const entry = await TimesheetEntry.findOne({ 
      _id: req.params.id, 
      owner: req.user._id 
    });
    
    if (!entry) {
      return res.status(404).json({ message: 'Timesheet entry not found' });
    }

    res.json(entry);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid entry ID format' });
    }
    res.status(500).json({ message: 'Error fetching timesheet entry', error: error.message });
  }
};

// Create new timesheet entry
const createEntry = async (req, res) => {
  try {
    const {
      date,
      startTime,
      endTime,
      description,
      project,
      category,
      payRateOverride,
      status = 'confirmed'
    } = req.body;

    // Validation
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ 
        message: 'Date, start time, and end time are required' 
      });
    }

    // Convert strings to Date objects
    const entryDate = new Date(date);
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ 
        message: 'End time must be after start time' 
      });
    }

    // Calculate hours worked
    const hoursWorked = (end - start) / (1000 * 60 * 60);

    // Create entry
    const entry = new TimesheetEntry({
      owner: req.user._id,
      date: entryDate,
      startTime: start,
      endTime: end,
      hoursWorked,
      description,
      project,
      category,
      payRateOverride,
      status
    });

    await entry.save();

    res.status(201).json({
      message: 'Timesheet entry created successfully',
      entry
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Error creating timesheet entry', error: error.message });
  }
};

// Update timesheet entry
const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the entry first
    const entry = await TimesheetEntry.findById(id);
    if (!entry) {
      return res.status(404).json({ message: 'Timesheet entry not found' });
    }

    // If updating times, recalculate hours
    if (updates.startTime || updates.endTime) {
      const startTime = updates.startTime ? new Date(updates.startTime) : entry.startTime;
      const endTime = updates.endTime ? new Date(updates.endTime) : entry.endTime;

      if (startTime >= endTime) {
        return res.status(400).json({ 
          message: 'End time must be after start time' 
        });
      }

      // Calculate and set hours worked in the updates object
      updates.hoursWorked = (endTime - startTime) / (1000 * 60 * 60);
    }

    // Apply updates to the entry
    Object.keys(updates).forEach(key => {
      entry[key] = updates[key];
    });

    // Save the entry to trigger pre-save middleware
    await entry.save();

    res.json({
      message: 'Timesheet entry updated successfully',
      entry
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid entry ID format' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Error updating timesheet entry', error: error.message });
  }
};

// Delete timesheet entry
const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await TimesheetEntry.findByIdAndDelete(id);

    if (!entry) {
      return res.status(404).json({ message: 'Timesheet entry not found' });
    }

    // Also delete associated alarms
    const { Alarm } = require('../models');
    await Alarm.deleteMany({ timesheetEntryId: id });

    res.json({
      message: 'Timesheet entry and associated alarms deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid entry ID format' });
    }
    res.status(500).json({ message: 'Error deleting timesheet entry', error: error.message });
  }
};

// Get totals for date range
const getTotals = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const totals = await TimesheetEntry.getTotalsForDateRange(
      new Date(startDate),
      new Date(endDate)
    );

    res.json(totals);
  } catch (error) {
    res.status(500).json({ message: 'Error calculating totals', error: error.message });
  }
};

// Bulk operations
const bulkUpdateEntries = async (req, res) => {
  try {
    const { entryIds, updates } = req.body;

    if (!entryIds || !Array.isArray(entryIds) || entryIds.length === 0) {
      return res.status(400).json({ message: 'Entry IDs array is required' });
    }

    const result = await TimesheetEntry.updateMany(
      { _id: { $in: entryIds } },
      updates,
      { runValidators: true }
    );

    res.json({
      message: 'Bulk update completed',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error performing bulk update', error: error.message });
  }
};

// Get summary by project
const getProjectSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const match = {};
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    const summary = await TimesheetEntry.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$project',
          totalHours: { $sum: '$hoursWorked' },
          totalPay: { $sum: '$calculatedPay' },
          entryCount: { $sum: 1 },
          categories: { $addToSet: '$category' }
        }
      },
      {
        $sort: { totalHours: -1 }
      }
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error generating project summary', error: error.message });
  }
};

module.exports = {
  getAllEntries,
  getCalendarEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  getTotals,
  bulkUpdateEntries,
  getProjectSummary
};
