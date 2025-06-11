const { TimesheetEntry, UserSettings, Alarm } = require('../models');

// Get dashboard overview data
const getDashboardOverview = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get totals for different periods
    const [todayTotals, weekTotals, monthTotals, settings] = await Promise.all([
      TimesheetEntry.getTotalsForDateRange(today, now),
      TimesheetEntry.getTotalsForDateRange(thisWeekStart, now),
      TimesheetEntry.getTotalsForDateRange(thisMonthStart, now),
      UserSettings.getSettings()
    ]);

    // Get recent entries
    const recentEntries = await TimesheetEntry.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('date startTime endTime hoursWorked calculatedPay project category status');

    // Get upcoming alarms
    const upcomingAlarms = await Alarm.getUpcoming(24);

    // Get active alarms that should trigger
    const activeAlarms = await Alarm.getTriggerable();

    res.json({
      totals: {
        today: todayTotals,
        thisWeek: weekTotals,
        thisMonth: monthTotals
      },
      recentEntries,
      upcomingAlarms: upcomingAlarms.slice(0, 5), // Limit to 5 most recent
      activeAlarms,
      settings: {
        defaultPayRate: settings.defaultPayRate,
        formattedPayRate: settings.formattedPayRate,
        currency: settings.currency
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard overview', error: error.message });
  }
};

// Get weekly summary
const getWeeklySummary = async (req, res) => {
  try {
    const { startDate } = req.query;
    
    let weekStart;
    if (startDate) {
      weekStart = new Date(startDate);
    } else {
      const now = new Date();
      weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of current week
    }
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Get daily breakdown for the week
    const dailyBreakdown = await TimesheetEntry.aggregate([
      {
        $match: {
          date: { $gte: weekStart, $lte: weekEnd },
          status: { $in: ['confirmed', 'submitted', 'approved'] }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            dayOfWeek: { $dayOfWeek: "$date" }
          },
          totalHours: { $sum: "$hoursWorked" },
          totalPay: { $sum: "$calculatedPay" },
          entryCount: { $sum: 1 },
          categories: { $addToSet: "$category" }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    // Get project breakdown for the week
    const projectBreakdown = await TimesheetEntry.aggregate([
      {
        $match: {
          date: { $gte: weekStart, $lte: weekEnd },
          status: { $in: ['confirmed', 'submitted', 'approved'] }
        }
      },
      {
        $group: {
          _id: "$project",
          totalHours: { $sum: "$hoursWorked" },
          totalPay: { $sum: "$calculatedPay" },
          entryCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalHours: -1 }
      }
    ]);

    // Get week totals
    const weekTotals = await TimesheetEntry.getTotalsForDateRange(weekStart, weekEnd);

    res.json({
      weekStart,
      weekEnd,
      totals: weekTotals,
      dailyBreakdown,
      projectBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weekly summary', error: error.message });
  }
};

// Get monthly summary
const getMonthlySummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    let monthStart, monthEnd;
    if (year && month) {
      monthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
      monthEnd = new Date(parseInt(year), parseInt(month), 0);
    } else {
      const now = new Date();
      monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Get weekly breakdown for the month
    const weeklyBreakdown = await TimesheetEntry.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: monthEnd },
          status: { $in: ['confirmed', 'submitted', 'approved'] }
        }
      },
      {
        $group: {
          _id: {
            week: { $week: "$date" },
            year: { $year: "$date" }
          },
          totalHours: { $sum: "$hoursWorked" },
          totalPay: { $sum: "$calculatedPay" },
          entryCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.week": 1 }
      }
    ]);

    // Get category breakdown for the month
    const categoryBreakdown = await TimesheetEntry.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: monthEnd },
          status: { $in: ['confirmed', 'submitted', 'approved'] }
        }
      },
      {
        $group: {
          _id: "$category",
          totalHours: { $sum: "$hoursWorked" },
          totalPay: { $sum: "$calculatedPay" },
          entryCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalHours: -1 }
      }
    ]);

    // Get month totals
    const monthTotals = await TimesheetEntry.getTotalsForDateRange(monthStart, monthEnd);

    res.json({
      monthStart,
      monthEnd,
      totals: monthTotals,
      weeklyBreakdown,
      categoryBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching monthly summary', error: error.message });
  }
};

// Get productivity insights
const getProductivityInsights = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    // Average hours per day
    const dailyAverages = await TimesheetEntry.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: { $in: ['confirmed', 'submitted', 'approved'] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          dailyHours: { $sum: "$hoursWorked" },
          dailyPay: { $sum: "$calculatedPay" }
        }
      },
      {
        $group: {
          _id: null,
          avgHoursPerDay: { $avg: "$dailyHours" },
          avgPayPerDay: { $avg: "$dailyPay" },
          totalDaysWorked: { $sum: 1 }
        }
      }
    ]);

    // Most productive hours
    const hourlyBreakdown = await TimesheetEntry.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: { $in: ['confirmed', 'submitted', 'approved'] }
        }
      },
      {
        $group: {
          _id: { $hour: "$startTime" },
          totalHours: { $sum: "$hoursWorked" },
          entryCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalHours: -1 }
      }
    ]);

    // Day of week patterns
    const dayOfWeekBreakdown = await TimesheetEntry.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: { $in: ['confirmed', 'submitted', 'approved'] }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$date" },
          totalHours: { $sum: "$hoursWorked" },
          avgSessionLength: { $avg: "$hoursWorked" },
          entryCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    const insights = dailyAverages[0] || { avgHoursPerDay: 0, avgPayPerDay: 0, totalDaysWorked: 0 };

    res.json({
      period: { startDate, endDate, days: parseInt(days) },
      insights,
      hourlyBreakdown,
      dayOfWeekBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching productivity insights', error: error.message });
  }
};

// Get alarm statistics
const getAlarmStatistics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    const alarmStats = await Alarm.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgSnoozeCount: { $avg: "$snoozeCount" }
        }
      }
    ]);

    // Alarm effectiveness (triggered vs dismissed ratio)
    const effectiveness = await Alarm.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['triggered', 'dismissed'] }
        }
      },
      {
        $group: {
          _id: null,
          triggered: {
            $sum: { $cond: [{ $eq: ["$status", "triggered"] }, 1, 0] }
          },
          dismissed: {
            $sum: { $cond: [{ $eq: ["$status", "dismissed"] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      period: { startDate, endDate, days: parseInt(days) },
      alarmStats,
      effectiveness: effectiveness[0] || { triggered: 0, dismissed: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alarm statistics', error: error.message });
  }
};

module.exports = {
  getDashboardOverview,
  getWeeklySummary,
  getMonthlySummary,
  getProductivityInsights,
  getAlarmStatistics
};
