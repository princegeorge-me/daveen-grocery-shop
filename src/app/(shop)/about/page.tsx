'use client'

import Image from 'next/image'
import { CheckCircle, MapPin, Users, TrendingUp } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container-shop py-12 md:py-20">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            About <span className="text-brand-forest">Daveen</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Daveen African Food & Grocery is Chicago's premier destination for authentic African and Caribbean groceries. We bring the flavors of home directly to your door.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container-shop py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              To provide Chicago's African and Caribbean communities with authentic, high-quality groceries at competitive prices. We believe everyone deserves access to the ingredients that connect them to their heritage.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <CheckCircle size={20} className="text-brand-forest flex-shrink-0" />
                <span className="text-foreground">Authentic African & Caribbean products</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle size={20} className="text-brand-forest flex-shrink-0" />
                <span className="text-foreground">Farm-fresh produce delivered same-day</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle size={20} className="text-brand-forest flex-shrink-0" />
                <span className="text-foreground">Premium meats and seafood</span>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">Why Choose Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              With over a decade of experience serving Chicago's South Side, we've built a reputation for quality, reliability, and genuine care for our customers.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <TrendingUp size={20} className="text-brand-forest flex-shrink-0" />
                <span className="text-foreground">Competitive pricing and regular deals</span>
              </li>
              <li className="flex items-center gap-3">
                <Users size={20} className="text-brand-forest flex-shrink-0" />
                <span className="text-foreground">Dedicated customer service team</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={20} className="text-brand-forest flex-shrink-0" />
                <span className="text-foreground">Serving Chicago's South Side</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-forest/10 py-12 md:py-16 my-12">
        <div className="container-shop">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-brand-forest mb-2">1000+</p>
              <p className="text-muted-foreground">Happy Customers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-brand-forest mb-2">500+</p>
              <p className="text-muted-foreground">Products Available</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-brand-forest mb-2">24hrs</p>
              <p className="text-muted-foreground">Same-Day Delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container-shop py-12 md:py-16">
        <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">Our Team</h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Daveen is built by a passionate team dedicated to serving our community with authenticity, quality, and respect. Every member of our team understands the importance of bringing home closer to you.
        </p>
      </section>
    </div>
  )
}
