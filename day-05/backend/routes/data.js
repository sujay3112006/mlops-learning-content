const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { verifyToken } = require('./auth');
const SalesData = require('../models/SalesData');

const router = express.Router();

// Setup Multer for memory storage or temp disk storage
const upload = multer({ dest: 'uploads/' });

// POST /api/data/upload - Upload CSV
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      // Basic mapping from typical CSV headers to our schema
      // We assume CSV has: Date, Campaign, Revenue, Leads, Cost
      const record = {
        user: req.user._id,
        date: new Date(data.Date || data.date),
        campaign: data.Campaign || data.campaign || 'Unknown',
        revenue: parseFloat(data.Revenue || data.revenue || 0),
        leads: parseInt(data.Leads || data.leads || 0, 10),
        cost: parseFloat(data.Cost || data.cost || 0)
      };
      // Only push if valid date
      if (!isNaN(record.date)) {
        results.push(record);
      }
    })
    .on('end', async () => {
      try {
        // Option 1: Clear old data for user before inserting new
        await SalesData.deleteMany({ user: req.user._id });
        
        // Option 2: Insert new data
        if (results.length > 0) {
          await SalesData.insertMany(results);
        }
        
        // Remove temp file
        fs.unlinkSync(filePath);

        res.status(200).json({ message: `Successfully processed ${results.length} records.`, count: results.length });
      } catch (err) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ error: 'Failed to save data to database', details: err.message });
      }
    })
    .on('error', (error) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(500).json({ error: 'Error parsing CSV', details: error.message });
    });
});

// GET /api/data/metrics - Get aggregated metrics for dashboard
router.get('/metrics', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch raw data for the user
    const data = await SalesData.find({ user: userId }).sort({ date: 1 });

    if (data.length === 0) {
      return res.status(200).json({ empty: true });
    }

    // Calculate totals
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalLeads = data.reduce((sum, item) => sum + item.leads, 0);
    const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
    
    // Group by month for line chart (e.g., 'Jan 2024')
    const monthlyData = {};
    data.forEach(item => {
      const monthYear = item.date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { name: monthYear, revenue: 0, leads: 0 };
      }
      monthlyData[monthYear].revenue += item.revenue;
      monthlyData[monthYear].leads += item.leads;
    });

    const trendData = Object.values(monthlyData);

    // Group by campaign for bar chart
    const campaignDataObj = {};
    data.forEach(item => {
      if (!campaignDataObj[item.campaign]) {
        campaignDataObj[item.campaign] = { name: item.campaign, revenue: 0, leads: 0 };
      }
      campaignDataObj[item.campaign].revenue += item.revenue;
      campaignDataObj[item.campaign].leads += item.leads;
    });

    const campaignData = Object.values(campaignDataObj).sort((a, b) => b.revenue - a.revenue).slice(0, 5); // Top 5

    res.status(200).json({
      empty: false,
      kpis: {
        totalRevenue,
        totalLeads,
        totalCost,
        roi: totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0
      },
      trendData,
      campaignData
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
