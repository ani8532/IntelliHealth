import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import states from '../data/states.json';
import districtList from '../data/list.json';
import '../styles/MedicalForm.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MedicalForm = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '', age: '', gender: '', contact: '', height: '', weight: '',
    state: '', district: '', city: '',
    fastingBloodSugar: '', hba1c: '', systolicBP: '', diastolicBP: '',
    cholesterol: '', triglycerides: '', symptoms: {},
    diagnosisReports: '', currentMedication: '', familyHistory: '',
    lifestyleFactors: '', dietType: '', smoking: '', alcohol: '', waterIntake: ''
  });

  const [districts, setDistricts] = useState([]);
  const [bmi, setBmi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const selected = districtList.states.find(s => s.state === form.state);
    setDistricts(selected ? selected.districts : []);
  }, [form.state]);

  useEffect(() => {
    const h = parseFloat(form.height) / 100;
    const w = parseFloat(form.weight);
    if (!isNaN(h) && !isNaN(w) && h > 0) {
      const calculatedBmi = (w / (h * h)).toFixed(2);
      setBmi(calculatedBmi);
    } else {
      setBmi(null);
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

  const transformFormData = () => ({
    ...form,
    bmi: bmi ? parseFloat(bmi) : null,
    age: parseInt(form.age),
    fastingBloodSugar: parseFloat(form.fastingBloodSugar),
    hba1c: parseFloat(form.hba1c),
    systolicBP: parseFloat(form.systolicBP),
    diastolicBP: parseFloat(form.diastolicBP),
    cholesterol: parseFloat(form.cholesterol),
    triglycerides: parseFloat(form.triglycerides),
    symptoms: Object.keys(form.symptoms).filter(k => form.symptoms[k] === 'yes'),
    waterIntake: parseFloat(form.waterIntake),
    lifestyleFactors: form.lifestyleFactors || '',
    dietType: form.dietType,
    smoking: form.smoking,
    alcohol: form.alcohol
  });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload = transformFormData();
      const token = localStorage.getItem("token");
      if (!token) {
        alert(t('medicalform.login_alert'));
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/medical/predict', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const {
        name, diabetesRisk, bpRisk, heartDiseaseRisk,
        suggestions, report
      } = response.data;

      setResult({
        name, diabetesRisk, bpRisk, heartDiseaseRisk,
        suggestions, report, bmi, date: new Date().toLocaleDateString()
      });
    } catch (err) {
      console.error(err);
      alert(t('medicalform.error_report'));
    }
    setLoading(false);
  };

  const handleConsultDoctor = () => {
    window.open('/consult-doctor', '_blank');
  };

  const generatePDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(t('medicalform.report_heading'), 20, 20);
    doc.setFontSize(12);
    doc.text(`${t('medicalform.name')}: ${form.name}`, 20, 30);
    doc.text(`${t('medicalform.date')}: ${result.date}`, 20, 37);
    doc.text(`${t('medicalform.bmi')}: ${result.bmi}`, 20, 44);

    doc.setFontSize(14);
    doc.text(t('medicalform.predictions_heading'), 20, 55);

    doc.autoTable({
      startY: 60,
      head: [[t('medicalform.disease'), t('medicalform.risk'), t('medicalform.suggestion')]],
      body: [
        ["Diabetes", (result.diabetesRisk * 100).toFixed(1), result.suggestions.diabetes],
        ["Blood Pressure", (result.bpRisk * 100).toFixed(1), result.suggestions.blood_pressure],
        ["Heart Disease", (result.heartDiseaseRisk * 100).toFixed(1), result.suggestions.heart_disease],
      ],
      theme: 'striped'
    });

    doc.text(t('medicalform.full_report'), 20, doc.lastAutoTable.finalY + 10);
    const lines = doc.splitTextToSize(result.report || '', 170);
    doc.text(lines, 20, doc.lastAutoTable.finalY + 17);

    doc.save(`${form.name}_health_report.pdf`);
  };

  const questions = [
    t('medicalform.symptom_thirst'),
    t('medicalform.symptom_urination'),
    t('medicalform.symptom_blurred_vision'),
    t('medicalform.symptom_headaches'),
    t('medicalform.symptom_chest_pain'),
    t('medicalform.symptom_fatigue'),
    t('medicalform.symptom_swelling'),
    t('medicalform.symptom_breathlessness'),
    t('medicalform.symptom_palpitations'),
    t('medicalform.symptom_numbness')
  ];

  return (
    <div className="medical-form-wrapper">
      <form onSubmit={handleSubmit} className="medical-form">
        <h2>{t('medicalform.title')}</h2>

        <input name="name" placeholder={t('medicalform.name')} onChange={handleChange} required />
        <input name="contact" placeholder={t('medicalform.contact')} onChange={handleChange} required />
        <input name="age" type="number" placeholder={t('medicalform.age')} onChange={handleChange} required />

        <select name="gender" onChange={handleChange} required>
          <option value="">{t('medicalform.gender')}</option>
          <option value="male">{t('medicalform.male')}</option>
          <option value="female">{t('medicalform.female')}</option>
          <option value="other">{t('medicalform.other')}</option>
        </select>

        <select name="state" onChange={handleChange} required>
          <option value="">{t('medicalform.state')}</option>
          {states.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>

        <select name="district" onChange={handleChange} required>
          <option value="">{t('medicalform.district')}</option>
          {districts.map((d, i) => <option key={i} value={d}>{d}</option>)}
        </select>

        <input name="city" placeholder={t('medicalform.city')} onChange={handleChange} required />
        <input name="height" placeholder={t('medicalform.height')} onChange={handleChange} required />
        <input name="weight" placeholder={t('medicalform.weight')} onChange={handleChange} required />

        {bmi && <p><strong>{t('medicalform.bmi')}:</strong> {bmi}</p>}

        <input name="fastingBloodSugar" placeholder={t('medicalform.fasting_blood_sugar')} onChange={handleChange} required />
        <input name="hba1c" placeholder={t('medicalform.hba1c')} onChange={handleChange} required />
        <input name="systolicBP" placeholder={t('medicalform.systolic_bp')} onChange={handleChange} required />
        <input name="diastolicBP" placeholder={t('medicalform.diastolic_bp')} onChange={handleChange} required />
        <input name="cholesterol" placeholder={t('medicalform.cholesterol')} onChange={handleChange} required />
        <input name="triglycerides" placeholder={t('medicalform.triglycerides')} onChange={handleChange} required />

        <h3>{t('medicalform.symptom_questions')}</h3>
        {questions.map((q, idx) => (
          <div key={idx}>
            <label>{q}</label>
            <select onChange={e => handleSymptomChange(q, e.target.value)} required>
              <option value="">{t('medicalform.select')}</option>
              <option value="yes">{t('medicalform.yes')}</option>
              <option value="no">{t('medicalform.no')}</option>
            </select>
          </div>
        ))}

        <textarea name="diagnosisReports" placeholder={t('medicalform.diagnosis_reports')} onChange={handleChange}></textarea>
        <textarea name="currentMedication" placeholder={t('medicalform.current_medication')} onChange={handleChange}></textarea>
        <textarea name="familyHistory" placeholder={t('medicalform.family_history')} onChange={handleChange}></textarea>
        <textarea name="lifestyleFactors" placeholder={t('medicalform.lifestyle_factors')} onChange={handleChange}></textarea>

        <select name="dietType" onChange={handleChange} required>
          <option value="">{t('medicalform.diet_type')}</option>
          <option value="vegetarian">{t('medicalform.vegetarian')}</option>
          <option value="non-vegetarian">{t('medicalform.non_vegetarian')}</option>
          <option value="mixed">{t('medicalform.mixed_diet')}</option>
        </select>
        <select name="smoking" onChange={handleChange} required>
          <option value="">{t('medicalform.smoking')}</option>
          <option value="yes">{t('medicalform.yes')}</option>
          <option value="no">{t('medicalform.no')}</option>
        </select>
        <select name="alcohol" onChange={handleChange} required>
          <option value="">{t('medicalform.alcohol')}</option>
          <option value="yes">{t('medicalform.yes')}</option>
          <option value="no">{t('medicalform.no')}</option>
        </select>
        <input name="waterIntake" placeholder={t('medicalform.water_intake')} onChange={handleChange} required />

        <button type="submit">{t('medicalform.submit')}</button>
      </form>

      {loading && <p className="loading">{t('medicalform.generating_report')}</p>}

      {result && (
        <div className="report-card">
          <h3>{t('medicalform.report_title')}</h3>
          <p><strong>{t('medicalform.name')}:</strong> {result.name}</p>
          <p><strong>{t('medicalform.bmi')}:</strong> {bmi}</p>
          <p><strong>{t('medicalform.date')}:</strong> {result.date}</p>

          <h4>{t('medicalform.predictions')}:</h4>
          <ul>
            <li>Diabetes: {(result.diabetesRisk * 100).toFixed(1)}% - {result.suggestions.diabetes}</li>
            <li>BP: {(result.bpRisk * 100).toFixed(1)}% - {result.suggestions.blood_pressure}</li>
            <li>Heart: {(result.heartDiseaseRisk * 100).toFixed(1)}% - {result.suggestions.heart_disease}</li>
          </ul>

          
          <div className="report-buttons">
            <button className="btn" onClick={generatePDF}>{t('medicalform.download_pdf')}</button>
            <button onClick={handleConsultDoctor}>{t('medicalform.consult_doctor')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalForm;
