import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

// Auto calculate end date: start + 365 days
function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

// Get current month date range for input min/max
function getCurrentMonthRange() {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth()
  const first = new Date(y, m, 1).toISOString().split('T')[0]
  const last = new Date(y, m + 1, 0).toISOString().split('T')[0]
  return { min: first, max: last }
}

const QUESTIONS = [
  {
    key: 'customerName',
    question: "Hello! 👋 Welcome to **PolicyBot**.\n\nLet's capture the policy details.\nWhat is the **customer's full name**?",
    placeholder: 'e.g. Rahul Sharma',
    type: 'text',
    validate: v => v.trim().length >= 2 ? null : 'Please enter a valid full name',
  },
  {
    key: 'number',
    question: "What is the **customer's contact number**?",
    placeholder: 'e.g. 9876543210',
    type: 'tel',
    validate: v => /^[6-9]\d{9}$/.test(v.trim()) ? null : 'Enter a valid 10-digit mobile number',
  },
  {
    key: 'registrationNumber',
    question: "What is the **vehicle registration number**?",
    placeholder: 'e.g. MH12AB1234',
    type: 'text',
    validate: v => v.trim().length >= 4 ? null : 'Enter a valid registration number',
    transform: v => v.toUpperCase(),
  },
  {
    key: 'policyNumber',
    question: "What is the **policy number**?",
    placeholder: 'e.g. POL-2024-001',
    type: 'text',
    validate: v => v.trim().length >= 3 ? null : 'Enter a valid policy number',
  },
  {
    key: 'policyStartDate',
    question: "What is the **policy start date**?\n\n📅 Only current month dates are allowed.",
    type: 'date',
    validate: v => {
      if (!v) return 'Please select a start date'
      const { min, max } = getCurrentMonthRange()
      if (v < min || v > max) return `Start date must be within current month (${min} to ${max})`
      return null
    },
    getDateRange: getCurrentMonthRange,
  },
  // policyEndDate is auto-calculated, skipped in QUESTIONS
  {
    key: 'vehicleType',
    question: "What is the **vehicle type**?",
    type: 'select',
    options: [
      { value: 'TW', label: 'TW', desc: 'Two Wheeler', icon: '🛵' },
      { value: 'CAR', label: 'CAR', desc: 'Private Car', icon: '🚗' },
      { value: 'GCV', label: 'GCV', desc: 'Goods Vehicle', icon: '🚛' },
      { value: 'PCV', label: 'PCV', desc: 'Passenger Vehicle', icon: '🚌' },
      { value: 'MISC', label: 'MISC', desc: 'Miscellaneous', icon: '🔧' },
    ],
    validate: v => v ? null : 'Please select a vehicle type',
  },
  {
    key: 'premium',
    question: "Last one! What is the **premium amount** (₹)?",
    placeholder: 'e.g. 12500',
    type: 'number',
    validate: v => v && Number(v) > 0 ? null : 'Enter a valid premium amount',
  },
]

function renderText(text) {
  return text.split('\n').map((line, i, arr) => {
    const parts = line.split(/\*\*(.*?)\*\*/g)
    return (
      <span key={i}>
        {parts.map((p, j) => j % 2 === 1
          ? <strong key={j} style={{ color: 'var(--accent)', fontWeight: 700 }}>{p}</strong>
          : p)}
        {i < arr.length - 1 && <br />}
      </span>
    )
  })
}

