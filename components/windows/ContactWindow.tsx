'use client'

import React, { useState } from 'react'

export default function ContactWindow() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setStatus('Message sent successfully!')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setIsSubmitting(false)
      
      setTimeout(() => setStatus(''), 5000)
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="window">
      <div className="window-title">Contact</div>
      <div className="window-content active">
        <div className="stats-box" style={{ width: '100%', marginBottom: '20px' }}>
          <div className="stats-title">Contact Information</div>
          <div className="stats-row">
            <div className="stats-label">Email:</div>
            <div><a href="mailto:tahakrawjani@gmail.com">tahakrawjani@gmail.com</a></div>
          </div>
          <div className="stats-row">
            <div className="stats-label">LinkedIn:</div>
            <div><a href="https://linkedin.com/in/taharawjani" target="_blank" rel="noopener noreferrer">taharawjani</a></div>
          </div>
          <div className="stats-row">
            <div className="stats-label">GitHub:</div>
            <div><a href="https://github.com/2900xt" target="_blank" rel="noopener noreferrer">2900xt</a></div>
          </div>
          <div className="stats-row">
            <div className="stats-label">Youtube:</div>
            <div><a href="https://github.com/2900xt" target="_blank" rel="noopener noreferrer">2900xt</a></div>
          </div>
        </div>
      </div>
    </div>
  )
}