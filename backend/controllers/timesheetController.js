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

    // Build filter object
    const filter = {};
    
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

    const entries = await TimesheetEntry.getEntriesForDateRange(
      new Date(startDate),
      new Date(endDate)
    );    // Transform entries for calendar format
    const calendarEvents = entries.map(entry => ({
      id: entry._id.toString(),
      title: entry.title,
      start: new Date(entry.startTime),
      end: new Date(entry.endTime),
      allDay: false,
      resource: {
        entryId: entry._id.toString(),
        hoursWorked: entry.hoursWorked,
        calculatedPay: entry.calculatedPay,
        project: entry.project,
        category: entry.category,
        description: entry.description,
        status: entry.status
      },
      backgroundColor: entry.color,
      borderColor: entry.color
    }));

    res.json({ events: calendarEvents });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching calendar entries', error: error.message });
  }
};

// Get single timesheet entry by ID
const getEntryById = async (req, res) => {
  try {
    const entry = await TimesheetEntry.findById(req.params.id);
    
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
