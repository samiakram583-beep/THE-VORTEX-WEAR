import React from 'react';
import {
  ArrowRight,
  Sparkles,
  Heart,
  Shield,
  CheckCircle,
  Feather,
  Users,
  Compass,
} from 'lucide-react';

import heroImage from '../assets/images/hero_vortex_fashion_1790956344973.jpg';
import categoryPants from '../assets/images/category_pants_vortex_1790956382275.jpg';
import categoryShirts from '../assets/images/category_shirts_vortex_1790956364111.jpg';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[#FBFBF9] text-[#121212] min-h-screen">
      {/* 1. HERO / EDITORIAL HEADER */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-stone-200/80 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-xs font-semibold uppercase tracking-widest text-stone-600">
            <Sparkles className="w-3.5 h-3.5 text-stone-900" />
            <span>Brand Story & Heritage</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-stone-950 font-display tracking-tight leading-[1.08]">
            Where Style Meets Identity
          </h1>

          <p className="text-base sm:text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Welcome to{' '}
            <strong className="text-stone-950 font-semibold">
              The Vortex Wear
            </strong>{' '}
            — a clothing brand created for people who believe that what you
            wear is more than just clothing. It is an expression of your
            personality, confidence, individuality, and everyday lifestyle.
          </p>

          <div className="p-6 sm:p-8 max-w-2xl mx-auto bg-white rounded-2xl border border-stone-200/80 shadow-xs text-stone-700 text-sm sm:text-base leading-relaxed">
            <p>
              We created The Vortex Wear with a simple idea:{' '}
              <span className="font-semibold text-stone-950">
                great clothing should make you feel confident while staying
                true to who you are.
              </span>
            </p>
            <p className="mt-3 text-xs sm:text-sm text-stone-500">
              From everyday essentials to carefully selected styles, our goal
              is to bring together modern design, comfort, quality, and a
              distinctive sense of identity.
            </p>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL HERO IMAGE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 mb-20">
        <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden shadow-xl border border-stone-200 bg-stone-900">
          <img
            src={heroImage}
            alt="The Vortex Wear Editorial Collection"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 sm:p-10">
            <span className="text-white/90 text-xs sm:text-sm tracking-widest uppercase font-semibold">
              The Vortex Wear · Modern Clothing & Menswear
            </span>
          </div>
        </div>
      </section>

      {/* 3. OUR STORY */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-b border-stone-200/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Chapter I
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-950 font-display">
              Our Story
            </h2>
          </div>

          <div className="lg:col-span-8 space-y-6 text-stone-700 text-sm sm:text-base leading-relaxed">
            <p>
              The Vortex Wear began with a vision shared by two founders who
              wanted to create something of their own — a brand that represents
              modern style while remaining accessible, comfortable, and
              meaningful.
            </p>
            <p>
              What started as an idea grew into a vision for a clothing
              destination where customers could discover pieces that fit
              naturally into their lives.
            </p>
            <p>
              Our journey is built around continuous improvement. We listen to
              our customers, learn from their experiences, and constantly look
              for ways to make our products and shopping experience better.
            </p>

            <div className="p-6 bg-stone-100/80 rounded-xl border border-stone-200 text-stone-900 font-medium italic">
              "We believe a strong brand is not created overnight. It is built
              through consistency, trust, creativity, and the people who choose
              to be part of the journey."
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR FOUNDERS */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-stone-200/80">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            Leadership & Vision
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-stone-950 font-display">
            Our Founders
          </h2>

          <p className="text-sm text-stone-600">
            The visionary minds shaping the identity, design integrity, and
            customer experience of The Vortex Wear.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-10 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-xl bg-stone-900 text-white flex items-center justify-center font-display font-bold text-xl">
                SA
              </div>

              <div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Founder
                </span>

                <h3 className="text-2xl font-extrabold text-stone-950 font-display mt-2">
                  Sami-Ullah-Akram
                </h3>
              </div>

              <p className="text-stone-600 text-sm leading-relaxed">
                Sami-Ullah-Akram is one of the founders of The Vortex Wear,
                helping shape the brand&apos;s vision, identity, and direction.
                His focus is on building a brand that combines contemporary
                fashion with a strong connection to its customers.
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100 text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Brand Vision & Direction
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-10 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-xl bg-stone-900 text-white flex items-center justify-center font-display font-bold text-xl">
                BA
              </div>

              <div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Founder
                </span>

                <h3 className="text-2xl font-extrabold text-stone-950 font-display mt-2">
                  Bilal Akram
                </h3>
              </div>

              <p className="text-stone-600 text-sm leading-relaxed">
                Bilal Akram is one of the founders of The Vortex Wear,
                contributing to the development and growth of the brand. His
                vision is centered around creating a memorable customer
                experience and building The Vortex Wear into a trusted clothing
                brand.
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100 text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Growth & Customer Experience
            </div>
          </div>
        </div>

        <div className="mt-10 p-6 sm:p-8 bg-[#121212] text-white rounded-2xl text-center space-y-2 shadow-lg">
          <p className="text-sm sm:text-base font-medium leading-relaxed max-w-3xl mx-auto">
            Together,{' '}
            <strong className="text-white">Sami-Ullah-Akram</strong> and{' '}
            <strong className="text-white">Bilal Akram</strong> founded{' '}
            <strong className="text-white">The Vortex Wear</strong> with a
            shared vision: to build a brand that people can recognize, trust,
            and proudly wear.
          </p>
        </div>
      </section>

      {/* 5. WHAT WE BELIEVE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-stone-200/80">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            Core Philosophy
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-stone-950 font-display">
            What We Believe
          </h2>

          <p className="text-sm text-stone-600">
            Five fundamental principles that guide our garment design,
            manufacturing standards, and customer relationships.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl border border-stone-200 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-900 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>

            <h3 className="font-bold text-stone-950 text-base font-display">
              Confidence
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Wear what makes you feel like yourself.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-stone-200 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-900 flex items-center justify-center">
              <Feather className="w-5 h-5" />
            </div>

            <h3 className="font-bold text-stone-950 text-base font-display">
              Comfort
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Style should never come at the expense of comfort.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-stone-200 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-900 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>

            <h3 className="font-bold text-stone-950 text-base font-display">
              Quality
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              We aim to provide products that customers can enjoy and rely on.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-stone-200 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-900 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>

            <h3 className="font-bold text-stone-950 text-base font-display">
              Individuality
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Your style belongs to you. We are here to help you express it.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-stone-200 space-y-3 shadow-xs sm:col-span-2 lg:col-span-2">
            <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-900 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>

            <h3 className="font-bold text-stone-950 text-base font-display">
              Trust
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              We believe lasting relationships with customers are built through
              honesty, consistency, and a great experience.
            </p>
          </div>
        </div>
      </section>

      {/* 6. OUR COLLECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-stone-200/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Curated Wardrobe
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-950 font-display">
              Our Collection
            </h2>

            <div className="space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed">
              <p>
                The Vortex Wear focuses on carefully selected clothing across
                our core categories, including{' '}
                <strong className="text-stone-950">Pants</strong> and{' '}
                <strong className="text-stone-950">Shirts</strong>.
              </p>

              <p>
                We aim to offer styles that can become part of your everyday
                wardrobe — pieces that work for different occasions while
                maintaining a modern and distinctive look.
              </p>

              <p className="text-stone-500 text-xs sm:text-sm">
                Our collection will continue to evolve as we grow, with new
                styles and products introduced with our customers in mind.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('/pants')}
                className="py-2.5 px-5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                <span>Explore Pants</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('/shirts')}
                className="py-2.5 px-5 bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                <span>Explore Shirts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
              <img
                src={categoryPants}
                alt="The Vortex Wear Tailored Pants"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs mt-6">
              <img
                src={categoryShirts}
                alt="The Vortex Wear Modern Shirts"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. MORE THAN CLOTHING */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-stone-200/80">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" />
            <span>Community & Purpose</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-stone-950 font-display">
            More Than Clothing
          </h2>

          <div className="space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed text-left sm:text-center">
            <p className="font-semibold text-stone-950 text-base sm:text-lg">
              We don&apos;t want The Vortex Wear to be just another online
              clothing store.
            </p>

            <p>We want it to become a brand with a community behind it.</p>

            <p>
              Every order, every customer, every piece of feedback, and every
              interaction contributes to the story we are building.
            </p>

            <p className="text-stone-600">
              Our ambition is to grow responsibly, continuously improve our
              products and service, and create an experience that makes
              customers want to return.
            </p>
          </div>
        </div>
      </section>

      {/* 8. OUR PROMISE */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-stone-200/80">
        <div className="p-8 sm:p-12 bg-white rounded-3xl border border-stone-200 shadow-sm text-center space-y-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            Our Commitment
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-950 font-display">
            Our Promise
          </h2>

          <div className="space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            <p>
              When you shop with The Vortex Wear, our goal is to give you more
              than a product.
            </p>

            <p>
              We want to give you confidence in what you choose, a smooth
              shopping experience, and the feeling that you are part of
              something that is growing.
            </p>

            <p className="text-stone-500">
              As we continue our journey, our commitment remains simple:
            </p>
          </div>

          <div className="pt-2">
            <div className="inline-block py-3 px-6 sm:px-8 bg-stone-950 text-white rounded-xl text-sm sm:text-base font-bold font-mono tracking-wider uppercase shadow-md">
              Create. Improve. Inspire. Repeat.
            </div>
          </div>
        </div>
      </section>

      {/* 9. LOOKING AHEAD */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            The Road Forward
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-stone-950 font-display">
            Looking Ahead
          </h2>

          <div className="space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed">
            <p>The journey of The Vortex Wear is only beginning.</p>

            <p>
              We have ambitious plans for the future — from expanding our
              collections to reaching more customers and continuing to improve
              the way people discover and shop for clothing online.
            </p>

            <p>
              We know that building a great brand takes time. That&apos;s why
              we are focused on earning trust one customer at a time and
              improving with every step.
            </p>

            <p className="text-stone-900 font-medium">
              Thank you for being part of our story.
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <p className="text-xl sm:text-2xl font-extrabold text-stone-950 font-display">
            Welcome to The Vortex Wear.
          </p>

          <p className="text-sm sm:text-base font-bold uppercase tracking-widest text-amber-700">
            Wear Your Identity.
          </p>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => onNavigate('/shop')}
            className="py-3 px-8 bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Explore The Collection</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('/contact')}
            className="py-3 px-8 bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 text-xs font-bold rounded-lg transition-colors"
          >
            <span>Get in Touch</span>
          </button>
        </div>
      </section>
    </div>
  );
};
