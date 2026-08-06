'use client';

import AppLayout from '@/components/AppLayout';

export default function AboutPage() {
  return (
    <AppLayout>
      <div className="p-lg max-w-[1200px] mx-auto space-y-2xl">
        {/* Header */}
        <div className="pb-lg border-b border-outline-variant/20">
          <h1 className="font-h1 text-h1 text-on-surface tracking-tight">
            About KMS
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-sm">
            Understanding the importance of Knowledge Management in Application Support
          </p>
        </div>

        {/* Core Purpose */}
        <section className="bg-primary-container dark:bg-primary-container/30 rounded-xl p-xl border border-primary/20">
          <div className="flex items-start gap-md mb-md">
            <span className="material-symbols-outlined text-[32px] text-primary">lightbulb</span>
            <div>
              <h2 className="font-h2 text-h2 text-on-primary-container mb-sm">
                Why KMS Exists
              </h2>
              <p className="font-body-md text-body-md text-on-primary-container leading-relaxed">
                Knowledge Management System (KMS) is designed to solve a critical problem in application support: 
                <strong> knowledge trapped inside engineers' heads</strong>. When a senior engineer is unavailable, 
                recurring issues become blockers. KMS transforms every resolved ticket into searchable, reusable 
                organizational knowledge—ensuring that solutions are never lost and teams become self-sufficient.
              </p>
            </div>
          </div>
        </section>

        {/* The Problem We Solve */}
        <section className="space-y-md">
          <h2 className="font-h2 text-h2 text-on-surface flex items-center gap-sm">
            <span className="material-symbols-outlined text-error">warning</span>
            The Problem We Solve
          </h2>
          <div className="grid md:grid-cols-2 gap-md">
            <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg">
              <h3 className="font-h3 text-h3 text-on-surface mb-sm flex items-center gap-sm">
                <span className="material-symbols-outlined text-error">person_off</span>
                Knowledge Dependency
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Critical knowledge exists only in individual engineers' memories. When they're unavailable, 
                the entire team struggles with issues that have been solved before.
              </p>
            </div>
            <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg">
              <h3 className="font-h3 text-h3 text-on-surface mb-sm flex items-center gap-sm">
                <span className="material-symbols-outlined text-error">repeat</span>
                Repeated Troubleshooting
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Teams waste hours re-solving the same issues repeatedly because there's no centralized 
                repository of past solutions and troubleshooting steps.
              </p>
            </div>
            <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg">
              <h3 className="font-h3 text-h3 text-on-surface mb-sm flex items-center gap-sm">
                <span className="material-symbols-outlined text-error">schedule</span>
                Slow Resolution Times
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Without quick access to proven solutions, engineers spend excessive time researching, 
                experimenting, and escalating issues that could be resolved in minutes.
              </p>
            </div>
            <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg">
              <h3 className="font-h3 text-h3 text-on-surface mb-sm flex items-center gap-sm">
                <span className="material-symbols-outlined text-error">visibility_off</span>
                Lost Tribal Knowledge
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                When engineers leave or move to different teams, their accumulated expertise and 
                problem-solving experience disappears with them.
              </p>
            </div>
          </div>
        </section>

        {/* How KMS Helps */}
        <section className="space-y-md">
          <h2 className="font-h2 text-h2 text-on-surface flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">check_circle</span>
            How KMS Transforms Application Support
          </h2>
          
          {/* Knowledge Base & Articles */}
          <div className="bg-secondary-container dark:bg-secondary-container/30 rounded-xl p-xl border border-secondary/20">
            <div className="flex items-start gap-md">
              <span className="material-symbols-outlined text-[40px] text-secondary">auto_stories</span>
              <div className="flex-1">
                <h3 className="font-h3 text-h3 text-on-secondary-container mb-sm">
                  Knowledge Base & Articles
                </h3>
                <p className="font-body-md text-body-md text-on-secondary-container leading-relaxed mb-md">
                  The heart of KMS is its comprehensive knowledge base where every resolved issue becomes 
                  a searchable article. Instead of asking colleagues "How do I fix this?", engineers can 
                  instantly find documented solutions with symptoms, root causes, troubleshooting steps, 
                  and proven resolutions.
                </p>
                <ul className="space-y-sm">
                  <li className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-[20px] text-secondary mt-0.5">arrow_right</span>
                    <span className="font-body-md text-body-md text-on-secondary-container">
                      <strong>Instant Search:</strong> Find solutions in seconds using application names, 
                      symptoms, error messages, or tags
                    </span>
                  </li>
                  <li className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-[20px] text-secondary mt-0.5">arrow_right</span>
                    <span className="font-body-md text-body-md text-on-secondary-container">
                      <strong>Structured Documentation:</strong> Every article includes symptoms, root cause, 
                      step-by-step troubleshooting, resolution, and prevention tips
                    </span>
                  </li>
                  <li className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-[20px] text-secondary mt-0.5">arrow_right</span>
                    <span className="font-body-md text-body-md text-on-secondary-container">
                      <strong>Linked to Real Tickets:</strong> Each article references actual tickets where 
                      the issue occurred, providing real-world context
                    </span>
                  </li>
                  <li className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-[20px] text-secondary mt-0.5">arrow_right</span>
                    <span className="font-body-md text-body-md text-on-secondary-container">
                      <strong>Version Control & Review:</strong> Articles go through draft, review, and 
                      approval stages ensuring quality and accuracy
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Ticket Tracker */}
          <div className="bg-tertiary-container dark:bg-tertiary-container/30 rounded-xl p-xl border border-tertiary/20">
            <div className="flex items-start gap-md">
              <span className="material-symbols-outlined text-[40px] text-tertiary">confirmation_number</span>
              <div className="flex-1">
                <h3 className="font-h3 text-h3 text-on-tertiary-container mb-sm">
                  Ticket Tracker & History
                </h3>
                <p className="font-body-md text-body-md text-on-tertiary-container leading-relaxed mb-md">
                  KMS maintains a comprehensive ticket repository that goes beyond basic ticket management. 
                  It captures the complete lifecycle of every support request, linking tickets to knowledge 
                  articles and tracking engineer effort, resolution patterns, and recurring issues.
                </p>
                <ul className="space-y-sm">
                  <li className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-[20px] text-tertiary mt-0.5">arrow_right</span>
                    <span className="font-body-md text-body-md text-on-tertiary-container">
                      <strong>Complete Ticket History:</strong> Track every ticket with detailed timeline, 
                      owner, contributors, and resolution time
                    </span>
                  </li>
                  <li className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-[20px] text-tertiary mt-0.5">arrow_right</span>
                    <span className="font-body-md text-body-md text-on-tertiary-container">
                      <strong>Knowledge Article Linking:</strong> Connect tickets to relevant knowledge articles, 
                      building a network of related issues and solutions
                    </span>
                  </li>
                  <li className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-[20px] text-tertiary mt-0.5">arrow_right</span>
                    <span className="font-body-md text-body-md text-on-tertiary-container">
                      <strong>Effort Tracking:</strong> Replace Excel trackers with automated tracking of 
                      engineer hours, work type, and productivity metrics
                    </span>
                  </li>
                  <li className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-[20px] text-tertiary mt-0.5">arrow_right</span>
                    <span className="font-body-md text-body-md text-on-tertiary-container">
                      <strong>Pattern Recognition:</strong> Identify recurring issues, most affected applications, 
                      and opportunities for preventive measures
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Applications We Support */}
        <section className="space-y-md">
          <h2 className="font-h2 text-h2 text-on-surface flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">apps</span>
            Applications We Support
          </h2>
          <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg">
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-md">
              KMS serves as the central knowledge hub for all enterprise applications in our support portfolio. 
              Each application has dedicated documentation, known issues, troubleshooting guides, and server information.
            </p>
            <div className="grid md:grid-cols-3 gap-md mt-lg">
              <div className="bg-surface-container-high rounded-lg p-md">
                <span className="material-symbols-outlined text-[24px] text-primary mb-sm block">business</span>
                <h4 className="font-label-lg text-label-lg text-on-surface mb-xs">Enterprise Applications</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Core business applications including ERP, CRM, financial systems, and custom enterprise solutions
                </p>
              </div>
              <div className="bg-surface-container-high rounded-lg p-md">
                <span className="material-symbols-outlined text-[24px] text-primary mb-sm block">cloud</span>
                <h4 className="font-label-lg text-label-lg text-on-surface mb-xs">Cloud Services</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Cloud-based applications, SaaS platforms, and hybrid infrastructure services
                </p>
              </div>
              <div className="bg-surface-container-high rounded-lg p-md">
                <span className="material-symbols-outlined text-[24px] text-primary mb-sm block">integration_instructions</span>
                <h4 className="font-label-lg text-label-lg text-on-surface mb-xs">Integration Systems</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  APIs, middleware, data integration tools, and interconnected application ecosystems
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Process */}
        <section className="space-y-md">
          <h2 className="font-h2 text-h2 text-on-surface flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">account_tree</span>
            Our Knowledge Management Process
          </h2>
          <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg">
            <div className="space-y-lg">
              {/* Step 1 */}
              <div className="flex items-start gap-md">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-h4 text-h4 text-on-surface mb-xs">Ticket Resolution</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Engineers resolve support tickets using existing knowledge articles or through troubleshooting
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <span className="material-symbols-outlined text-[32px] text-outline">arrow_downward</span>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-md">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-h4 text-h4 text-on-surface mb-xs">Knowledge Capture</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Engineer documents the solution in under 3 minutes: issue, root cause, steps, resolution
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <span className="material-symbols-outlined text-[32px] text-outline">arrow_downward</span>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-md">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-h4 text-h4 text-on-surface mb-xs">Review & Approval</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Team leads or senior engineers review and approve articles for accuracy and completeness
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <span className="material-symbols-outlined text-[32px] text-outline">arrow_downward</span>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-md">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-h4 text-h4 text-on-surface mb-xs">Searchable Forever</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Published article becomes instantly searchable by the entire team, reducing future resolution time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="space-y-md">
          <h2 className="font-h2 text-h2 text-on-surface flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">trending_up</span>
            Key Benefits
          </h2>
          <div className="grid md:grid-cols-2 gap-md">
            <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-[24px] text-primary">speed</span>
                <h3 className="font-h3 text-h3 text-on-surface">Faster Resolution</h3>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Reduce resolution time from hours to minutes by finding proven solutions instantly
              </p>
            </div>
            <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-[24px] text-primary">groups</span>
                <h3 className="font-h3 text-h3 text-on-surface">Team Independence</h3>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Any engineer can resolve issues without depending on specific team members
              </p>
            </div>
            <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-[24px] text-primary">school</span>
                <h3 className="font-h3 text-h3 text-on-surface">Continuous Learning</h3>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                New team members learn faster by accessing the collective knowledge of experienced engineers
              </p>
            </div>
            <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-[24px] text-primary">insights</span>
                <h3 className="font-h3 text-h3 text-on-surface">Data-Driven Insights</h3>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Identify patterns, recurring issues, and opportunities for preventive measures and automation
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-primary text-on-primary rounded-xl p-xl text-center">
          <h2 className="font-h2 text-h2 mb-md">Start Building Knowledge Today</h2>
          <p className="font-body-lg text-body-lg mb-lg max-w-[600px] mx-auto">
            Every ticket you resolve is an opportunity to create lasting organizational knowledge. 
            Document your solutions and help the entire team work smarter.
          </p>
          <div className="flex items-center justify-center gap-md">
            <a
              href="/knowledge/create"
              className="inline-flex items-center gap-sm bg-on-primary text-primary px-lg py-md rounded-lg font-label-lg text-label-lg hover:bg-on-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
              Create Knowledge Article
            </a>
            <a
              href="/knowledge"
              className="inline-flex items-center gap-sm bg-transparent border-2 border-on-primary text-on-primary px-lg py-md rounded-lg font-label-lg text-label-lg hover:bg-on-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined">search</span>
              Browse Knowledge Base
            </a>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
