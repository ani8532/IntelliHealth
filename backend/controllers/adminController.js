const LifestyleEntry = require('../models/LifestyleEntry');
const MedicalPrediction = require('../models/medicalformmodel');
const FollowUp = require('../models/FollowUp');
const moment = require('moment'); 

exports.getRiskTrendsOverTime = async (req, res) => {
  try {
    const lifestyle = await LifestyleEntry.find({}, 'createdAt isDiabetes isBP isHeartDisease');
    const medical = await MedicalPrediction.find({}, 'createdAt diabetesRisk bpRisk heartDiseaseRisk');

    const monthlyData = {};

    const processEntry = (date, diabetes, bp, heart) => {
      const month = moment(date).format('YYYY-MM');
      if (!monthlyData[month]) {
        monthlyData[month] = {
          count: 0,
          diabetesSum: 0,
          bpSum: 0,
          heartSum: 0
        };
      }

      monthlyData[month].count += 1;
      monthlyData[month].diabetesSum += isFinite(diabetes) ? diabetes : 0;
      monthlyData[month].bpSum += isFinite(bp) ? bp : 0;
      monthlyData[month].heartSum += isFinite(heart) ? heart : 0;
    };

    lifestyle.forEach(entry =>
      processEntry(entry.createdAt, entry.isDiabetes, entry.isBP, entry.isHeartDisease)
    );

    medical.forEach(entry =>
      processEntry(entry.createdAt, entry.diabetesRisk, entry.bpRisk, entry.heartDiseaseRisk)
    );

    const trend = Object.entries(monthlyData)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([month, { count, diabetesSum, bpSum, heartSum }]) => ({
        month,
        avgDiabetesRisk: +(diabetesSum / count).toFixed(2),
        avgBPRisk: +(bpSum / count).toFixed(2),
        avgHeartRisk: +(heartSum / count).toFixed(2)
      }));

    console.log("✅ Risk trends computed:", trend.length, "months");

    res.json({ trend });
  } catch (err) {
    console.error("❌ Risk trend error:", err);
    res.status(500).json({ error: 'Failed to compute risk trends over time' });
  }
};


const computeCorrelation = (x, y) => {
  if (x.length !== y.length || x.length === 0) return NaN;

  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  const numerator = x.reduce((sum, xi, i) => sum + ((xi - meanX) * (y[i] - meanY)), 0);
  const denominator = Math.sqrt(
    x.reduce((sum, xi) => sum + ((xi - meanX) ** 2), 0) *
    y.reduce((sum, yi) => sum + ((yi - meanY) ** 2), 0)
  );

  return denominator === 0 ? 0 : +(numerator / denominator).toFixed(3); // Avoid NaN
};

const encodeFastFoodFreq = (value) => {
  const map = {
    never: 0,
    rarely: 1,
    occasionally: 2,
    frequently: 3,
    daily: 4
  };
  return value ? map[value.toLowerCase()] ?? null : null;
};

exports.getRiskCorrelations = async (req, res) => {
  try {
    const forms = await LifestyleEntry.find();

    const cleanedData = forms.map(form => {
      const fastFoodFrequency = encodeFastFoodFreq(form.fastFoodFreq);
      const { bmi, waterIntake, isDiabetes, isBP, isHeartDisease } = form;

      return {
        bmi: Number(bmi),
        waterIntake: Number(waterIntake),
        fastFoodFrequency: Number(fastFoodFrequency),
        diabetesRisk: isFinite(Number(isDiabetes)) ? Number(isDiabetes) : null,
        bpRisk: isFinite(Number(isBP)) ? Number(isBP) : null,
        heartRisk: isFinite(Number(isHeartDisease)) ? Number(isHeartDisease) : null
      };
    }).filter(row =>
      Object.values(row).every(val => typeof val === 'number' && !isNaN(val))
    );

    if (cleanedData.length === 0) {
      return res.status(200).json({ correlationMatrix: {}, message: "No valid data for correlation" });
    }

    // Debug: Log distinct values
    const debugColumns = ["fastFoodFrequency", "bmi", "waterIntake", "diabetesRisk", "bpRisk", "heartRisk"];
    for (const col of debugColumns) {
      const values = [...new Set(cleanedData.map(d => d[col]))];
      console.log(`${col} unique values:`, values);
    }

    const keys = debugColumns;
    const matrix = {};

    for (let k1 of keys) {
      matrix[k1] = {};
      for (let k2 of keys) {
        const x = cleanedData.map(d => d[k1]);
        const y = cleanedData.map(d => d[k2]);
        matrix[k1][k2] = computeCorrelation(x, y);
      }
    }
    console.log("✅ Correlation matrix computed:", keys.join(', '));
    console.log("✅ Correlation matrix computed");

// Transform matrix object into 2D array
const labels = keys;
const matrix2D = labels.map(rowKey => labels.map(colKey => matrix[rowKey][colKey]));

// Send final format
res.json({
  matrix: matrix2D,
  labels: labels
});



  } catch (err) {
    console.error("❌ Correlation error:", err);
    res.status(500).json({ error: 'Failed to compute correlation matrix' });
  }
};

exports.getCombinedRiskData = async (req, res) => {
  try {
    const lifestyle = await LifestyleEntry.find({}, 'bmi isDiabetes isBP isHeartDisease gender age');
    const medical = await MedicalPrediction.find({}, 'bmi diabetesRisk bpRisk heartDiseaseRisk gender age');

    const combined = [];

    lifestyle.forEach(e => {
      combined.push({
        bmi: e.bmi,
        diabetesRisk: e.isDiabetes ?? null,
        bpRisk: e.isBP ?? null,
        heartRisk: e.isHeartDisease ?? null,
        gender: e.gender,
        age: e.age,
        type: 'Lifestyle'
      });
    });

    medical.forEach(e => {
      combined.push({
        bmi: e.bmi,
        diabetesRisk: e.diabetesRisk ?? null,
        bpRisk: e.bpRisk ?? null,
        heartRisk: e.heartDiseaseRisk ?? null,
        gender: e.gender,
        age: e.age,
        type: 'Medical'
      });
    });

    res.json(combined);
  } catch (err) {
    console.error('Error fetching combined risk data:', err);
    res.status(500).json({ error: 'Failed to fetch combined risk data' });
  }
};

