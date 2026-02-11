/**
 * SignupForm Component
 *
 * Basic signup form for ASMO demo purposes.
 * Used in Scenario 2 to demonstrate Context Cascade.
 *
 * ASMO will add email validation (client + server) to this form.
 */

import React, { useState } from 'react';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
}

export function SignupForm() {
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<SignupFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Add email validation here
    // ASMO will implement this in Scenario 2

    // Submit to API
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      // Success
      console.log('Signup successful');
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      <h2>Create Account</h2>

      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit">Sign Up</button>
    </form>
  );
}