export default function ChatBot() {
  const [messages, setMessages] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true
    setTimeout(() => addBotMessage(QUESTIONS[0].question), 500)
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])
  useEffect(() => { if (!isTyping && inputRef.current && !isDone) inputRef.current.focus() }, [isTyping, currentStep, isDone])

  const addBotMessage = (text, delay = 0) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, { role: 'bot', text, id: Date.now() + Math.random() }])
    }, delay + 850)
  }

  const handleUserSubmit = async (value) => {
    const q = QUESTIONS[currentStep]
    const finalValue = q.transform ? q.transform(value) : String(value).trim()
    const validationError = q.validate(finalValue, answers)
    if (validationError) { setError(validationError); return }

    setError('')
    let newAnswers = { ...answers, [q.key]: finalValue }

    // Auto-calculate end date when start date is entered
    if (q.key === 'policyStartDate') {
      const autoEnd = addDays(finalValue, 365)
      newAnswers.policyEndDate = autoEnd
    }

    setAnswers(newAnswers)
    setInputValue('')

    let displayValue = finalValue
    if (q.key === 'premium') displayValue = `₹${Number(finalValue).toLocaleString('en-IN')}`
    if (q.key === 'vehicleType') {
      const opt = q.options.find(o => o.value === finalValue)
      displayValue = `${opt.icon} ${opt.label} — ${opt.desc}`
    }
    if (q.key === 'policyStartDate') {
      const autoEnd = addDays(finalValue, 365)
      const fmtDate = d => new Date(d).toLocaleDateString('en-IN')
      displayValue = `${fmtDate(finalValue)}`
      // Add bot confirmation of auto end date
      setMessages(prev => [...prev, { role: 'user', text: displayValue, id: Date.now() + Math.random() }])
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        setMessages(prev => [...prev, {
          role: 'bot', text: `✅ Got it! Policy end date has been **automatically set** to **${fmtDate(autoEnd)}** (365 days from start date).`,
          id: Date.now() + Math.random()
        }])
        const next = currentStep + 1
        setCurrentStep(next)
        if (next < QUESTIONS.length) {
          setTimeout(() => addBotMessage(QUESTIONS[next].question, 100), 900)
        } else {
          setCurrentStep(QUESTIONS.length)
          setIsTyping(true)
          setTimeout(() => {
            setIsTyping(false)
            setMessages(prev => [...prev, { role: 'bot', type: 'summary', data: newAnswers, id: Date.now() }])
          }, 1200)
        }
      }, 900)
      return
    }

    setMessages(prev => [...prev, { role: 'user', text: displayValue, id: Date.now() + Math.random() }])
    const next = currentStep + 1

    if (next < QUESTIONS.length) {
      setCurrentStep(next)
      addBotMessage(QUESTIONS[next].question, 150)
    } else {
      setCurrentStep(QUESTIONS.length)
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        setMessages(prev => [...prev, { role: 'bot', type: 'summary', data: newAnswers, id: Date.now() }])
      }, 1100)
    }
  }

  const handleSubmitPolicy = async () => {
    setIsSubmitting(true)
    try {
      const payload = { ...answers, premium: Number(answers.premium) }
      const res = await axios.post('/api/policies', payload)
      setIsDone(true)
      setMessages(prev => [...prev, { role: 'bot', type: 'success', data: res.data.data, id: Date.now() }])
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong.'
      setMessages(prev => [...prev, { role: 'bot', text: `❌ ${msg}`, id: Date.now() }])
      setIsDone(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRestart = () => {
    setMessages([]); setCurrentStep(0); setAnswers({})
    setInputValue(''); setError(''); setIsDone(false)
    setTimeout(() => addBotMessage(QUESTIONS[0].question), 400)
  }

  const currentQ = QUESTIONS[currentStep]
  const showInput = !isTyping && currentStep < QUESTIONS.length && !isDone
  const dateRange = currentQ?.getDateRange?.() || {}

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ maxWidth: '680px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {messages.map(msg => (
            <div key={msg.id}>
              {msg.role === 'bot' && !msg.type && <BotBubble text={msg.text} />}
              {msg.role === 'user' && <UserBubble text={msg.text} />}
              {msg.type === 'summary' && <SummaryCard data={msg.data} onConfirm={handleSubmitPolicy} onEdit={handleRestart} isSubmitting={isSubmitting} />}
              {msg.type === 'success' && <SuccessCard data={msg.data} onNew={handleRestart} />}
            </div>
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {showInput && (
        <div style={{
          borderTop: '1px solid rgba(199,210,254,0.5)', padding: '16px 20px',
          background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          animation: 'fadeUp 0.3s ease', boxShadow: '0 -4px 20px rgba(15,23,42,0.05)',
        }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            {currentQ?.type === 'select' ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {currentQ.options.map(opt => (
                  <button key={opt.value} onClick={() => handleUserSubmit(opt.value)} style={{
                    padding: '10px 18px', borderRadius: '12px',
                    border: '1.5px solid rgba(199,210,254,0.7)',
                    background: 'rgba(255,255,255,0.9)', cursor: 'pointer',
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', transition: 'all 0.18s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                    boxShadow: '0 2px 8px rgba(15,23,42,0.06)', color: 'var(--text)',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(199,210,254,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.transform = 'none' }}
                  >
                    <span style={{ fontSize: '20px' }}>{opt.icon}</span>
                    <span>{opt.label}</span>
                    <span style={{ fontSize: '10px', opacity: 0.6, fontWeight: 500 }}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {error && (
                  <div style={{ fontSize: '12px', color: 'var(--danger)', fontFamily: 'var(--font-mono)', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', padding: '6px 12px', animation: 'fadeIn 0.2s ease' }}>⚠ {error}</div>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    ref={inputRef}
                    type={currentQ?.type || 'text'}
                    value={inputValue}
                    min={dateRange.min}
                    max={dateRange.max}
                    onChange={e => { setInputValue(e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && inputValue && handleUserSubmit(inputValue)}
                    placeholder={currentQ?.placeholder}
                    style={{
                      flex: 1, padding: '13px 18px', borderRadius: '13px',
                      border: `1.5px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(199,210,254,0.7)'}`,
                      background: 'rgba(255,255,255,0.95)', color: 'var(--text)',
                      fontFamily: 'var(--font-display)', fontSize: '15px', outline: 'none', transition: 'all 0.2s',
                      boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(199,210,254,0.7)'; e.target.style.boxShadow = '0 2px 8px rgba(15,23,42,0.05)' }}
                  />
                  <button
                    onClick={() => inputValue && handleUserSubmit(inputValue)}
                    disabled={!inputValue}
                    style={{
                      padding: '13px 22px', borderRadius: '13px', border: 'none',
                      background: inputValue ? 'linear-gradient(145deg, #3b82f6, #2563eb)' : 'rgba(241,245,249,0.9)',
                      color: inputValue ? '#fff' : 'var(--text3)',
                      cursor: inputValue ? 'pointer' : 'not-allowed',
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', transition: 'all 0.2s',
                      boxShadow: inputValue ? '0 4px 14px rgba(37,99,235,0.35)' : 'none',
                    }}
                  >→</button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginTop: '12px' }}>
              {QUESTIONS.map((_, i) => (
                <div key={i} style={{
                  height: '3px', flex: 1, borderRadius: '3px', transition: 'background 0.4s ease',
                  background: i < currentStep ? 'linear-gradient(90deg, #3b82f6, #2563eb)' : i === currentStep ? 'rgba(37,99,235,0.25)' : 'rgba(203,213,225,0.6)',
                }} />
              ))}
              <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginLeft: '6px', whiteSpace: 'nowrap' }}>
                {currentStep}/{QUESTIONS.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BotBubble({ text }) {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', animation: 'botBubble 0.35s ease' }}>
      <div style={{ width: 34, height: 34, borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(145deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>🛡️</div>
      <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.95)', borderRadius: '4px 16px 16px 16px', padding: '13px 18px', maxWidth: '82%', fontSize: '15px', lineHeight: '1.65', color: 'var(--text)', boxShadow: '0 4px 20px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,1)' }}>
        {renderText(text)}
      </div>
    </div>
  )
}

function UserBubble({ text }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', animation: 'fadeUp 0.22s ease' }}>
      <div style={{ background: 'linear-gradient(145deg, #3b82f6, #2563eb)', borderRadius: '16px 4px 16px 16px', padding: '13px 18px', maxWidth: '72%', fontSize: '15px', color: '#fff', fontWeight: 600, boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }}>{text}</div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', animation: 'fadeIn 0.2s ease' }}>
      <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(145deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>🛡️</div>
      <div style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.95)', borderRadius: '4px 16px 16px 16px', padding: '14px 20px', display: 'flex', gap: '5px', alignItems: 'center', boxShadow: '0 4px 20px rgba(15,23,42,0.07)' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', animation: `typing 1.1s ease-in-out ${i*0.16}s infinite` }} />
        ))}
      </div>
    </div>
  )
}

function SummaryCard({ data, onConfirm, onEdit, isSubmitting }) {
  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN') : '—'
  const fields = [
    { label: 'Customer Name', value: data.customerName, icon: '👤' },
    { label: 'Contact Number', value: data.number, icon: '📞' },
    { label: 'Registration No.', value: data.registrationNumber, icon: '🔖' },
    { label: 'Policy Number', value: data.policyNumber, icon: '📋' },
    { label: 'Start Date', value: fmt(data.policyStartDate), icon: '📅' },
    { label: 'End Date (Auto)', value: fmt(data.policyEndDate), icon: '📅' },
    { label: 'Vehicle Type', value: data.vehicleType, icon: '🚗' },
    { label: 'Premium', value: `₹${Number(data.premium).toLocaleString('en-IN')}`, icon: '💰' },
  ]
  return (
    <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.98)', borderRadius: '20px', padding: '22px', boxShadow: '0 8px 40px rgba(37,99,235,0.12), inset 0 1px 0 rgba(255,255,255,1)', animation: 'botBubble 0.4s ease' }}>
      <div style={{ height: '3px', borderRadius: '3px', marginBottom: '18px', background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6, #3b82f6)', backgroundSize: '200% 100%', animation: 'shimmer 2.5s linear infinite' }} />
      <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: '16px', letterSpacing: '0.08em' }}>✦ POLICY SUMMARY — PLEASE CONFIRM</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px' }}>
        {fields.map(f => (
          <div key={f.label} style={{ background: 'rgba(241,245,249,0.6)', borderRadius: '10px', padding: '10px 13px', border: '1px solid rgba(199,210,254,0.4)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>{f.icon} {f.label}</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{f.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onConfirm} disabled={isSubmitting} style={{
          flex: 1, padding: '13px', borderRadius: '12px', border: 'none',
          background: isSubmitting ? 'rgba(241,245,249,0.9)' : 'linear-gradient(145deg, #3b82f6, #2563eb)',
          color: isSubmitting ? 'var(--text3)' : '#fff',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: isSubmitting ? 'none' : '0 4px 16px rgba(37,99,235,0.32)', transition: 'all 0.2s',
        }}>
          {isSubmitting ? <><div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#666', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Saving...</> : '✓ Confirm & Save Policy'}
        </button>
        <button onClick={onEdit} style={{ padding: '13px 20px', borderRadius: '12px', border: '1.5px solid rgba(199,210,254,0.7)', background: 'rgba(255,255,255,0.8)', color: 'var(--text2)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>✎ Edit</button>
      </div>
    </div>
  )
}

function SuccessCard({ data, onNew }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '20px', padding: '30px 22px', boxShadow: '0 8px 40px rgba(16,185,129,0.12)', animation: 'botBubble 0.4s ease', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '14px', animation: 'successBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>✅</div>
      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>Policy Saved Successfully!</div>
      <div style={{ fontSize: '13px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: '22px' }}>{data.policyNumber} · {data.customerName}</div>
      <button onClick={onNew} style={{ padding: '11px 28px', borderRadius: '12px', border: '1.5px solid rgba(37,99,235,0.3)', background: 'var(--accent-light)', color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>+ Add Another Policy</button>
    </div>
  )
}
