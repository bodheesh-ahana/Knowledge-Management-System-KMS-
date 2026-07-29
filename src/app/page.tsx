'use client';

import { Button } from '@/components';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-bold text-white">Knowledge Management System</h1>
          <p className="text-xl text-blue-100">
            Centralized knowledge base and ticket management for application support
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <Button className="px-8 py-3">Get Started</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" className="px-8 py-3">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <Feature
            title="Knowledge Base"
            description="Store and search your organization's knowledge articles"
          />
          <Feature
            title="Ticket Management"
            description="Track and manage support tickets efficiently"
          />
          <Feature
            title="Team Collaboration"
            description="Work together with your team to solve issues faster"
          />
        </div>
      </div>
    </div>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600 mt-2">{description}</p>
    </div>
  );
}
