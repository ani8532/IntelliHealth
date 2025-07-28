import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import states from '../data/states.json';
import districtList from '../data/list.json';
import '../styles/lifeform.css';

const LifestyleForm = () => {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: '', contact: '', age: '', gender: '', height: '', weight: '',
    state: '', district: '', city: '', diet: '',
    sleep: '', water: '', smoking: '', alcohol: '', area: '', fastfood: '',
    symptoms: {}, familyHistory: '', currentSymptoms: ''
  });

  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [bmi, setBmi] = useState(null);

  useEffect(() => {
    const selected = districtList.states.find(s => s.state === form.state);
    setDistricts(selected ? selected.districts : []);
  }, [form.state]);

  useEffect(() => {
    if (form.height && form.weight) {
      const h = parseFloat(form.height) / 100;
      const w = parseFloat(form.weight);
      if (!isNaN(h) && !isNaN(w) && h > 0) {
        setBmi((w / (h * h)).toFixed(2));
      } else {
        setBmi(null);
      }
    }
  }, [form.height, form.weight]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSymptomChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      symptoms: { ...prev.symptoms, [key]: value }
    }));
  };

  const generateSuggestions = (predictions, bmi) => {
    const suggestions = [];
    if (bmi < 18.5) suggestions.push(t('lforms.suggest_gain_weight'));
    if (predictions.isDiabetes > 0.5) suggestions.push(t('lforms.suggest_reduce_sugar'));
    if (predictions.isBP > 0.5) suggestions.push(t('lforms.suggest_low_salt'));
    if (predictions.isHeartDisease > 0.4) suggestions.push(t('lforms.suggest_exercise'));
    if (suggestions.length === 0) suggestions.push(t('lforms.suggest_all_good'));
    return suggestions;
  };

  const transformFormData = () => {
    return {
      ...form,
      
      waterIntake: parseFloat(form.water),
      dietType: form.diet,
      areaType: form.area,
      fastFoodFreq: form.fastfood,
      sleep: parseFloat(form.sleep),
      height: parseFloat(form.height),
      weight: parseFloat(form.weight),
      bmi: bmi ? parseFloat(bmi) : null,
      age: parseInt(form.age),
      diabetesSymptoms: Object.keys(form.symptoms).filter(q => form.symptoms[q] === 'yes' && q.toLowerCase().includes('thirst')),
      bpSymptoms: Object.keys(form.symptoms).filter(q => form.symptoms[q] === 'yes' && q.toLowerCase().includes('dizziness')),
      heartSymptoms: Object.keys(form.symptoms).filter(q => form.symptoms[q] === 'yes' && q.toLowerCase().includes('chest')),
      familyHistory: form.familyHistory.split(',').map(f => f.trim()).filter(Boolean),
      currentSymptoms: form.currentSymptoms.split(',').map(c => c.trim()).filter(Boolean)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const transformedData = transformFormData();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to continue');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/lifestyle/predict",
        transformedData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const suggestions = generateSuggestions(response.data, bmi);
      const report = {
        ...response.data,
        name: form.name,
        contact: form.contact,
        bmi,
        suggestions,
        date: new Date().toLocaleDateString()
      };

      localStorage.setItem('latestReport', JSON.stringify(report));
      localStorage.setItem('citizenInfo', JSON.stringify({
        name: form.name,
        contact: form.contact,
        age: form.age,
        gender: form.gender
      }));

      setResult(report);
    } catch (error) {
      console.error(error);
      alert(t('submit_error'));
    }

    setLoading(false);
  };
  const getRiskLevel = (score) => {
  if (score > 0.7) return t('high');
  if (score > 0.4) return t('borderline');
  return t('low');
};

    
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor('#007bff');
    doc.text('IntelliHealth', 14, 20);

    doc.setFontSize(16);
    doc.setTextColor('#000');
    doc.text(t('report_title'), 14, 30);

    doc.setFontSize(12);
    doc.text(`${t('name')}: ${result.name}`, 14, 40);
    doc.text(`${t('contact')}: ${result.contact}`, 14, 47);
    doc.text(`${t('date')}: ${result.date}`, 14, 54);

    doc.autoTable({
      head: [[t('metric'), t('value')]],
      body: [
        [t('bmi'), result.bmi],
        [t('diabetes_risk'), `${(result.isDiabetes * 100).toFixed(2)}%`],
        [t('bp_risk'), `${(result.isBP * 100).toFixed(2)}%`],
        [t('heart_risk'), `${(result.isHeartDisease * 100).toFixed(2)}%`]
      ],
      startY: 60,
      theme: 'striped'
    });

    doc.text(t('ai_suggestions'), 14, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      body: result.suggestions.map(s => [s]),
      startY: doc.lastAutoTable.finalY + 15,
      theme: 'grid',
      styles: { cellWidth: 'wrap' },
      columnStyles: { 0: { cellWidth: 180 } }
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Powered by IntelliHealth | www.intellihealth.ai', 14, pageHeight - 10);

    doc.save(`Health_Report_${result.name.replace(/\s/g, '_')}.pdf`);
  };