exports.getRiskByDiet = async (req, res) => {
  try {
    const lifestyleData = await LifestyleEntry.find({ dietType: { $exists: true } });
    const medicalData = await MedicalPrediction.find({ dietType: { $exists: true } });

    const merged = [...lifestyleData, ...medicalData];

    const grouped = {};
    merged.forEach(entry => {
      const type = entry.dietType || 'Unknown';
      if (!grouped[type]) {
        grouped[type] = { count: 0, diabetes: 0, bp: 0, heart: 0 };
      }
      grouped[type].count += 1;
      grouped[type].diabetes += entry.isDiabetes ?? entry.diabetesRisk ?? 0;
      grouped[type].bp += entry.isBP ?? entry.bpRisk ?? 0;
      grouped[type].heart += entry.isHeartDisease ?? entry.heartDiseaseRisk ?? 0;
    });

    const result = Object.entries(grouped).map(([dietType, values]) => ({
      dietType,
      avgRisk: (values.diabetes + values.bp + values.heart) / (3 * values.count)
    }));
    console.log("Diet risk data:", result);

    res.json({ riskByDiet: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error aggregating risk by diet' });
  }
};

exports.getSmokingAlcoholRisk = async (req, res) => {
  try {
    const lifestyleData = await LifestyleEntry.find();
    const medicalData = await MedicalPrediction.find();

    // Combine both datasets
    const combinedData = [...lifestyleData, ...medicalData];

    // Group by combinations of smoking and alcohol
    const groups = {};

    combinedData.forEach(entry => {
      const smoking = (entry.smoking || 'no').toLowerCase() === 'yes' ? 'Smoker' : 'Non-Smoker';
      const alcohol = (entry.alcohol || 'no').toLowerCase() === 'yes' ? 'Drinker' : 'Non-Drinker';
      const groupKey = `${smoking}-${alcohol}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          count: 0,
          diabetes: 0,
          bp: 0,
          heart: 0,
        };
      }

      const diabetesRisk = entry.diabetesRisk ?? entry.isDiabetes ?? 0;
      const bpRisk = entry.bpRisk ?? entry.isBP ?? 0;
      const heartRisk = entry.heartDiseaseRisk ?? entry.isHeartDisease ?? 0;

      groups[groupKey].count += 1;
      groups[groupKey].diabetes += diabetesRisk;
      groups[groupKey].bp += bpRisk;
      groups[groupKey].heart += heartRisk;
    });

    const result = Object.entries(groups).map(([group, values]) => ({
      group,
      diabetes: +(values.diabetes / values.count).toFixed(2),
      bp: +(values.bp / values.count).toFixed(2),
      heart: +(values.heart / values.count).toFixed(2),
    }));
    

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get risk by smoking/alcohol' });
  }
};
exports.getLabBasedRisk3D = async (req, res) => {
  try {
    const medicalData = await MedicalPrediction.find({}, 'fastingBloodSugar hba1c cholesterol triglycerides diabetesRisk bpRisk heartDiseaseRisk');

    const data = medicalData.map(entry => ({
      sugar: entry.fastingBloodSugar ?? entry.hba1c ?? null,
      lipids: entry.cholesterol ?? entry.triglycerides ?? null,
      diabetesRisk: entry.diabetesRisk ?? null,
      bpRisk: entry.bpRisk ?? null,
      heartRisk: entry.heartDiseaseRisk ?? null
    })).filter(item =>
      item.sugar != null && item.lipids != null &&
      (item.diabetesRisk != null || item.bpRisk != null || item.heartRisk != null)
    );
    console.log("Lab-based 3D risk data:", data);

    res.json(data);
  } catch (err) {
    console.error("Error fetching lab-based 3D risk data:", err);
    res.status(500).json({ error: "Failed to fetch 3D lab risk data" });
  }
};
exports.getBloodPressureDistribution = async (req, res) => {
  try {
    const medicalData = await MedicalPrediction.find({}, 'systolicBP diastolicBP');

    const data = medicalData
      .map(entry => ({
        systolic: Number(entry.systolicBP),
        diastolic: Number(entry.diastolicBP)
      }))
      .filter(bp =>
        isFinite(bp.systolic) &&
        isFinite(bp.diastolic) &&
        bp.systolic > 0 &&
        bp.diastolic > 0
      );

    if (data.length === 0) {
      return res.status(200).json({ message: 'No valid BP data found', data: [] });
    }

    console.log("✅ BP Distribution fetched:", data.length, "records");

    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching BP distribution:", err);
    res.status(500).json({ error: 'Failed to fetch blood pressure distribution data' });
  }
};


// For admin - fetch overall status distribution
exports.getAllFollowUpStats = async (req, res) => {
  try {
    const followUps = await FollowUp.find(); // No user filter
    const statusCounts = { pending: 0, recovered: 0, referred: 0 };

    followUps.forEach(entry => {
      const status = entry.status?.toLowerCase();
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      } else {
        statusCounts['pending']++; 
      }
    });

    res.json(statusCounts);
  } catch (err) {
    console.error('Error in getAllFollowUpStats:', err);
    res.status(500).json({ error: 'Failed to fetch follow-up stats' });
  }
};

