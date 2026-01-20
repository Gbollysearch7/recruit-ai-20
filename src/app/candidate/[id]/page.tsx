'use client';

import { AppLayout } from '@/components/AppLayout';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Briefcase,
  Mail,
  Linkedin,
  Github,
  Globe,
  Calendar,
  GraduationCap,
  Star,
  ExternalLink,
  Download,
  MessageSquare
} from 'lucide-react';

// Mock candidate data
const candidate = {
  id: '1',
  name: 'Sarah Chen',
  position: 'Senior Full-Stack Engineer',
  company: 'OpenAI',
  location: 'San Francisco, CA',
  email: 'sarah.chen@example.com',
  pictureUrl: null,
  linkedin: 'https://linkedin.com/in/sarahchen',
  github: 'https://github.com/sarahchen',
  website: 'https://sarahchen.dev',
  graduationYear: 2018,
  school: 'Stanford University',
  matchScore: 98,
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'],
  experience: [
    {
      company: 'OpenAI',
      position: 'Senior Full-Stack Engineer',
      duration: '2022 - Present',
      description: 'Building AI-powered products and developer tools.'
    },
    {
      company: 'Stripe',
      position: 'Software Engineer',
      duration: '2019 - 2022',
      description: 'Developed payment infrastructure and dashboard features.'
    },
    {
      company: 'Google',
      position: 'Software Engineering Intern',
      duration: '2017 - 2018',
      description: 'Worked on Chrome DevTools and web performance.'
    },
  ],
  description: 'Passionate full-stack engineer with 6+ years of experience building scalable web applications. Strong background in AI/ML and distributed systems. Led teams of 5+ engineers on mission-critical projects.',
};

export default function CandidateDetailPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to search
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-semibold flex-shrink-0">
              {candidate.name.split(' ').map(n => n[0]).join('')}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{candidate.name}</h1>
                  <p className="text-gray-600 mt-1">{candidate.position}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      {candidate.company}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {candidate.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      {candidate.school} '{candidate.graduationYear.toString().slice(-2)}
                    </span>
                  </div>
                </div>

                {/* Match Score */}
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                  <Star className="w-5 h-5 text-green-600 fill-green-600" />
                  <span className="text-lg font-semibold text-green-700">{candidate.matchScore}%</span>
                  <span className="text-sm text-green-600">match</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap items-center gap-3 mt-6">
                {candidate.linkedin && (
                  <a
                    href={candidate.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {candidate.github && (
                  <a
                    href={candidate.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {candidate.website && (
                  <a
                    href={candidate.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-gray-100">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563eb] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors">
              <Mail className="w-4 h-4" />
              Send Email
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <MessageSquare className="w-4 h-4" />
              Add Note
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed">{candidate.description}</p>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Experience</h2>
              <div className="space-y-6">
                {candidate.experience.map((exp, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{exp.position}</h3>
                      <p className="text-sm text-gray-600">{exp.company}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {exp.duration}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a
                    href={`mailto:${candidate.email}`}
                    className="text-sm text-[#2563eb] hover:underline"
                  >
                    {candidate.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{candidate.location}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Years of Experience</span>
                  <span className="text-sm font-medium text-gray-900">6+ years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Education</span>
                  <span className="text-sm font-medium text-gray-900">Stanford '18</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Current Company</span>
                  <span className="text-sm font-medium text-gray-900">OpenAI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