const questions = [
  t('lforms.lifestyle.symptom_frequent_urination'),
  t('lforms.lifestyle.symptom_thirst_or_hunger'),
  t('lforms.lifestyle.symptom_weight_loss'),
  t('lforms.lifestyle.symptom_blurred_vision'),
  t('lforms.lifestyle.symptom_breath_shortness'),
  t('lforms.lifestyle.symptom_chest_pain'),
  t('lforms.lifestyle.symptom_swelling_feet'),
  t('lforms.lifestyle.symptom_fatigue'),
  t('lforms.lifestyle.symptom_heartbeat_irregular'),
  t('lforms.lifestyle.symptom_family_history')
];


  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="lifestyle-form">
        <h2>{t('lforms.lifestyle.lifestyle_form_title')}</h2>

        <input name="name" placeholder={t('lforms.lifestyle.name')} onChange={handleChange} required />
        <input name="contact" placeholder={t('lforms.contact')} onChange={handleChange} required />
        <input name="age" type="number" placeholder={t('lforms.age')} onChange={handleChange} required />

        <select name="gender" onChange={handleChange} required>
          <option value="">{t('lforms.gender')}</option>
          <option value="male">{t('lforms.lifestyle.male')}</option>
          <option value="female">{t('lforms.lifestyle.female')}</option>
          <option value="other">{t('lforms.lifestyle.other')}</option>
        </select>

        <input name="height" placeholder={t('lforms.lifestyle.height')} onChange={handleChange} required />
        <input name="weight" placeholder={t('lforms.lifestyle.weight')} onChange={handleChange} required />
        {bmi && <p><strong>{t('lforms.lifestyle.bmi')}:</strong> {bmi}</p>}

        <select name="state" onChange={handleChange} required>
          <option value="">{t('lforms.lifestyle.state')}</option>
          {states.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>

        <select name="district" onChange={handleChange} required>
          <option value="">{t('lforms.district')}</option>
          {districts.map((d, i) => <option key={i} value={d}>{d}</option>)}
        </select>

        <input name="city" placeholder={t('lforms.lifestyle.city')} onChange={handleChange} required />

        <select name="diet" onChange={handleChange} required>
          <option value="">{t('lforms.lifestyle.diet_type')}</option>
          <option value="vegetarian">{t('lforms.lifestyle.vegetarian')}</option>
          <option value="non-vegetarian">{t('lforms.lifestyle.non_vegetarian')}</option>
          <option value="mixed">{t('lforms.mixed')}</option>
        </select>

        <input name="sleep" placeholder={t('lforms.lifestyle.sleep')} onChange={handleChange} required />
        <input name="water" placeholder={t('lforms.lifestyle.water_intake')} onChange={handleChange} required />

        <select name="smoking" onChange={handleChange} required>
          <option value="">{t('lforms.lifestyle.smoking')}</option>
          <option value="yes">{t('lforms.lifestyle.yes')}</option>
          <option value="no">{t('lforms.lifestyle.no')}</option>
          <option value="occasionally">{t('lforms.occasionally')}</option>
        </select>

        <select name="alcohol" onChange={handleChange} required>
          <option value="">{t('lforms.lifestyle.alcohol')}</option>
          <option value="yes">{t('lforms.lifestyle.yes')}</option>
          <option value="no">{t('lforms.lifestyle.no')}</option>
          <option value="occasionally">{t('lforms.occasionally')}</option>
        </select>

        <select name="area" onChange={handleChange} required>
          <option value="">{t('lforms.area')}</option>
          <option value="urban">{t('lforms.lifestyle.urban')}</option>
          <option value="rural">{t('lforms.lifestyle.rural')}</option>
        </select>

        <select name="fastfood" onChange={handleChange} required>
          <option value="">{t('lforms.lifestyle.fast_food_freq')}</option>
          <option value="daily">{t('lforms.lifestyle.daily')}</option>
          <option value="twice">{t('lforms.lifestyle.twice')}</option>
          <option value="thrice">{t('lforms.lifestyle.thrice')}</option>
          <option value="occasionally">{t('lforms.lifestyle.occasionally')}</option>
        </select>

        <h3>{t('lforms.symptom_questions')}</h3>
        {questions.map((q, idx) => (
          <div key={idx}>
            <label>{q}</label>
            <select onChange={e => handleSymptomChange(q, e.target.value)} required>
              <option value="">{t('lforms.select')}</option>
              <option value="yes">{t('lforms.lifestyle.yes')}</option>
              <option value="no">{t('lforms.lifestyle.no')}</option>
            </select>
          </div>
        ))}

        <textarea name="familyHistory" placeholder={t('lforms.lifestyle.family_history')} onChange={handleChange}></textarea>
        <textarea name="currentSymptoms" placeholder={t('lforms.lifestyle.current_symptoms')} onChange={handleChange}></textarea>

        <button type="submit">{t('lforms.lifestyle.submit')}</button>
      </form>

      {loading && <p className="loading">{t('lforms.generating_report')}</p>}

      
      
      
      {result && (
  <div className="report-card">
    <h3>{t('lforms.report_title')}</h3>
    <p><strong>{t('lforms.name')}:</strong> {result.name}</p>
    <p><strong>{t('lforms.bmi')}:</strong> {result.bmi}</p>

    <p><strong>{t('lforms.diabetes_risk')}:</strong> {(result.isDiabetes * 100).toFixed(2)}% ({getRiskLevel(result.isDiabetes)})</p>
    <p><strong>{t('lforms.bp_risk')}:</strong> {(result.isBP * 100).toFixed(2)}% ({getRiskLevel(result.isBP)})</p>
    <p><strong>{t('lforms.heart_risk')}:</strong> {(result.isHeartDisease * 100).toFixed(2)}% ({getRiskLevel(result.isHeartDisease)})</p>

    <h4>{t('lforms.ai_suggestions')}:</h4>
    <ul>
      {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
    </ul>

    <button onClick={downloadPDF} className="download-btn">{t('lforms.download_pdf')}</button>
    <a href="/consult-doctor" className="consult-btn" target="_blank" rel="noopener noreferrer">{t('lforms.consult_doctor')}</a>
  </div>
)}
    </div>
  );
};

export default LifestyleForm;
