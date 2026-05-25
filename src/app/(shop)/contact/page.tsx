'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' })
      setSubmitted(false)
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container-shop py-12 md:py-20">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Get in <span className="text-brand-forest">Touch</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Have questions? We'd love to hear from you. Contact us anytime and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="container-shop py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">Contact Information</h2>

            <div className="space-y-6">
              {/* Address */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <MapPin size={24} className="text-brand-forest mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Address</h3>
                  <p className="text-muted-foreground">
                    Chicago, IL<br />
                    South Side
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Phone size={24} className="text-brand-forest mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                  <p className="text-muted-foreground">
                    <a href="tel:+1234567890" className="hover:text-brand-forest transition-colors">
                      (123) 456-7890
                    </a>
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Mail size={24} className="text-brand-forest mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email</h3>
                  <p className="text-muted-foreground">
                    <a href="mailto:info@daveen.com" className="hover:text-brand-forest transition-colors">
                      info@daveen.com
                    </a>
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Clock size={24} className="text-brand-forest mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Business Hours</h3>
                  <div className="text-muted-foreground space-y-1">
                    <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
                    <p>Saturday: 9:00 AM - 7:00 PM</p>
                    <p>Sunday: 10:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">Send us a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-foreground mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-forest resize-none"
                  placeholder="Your message..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-forest text-white font-semibold py-3 rounded-lg hover:bg-brand-forest/90 transition-colors"
              >
                Send Message
              </button>

              {submitted && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm font-semibold">
                    ✓ Thank you! We'll get back to you soon.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted py-12 md:py-16 my-12">
        <div className="container-shop">
          <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">Frequently Asked Questions</h2>

          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">What areas do you deliver to?</h3>
              <p className="text-muted-foreground">
                We provide same-day delivery across Chicago's South Side. Check your zip code during checkout.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Do you offer bulk ordering?</h3>
              <p className="text-muted-foreground">
                Yes! For bulk orders, please contact us directly at info@daveen.com or call (123) 456-7890.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, debit cards, and digital payment methods.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Can I return items?</h3>
              <p className="text-muted-foreground">
                We offer a 100% satisfaction guarantee. Contact us within 7 days if you're not satisfied with your purchase.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
