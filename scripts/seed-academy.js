require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Define schemas inline
const LearningApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: String,
  color: { type: String, default: '#3b82f6' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const LearningModuleSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningApplication', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const LearningLessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningModule', required: true },
  title: { type: String, required: true },
  objective: { type: String, required: true },
  businessPurpose: String,
  concepts: [String],
  content: { type: String, required: true },
  importantNotes: [String],
  commonMistakes: [String],
  relatedKBIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeArticle' }],
  practicalExercise: {
    title: String,
    instructions: [String],
    requiresScreenshot: { type: Boolean, default: false },
  },
  quiz: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
    }],
  },
  order: { type: Number, default: 0 },
  estimatedDuration: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Create models
const LearningApplication = mongoose.model('LearningApplication', LearningApplicationSchema);
const LearningModule = mongoose.model('LearningModule', LearningModuleSchema);
const LearningLesson = mongoose.model('LearningLesson', LearningLessonSchema);

async function seedAcademyData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if Academy already exists
    const existingAcademy = await LearningApplication.findOne({ name: 'Application Support Academy' });
    if (existingAcademy) {
      console.log('Application Support Academy already exists. Updating lessons with quizzes...');
      const academyApplicationId = existingAcademy._id;
      
      // List all modules for debugging
      const allModules = await LearningModule.find({ applicationId: academyApplicationId });
      console.log('Found modules:', allModules.map(m => ({ name: m.name, _id: m._id })));
      
      // Get Module 1
      const module1 = await LearningModule.findOne({ applicationId: academyApplicationId, name: 'Level 1: Support Fundamentals' });
      if (module1) {
        const module1Id = module1._id;
        
        // Check if VIP User Management lesson exists, if not add it
        const existingVipLesson = await LearningLesson.findOne({ moduleId: module1Id, title: 'VIP User Management' });
        if (!existingVipLesson) {
          await LearningLesson.create({
            moduleId: module1Id,
            title: 'VIP User Management',
            objective: 'Understand VIP user handling requirements and SLA implications',
            businessPurpose: 'VIP users require special handling to maintain critical business relationships and prevent escalations.',
            concepts: [
              'VIP identification',
              'Priority escalation',
              'SLA compliance',
              'Communication protocols',
              'Escalation procedures',
            ],
            content: `VIP User Management:

Who Are VIP Users?

VIP users are critical customers who require special handling due to their business importance, revenue contribution, or strategic relationship. Any service disruption or missed SLA for these users can result in immediate escalation and significant business impact.

VIP Identification:

VIP users are identified by:
- Company name or account designation
- Specific user flags in the system
- Pre-defined VIP customer list
- Revenue tier or contract level

Always verify if a ticket is from a VIP user before assigning priority.

VIP Ticket Handling Rules:

1. Automatic P1 Priority
- ALL VIP tickets are automatically P1 (Critical)
- Do not assess severity based on issue type
- VIP status overrides standard priority assessment
- Immediate attention required

2. Response SLA
- 15-minute response time (same as P1)
- Immediate acknowledgment required
- First response must be professional and reassuring
- Do not delay response for investigation

3. Resolution SLA
- 4-hour resolution time (same as P1)
- No extensions allowed
- If resolution is not possible, escalate immediately
- Keep customer updated every 30 minutes

4. Communication Requirements
- Proactive updates every 30 minutes
- Always provide next steps and timeline
- Never leave VIP customer without communication
- Use professional, empathetic tone

5. Escalation Protocol
- Any SLA breach triggers automatic escalation
- Escalate to manager immediately if resolution is uncertain
- Document all communication and actions
- Prepare escalation summary before escalation

VIP-Specific Procedures:

Before Working on VIP Ticket:

1. Verify VIP Status
- Check customer account
- Confirm VIP designation
- Review VIP history if available
- Note any special requirements

2. Assign Priority
- Set priority to P1 immediately
- Do not downgrade under any circumstances
- Mark ticket as VIP in system
- Notify team lead if needed

3. Initial Response
- Acknowledge within 15 minutes
- Express understanding of urgency
- Provide initial assessment
- Set clear expectations

During Resolution:

1. Continuous Updates
- Update every 30 minutes minimum
- Even if no progress, communicate status
- Explain what is being done
- Provide revised timeline if needed

2. Resource Allocation
- Prioritize VIP tickets above all others
- Assign senior engineers if available
- Dedicate focused attention
- Minimize context switching

3. Documentation
- Document every action taken
- Track time spent
- Note any workarounds used
- Prepare for potential escalation

After Resolution:

1. Verification
- Verify resolution with customer
- Ensure complete satisfaction
- Test if applicable
- Confirm no residual issues

2. Follow-up
- Send follow-up communication
- Check back within 24 hours
- Document for future reference
- Update VIP history

3. Review
- Review handling with team
- Identify improvement opportunities
- Update procedures if needed
- Share learnings

Common Mistakes to Avoid:

1. Treating VIP as Standard Ticket
- Never apply standard priority rules
- Always assume highest urgency
- Do not assess based on issue severity
- VIP status is the priority

2. Delaying Communication
- Do not wait for complete information
- Communicate what you know
- Provide timeline even if tentative
- Silence is unacceptable for VIP

3. Missing SLA
- SLA breach triggers automatic escalation
- Escalate before SLA breach if uncertain
- Do not hope for last-minute resolution
- Better to escalate early than miss SLA

4. Inadequate Documentation
- VIP tickets require complete documentation
- Every action must be recorded
- Escalation requires detailed history
- Future reference depends on documentation

5. Assuming Resolution
- Verify with customer before closing
- Test if possible
- Confirm satisfaction
- Follow up after closure

VIP Communication Templates:

Initial Response:
"Thank you for contacting support. I understand this is urgent and I am prioritizing your ticket immediately. I am currently investigating and will provide an update within 30 minutes."

Progress Update:
"I am working on your issue and have [progress made]. I expect to have a resolution by [time]. I will update you again in 30 minutes regardless of progress."

Escalation Notice:
"Due to the complexity of this issue, I am escalating to our senior team to ensure the fastest possible resolution. You will hear from them within [time]."

Resolution:
"I have resolved your issue by [solution]. Please verify that this addresses your concern. I will follow up with you tomorrow to ensure everything is working correctly."

Consequences of VIP SLA Breach:

1. Immediate Escalation
- Automatic manager notification
- Possible director involvement
- Account manager notification
- Customer executive notification

2. Business Impact
- Potential contract penalties
- Relationship damage
- Revenue risk
- Reputation impact

3. Internal Consequences
- Performance review impact
- Process review
- Training requirements
- Possible disciplinary action

Best Practices:

1. Over-Communicate
- More communication is better than less
- Provide updates even with no progress
- Set and manage expectations
- Be transparent about challenges

2. Escalate Early
- Do not wait until SLA breach
- Escalate if uncertain about resolution
- Provide escalation summary
- Document escalation rationale

3. Prioritize Ruthlessly
- VIP tickets take precedence
- Pause non-critical work
- Dedicate focused attention
- Minimize distractions

4. Document Everything
- Every action, every communication
- Time tracking for review
- Prepare for escalation proactively
- Build VIP history

5. Learn and Improve
- Review every VIP ticket handling
- Identify improvement areas
- Update procedures based on learnings
- Share with team

Summary:

VIP users are critical to our business and require special handling. All VIP tickets are P1 with 15-minute response and 4-hour resolution SLAs. Any SLA breach triggers automatic escalation. Over-communicate, escalate early, prioritize ruthlessly, document everything, and continuously improve based on learnings.`,
            importantNotes: [
              'ALL VIP tickets are automatically P1 regardless of issue severity',
              '15-minute response SLA - acknowledge immediately',
              '4-hour resolution SLA - escalate if uncertain',
              'Update VIP customers every 30 minutes minimum',
              'Any SLA breach triggers automatic escalation',
              'Verify VIP status before assigning priority',
              'Over-communicate - silence is unacceptable for VIP',
              'Document every action and communication',
            ],
            commonMistakes: [
              'Treating VIP tickets as standard tickets',
              'Delaying communication until investigation complete',
              'Waiting until SLA breach to escalate',
              'Inadequate documentation of VIP ticket handling',
              'Assuming resolution without customer verification',
              'Downgrading VIP ticket priority',
              'Not updating customer regularly',
            ],
            estimatedDuration: 20,
            order: 5,
            isActive: true,
            quiz: {
              questions: [
                {
                  question: 'What priority should ALL VIP tickets be assigned?',
                  options: [
                    'P4 (Low)',
                    'P3 (Medium)',
                    'P2 (High)',
                    'P1 (Critical) - automatically, regardless of issue severity'
                  ],
                  correctAnswer: 3
                },
                {
                  question: 'What is the response SLA for VIP tickets?',
                  options: [
                    '30 minutes',
                    '15 minutes',
                    '1 hour',
                    '2 hours'
                  ],
                  correctAnswer: 1
                },
                {
                  question: 'What happens if a VIP ticket SLA is breached?',
                  options: [
                    'Nothing special',
                    'Customer is notified next day',
                    'Automatic escalation to management and account manager',
                    'Ticket is closed'
                  ],
                  correctAnswer: 2
                },
                {
                  question: 'How often should you update VIP customers?',
                  options: [
                    'Only when resolution is complete',
                    'Once per day',
                    'Every 30 minutes minimum, even if no progress',
                    'Only when they ask for updates'
                  ],
                  correctAnswer: 2
                },
                {
                  question: 'When should you escalate a VIP ticket?',
                  options: [
                    'Never',
                    'Only after SLA breach',
                    'Before SLA breach if resolution is uncertain',
                    'Only if customer asks'
                  ],
                  correctAnswer: 2
                }
              ]
            }
          });
          console.log('Created VIP User Management lesson');
        }
        
        // Update lessons with quizzes
        const lessons = await LearningLesson.find({ moduleId: module1Id });
        
        for (const lesson of lessons) {
          if (lesson.title === 'What is Application Support?') {
            await LearningLesson.findByIdAndUpdate(lesson._id, {
              quiz: {
                questions: [
                  {
                    question: 'What is the key difference between a Developer and an Application Support Engineer?',
                    options: [
                      'There is no difference',
                      'Developers build applications, Support Engineers help end users',
                      'Support Engineers write code, Developers fix bugs',
                      'Developers work with customers, Support Engineers work with code'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'What is the correct support mindset for troubleshooting?',
                    options: [
                      'Google → Try random fixes → Solve',
                      'Identify → Classify → Verify → Search KB → Troubleshoot → Resolve → Document',
                      'Ask for help immediately',
                      'Try the first solution that comes to mind'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'Which of the following is NOT a characteristic of an Application Support Engineer?',
                    options: [
                      'Focuses on issue resolution',
                      'Troubleshoots from user perspective',
                      'Debugs from source code',
                      'Immediate ticket resolution focus'
                    ],
                    correctAnswer: 2
                  },
                  {
                    question: 'What is the primary focus of an OEM (Original Equipment Manufacturer)?',
                    options: [
                      'End user support',
                      'Application vendor support with source code access',
                      'Infrastructure management',
                      'Customer relationship management'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'Why is documentation important in application support?',
                    options: [
                      'It is not important',
                      'Only for compliance purposes',
                      'Every ticket should produce knowledge to prevent repeated work',
                      'Only for billing purposes'
                    ],
                    correctAnswer: 2
                  }
                ]
              }
            });
            console.log('Updated quiz for: What is Application Support?');
          }
          
          if (lesson.title === 'Ticket Lifecycle') {
            await LearningLesson.findByIdAndUpdate(lesson._id, {
              quiz: {
                questions: [
                  {
                    question: 'What is the first step in the ticket lifecycle?',
                    options: [
                      'Search KB',
                      'Ticket Received',
                      'Acknowledge User',
                      'Close Ticket'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'When should you search the Knowledge Base?',
                    options: [
                      'After trying all possible fixes',
                      'Before starting troubleshooting',
                      'Only when the customer asks',
                      'Never, Google is better'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'What should you do before closing a ticket?',
                    options: [
                      'Nothing, just close it',
                      'Verify resolution with customer',
                      'Ask the customer to close it',
                      'Wait 24 hours'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'Which step comes before "Escalate if Required"?',
                    options: [
                      'Close Ticket',
                      'Collect Logs',
                      'Try Known Fix',
                      'Document Resolution'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'Why is the acknowledgement phase critical?',
                    options: [
                      'It is not critical',
                      'Only for SLA compliance',
                      'Sets customer expectations and starts SLA timer',
                      'Just to be polite'
                    ],
                    correctAnswer: 2
                  }
                ]
              }
            });
            console.log('Updated quiz for: Ticket Lifecycle');
          }
          
          if (lesson.title === 'Communication Best Practices') {
            await LearningLesson.findByIdAndUpdate(lesson._id, {
              quiz: {
                questions: [
                  {
                    question: 'What is the golden rule of communication in support?',
                    options: [
                      'Always be formal',
                      'Never disappear - always update the customer',
                      'Only communicate when you have a solution',
                      'Use technical language to show expertise'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'What should you do if you cannot meet the resolution SLA?',
                    options: [
                      'Nothing, just work harder',
                      'Communicate early, explain the delay, provide new timeline',
                      'Escalate immediately',
                      'Ignore the SLA'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'Why is communication MORE important than resolution?',
                    options: [
                      'It is not more important',
                      'Only for customer satisfaction surveys',
                      'Regular updates prevent SLA breaches and manage expectations',
                      'Resolution is always more important'
                    ],
                    correctAnswer: 2
                  },
                  {
                    question: 'What is the best approach to expectation setting?',
                    options: [
                      'Under-promise, over-deliver',
                      'Over-promise to impress the customer',
                      'Never make promises',
                      'Promise the fastest possible time'
                    ],
                    correctAnswer: 0
                  },
                  {
                    question: 'When should you use communication templates?',
                    options: [
                      'Never, they are too impersonal',
                      'Only for escalations',
                      'For consistency in common scenarios',
                      'Only when you are busy'
                    ],
                    correctAnswer: 2
                  }
                ]
              }
            });
            console.log('Updated quiz for: Communication Best Practices');
          }
          
          if (lesson.title === 'SLA and Priority Management') {
            await LearningLesson.findByIdAndUpdate(lesson._id, {
              quiz: {
                questions: [
                  {
                    question: 'What is the response SLA for a P1 (Critical) ticket?',
                    options: [
                      '30 minutes',
                      '15 minutes',
                      '2 hours',
                      '4 hours'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'What is the resolution SLA for a P2 (High) ticket?',
                    options: [
                      '4 hours',
                      '8 hours',
                      '24 hours',
                      '72 hours'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'What should you do if you cannot meet the resolution SLA?',
                    options: [
                      'Nothing, just work harder',
                      'Communicate early, explain delay, provide new timeline',
                      'Escalate immediately without communication',
                      'Ignore the SLA'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'Which priority level has the longest resolution SLA?',
                    options: [
                      'P1',
                      'P2',
                      'P3',
                      'P4'
                    ],
                    correctAnswer: 3
                  },
                  {
                    question: 'What is the first consequence of an SLA breach?',
                    options: [
                      'Penalty',
                      'Manager escalation',
                      'Client dissatisfaction',
                      'Contract renewal risk'
                    ],
                    correctAnswer: 1
                  }
                ]
              }
            });
            console.log('Updated quiz for: SLA and Priority Management');
          }
        }
      }
      
      // Get Module 6 (Daily Learning Routine)
      const module6 = await LearningModule.findOne({ applicationId: academyApplicationId, name: 'Daily Learning Routine' });
      if (module6) {
        const module6Id = module6._id;
        
        // Update the Daily Learning Routine lesson
        const lesson = await LearningLesson.findOne({ moduleId: module6Id, title: '30-Minute Daily Learning Routine' });
        if (lesson) {
          await LearningLesson.findByIdAndUpdate(lesson._id, {
            title: 'Continuous Learning and Knowledge Sharing',
            objective: 'Learn strategies for continuous skill development and effective knowledge sharing in support teams',
            businessPurpose: 'Continuous learning prevents skill stagnation and ensures the team stays current with evolving applications and issues.',
            concepts: [
              'Learning from tickets',
              'Knowledge sharing culture',
              'Personal development',
              'Team learning',
              'Skill retention',
            ],
            content: `Continuous Learning and Knowledge Sharing:

Why Continuous Learning Matters:

In application support, technology and applications are constantly evolving. Without continuous learning, skills stagnate and resolution times increase. The most successful support engineers have a systematic approach to learning.

The Learning Cycle:

1. Experience
- Handle real tickets
- Encounter new issues
- Work with different applications

2. Reflect
- What did I learn?
- What could I do better?
- What patterns do I see?

3. Document
- Create KB articles
- Update documentation
- Share with team

4. Share
- Present to team
- Mentor others
- Build collective knowledge

5. Apply
- Use knowledge in future tickets
- Improve resolution times
- Reduce escalations

Learning from Tickets:

Every ticket is a learning opportunity. Instead of just solving and moving on, extract the learning:

After resolving a ticket, ask:
- Was this a known issue?
- If not, should it be documented?
- What pattern does this fit?
- Could this have been resolved faster?
- What did I learn that applies to other tickets?

Knowledge Sharing Culture:

A strong support team shares knowledge freely. Benefits include:
- Faster resolution times for everyone
- Reduced dependency on individuals
- Better onboarding for new team members
- Higher team morale
- Less burnout from repeated issues

Ways to Share Knowledge:

1. Documentation
- Create KB articles
- Update existing documentation
- Add comments to tickets
- Share resolution summaries

2. Presentations
- Weekly ticket reviews
- New issue walkthroughs
- Application feature demos
- Troubleshooting technique sharing

3. Mentoring
- Pair with less experienced engineers
- Explain your thought process
- Share troubleshooting tips
- Provide feedback

4. Collaboration
- Discuss complex tickets
- Brainstorm solutions together
- Review each other's work
- Learn from different approaches

Personal Development Strategies:

Set Learning Goals:
- Master one new application feature per week
- Learn one new troubleshooting technique per month
- Contribute one KB article per week
- Present one ticket review per month

Track Your Progress:
- Resolution time trends
- KB articles created
- New skills learned
- Tickets resolved without escalation

Build Your Knowledge Base:
- Keep personal notes on common issues
- Bookmark useful resources
- Create cheat sheets for complex procedures
- Maintain a list of go-to solutions

Overcoming Learning Barriers:

Common barriers:
- "Too busy to learn"
- "I'll remember it"
- "Someone else already knows this"
- "Documentation takes too long"

Solutions:
- Schedule dedicated learning time
- Document immediately while fresh
- Share even if others know it
- Use templates to speed up documentation

Building a Learning Culture:

Leaders should:
- Model learning behavior
- Allocate time for learning
- Recognize knowledge sharing
- Provide learning resources
- Celebrate team improvements

Team members should:
- Share freely without hesitation
- Ask questions openly
- Give and receive feedback
- Help others learn
- Contribute to collective knowledge

Measuring Learning Impact:

Track these metrics:
- Average resolution time (should decrease)
- First-contact resolution rate (should increase)
- KB article usage (should increase)
- Escalation rate (should decrease)
- Team satisfaction (should increase)

Continuous Improvement:

Regularly assess:
- What are we learning?
- Are we sharing effectively?
- What gaps exist in our knowledge?
- How can we learn better?

Adjust your approach based on what works for your team.`,
            importantNotes: [
              'Every ticket should produce knowledge',
              'Share knowledge immediately, don\'t hoard it',
              'Learning is a team sport, not individual',
              'Document while it\'s fresh in your mind',
              'Consistency beats intensity - learn a little every day',
            ],
            commonMistakes: [
              'Solving tickets without documenting',
              'Keeping knowledge to yourself',
              'Thinking you\'ll remember everything',
              'Not allocating time for learning',
              'Only learning when forced to',
            ],
            estimatedDuration: 25,
            quiz: {
              questions: [
                {
                  question: 'Why is continuous learning important in application support?',
                  options: [
                    'It is not important',
                    'Only for career advancement',
                    'Applications and technology constantly evolve, preventing skill stagnation',
                    'Only required for new employees'
                  ],
                  correctAnswer: 2
                },
                {
                  question: 'What should you do immediately after resolving a ticket?',
                  options: [
                    'Move to the next ticket',
                    'Take a break',
                    'Extract learning: Was it known? Should it be documented? What patterns exist?',
                    'Forget about it'
                  ],
                  correctAnswer: 2
                },
                {
                  question: 'What is a benefit of a strong knowledge sharing culture?',
                  options: [
                    'Increased workload',
                    'Faster resolution times for everyone',
                    'More competition between team members',
                    'Less job security'
                  ],
                  correctAnswer: 1
                },
                {
                  question: 'How often should you contribute to the team knowledge base?',
                  options: [
                    'Never',
                    'Only when asked',
                    'Regularly - every ticket should produce knowledge',
                    'Once a year'
                  ],
                  correctAnswer: 2
                },
                {
                  question: 'What is the best approach to learning in a support environment?',
                  options: [
                    'Learn everything at once during training',
                    'Consistency beats intensity - learn a little every day',
                    'Only learn when you encounter a problem',
                    'Wait for management to provide training'
                  ],
                  correctAnswer: 1
                }
              ]
            }
          });
          console.log('Updated lesson: Continuous Learning and Knowledge Sharing');
        }
      }
      
      // Get Module 2 (Common Support Methodology)
      const module2 = await LearningModule.findOne({ applicationId: academyApplicationId, name: 'Level 2: Common Support Methodology' });
      if (module2) {
        const module2Id = module2._id;
        const lessons = await LearningLesson.find({ moduleId: module2Id });
        console.log('Found lessons in Module 2:', lessons.map(l => l.title));
        
        for (const lesson of lessons) {
          if (lesson.title === 'Universal Application Concepts') {
            await LearningLesson.findByIdAndUpdate(lesson._id, {
              quiz: {
                questions: [
                  {
                    question: 'Why is it important to learn universal application concepts?',
                    options: [
                      'It is not important',
                      'So you can work on any application using the same methodology',
                      'Only for certification purposes',
                      'To impress management'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'What percentage of troubleshooting is the same across different applications?',
                    options: [
                      '10%',
                      '50%',
                      '80%',
                      '100%'
                    ],
                    correctAnswer: 2
                  },
                  {
                    question: 'Which concept exists in almost every application?',
                    options: [
                      'Only database',
                      'Login/authentication, permissions, logs, configuration',
                      'Only printing',
                      'Only licensing'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'What is the benefit of learning universal concepts once?',
                    options: [
                      'No benefit',
                      'You can apply them to any application',
                      'Only helps with one application',
                      'Wastes time'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'Which of these is NOT a universal application concept?',
                    options: [
                      'Login and authentication',
                      'Database and data storage',
                      'Application-specific proprietary features',
                      'Logs and diagnostics'
                    ],
                    correctAnswer: 2
                  }
                ]
              }
            });
            console.log('Updated quiz for: Universal Application Concepts');
          }
        }
      }
      
      // Get Module 2 (Tier-1 Decision Tree)
      const moduleTier1 = await LearningModule.findOne({ applicationId: academyApplicationId, name: 'Level 2: Tier-1 Decision Tree' });
      if (moduleTier1) {
        const moduleTier1Id = moduleTier1._id;
        const lessons = await LearningLesson.find({ moduleId: moduleTier1Id });
        console.log('Found lessons in Tier-1 Decision Tree:', lessons.map(l => l.title));
        
        for (const lesson of lessons) {
          if (lesson.title === 'Tier-1 Decision Tree') {
            await LearningLesson.findByIdAndUpdate(lesson._id, {
              quiz: {
                questions: [
                  {
                    question: 'What should a support engineer do FIRST when a ticket arrives?',
                    options: [
                      'Google the error',
                      'Follow the decision tree: Identify application',
                      'Ask for help',
                      'Close the ticket'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'When should you search the Knowledge Base?',
                    options: [
                      'After trying everything else',
                      'Before Google, as the first step in the decision tree',
                      'Never',
                      'Only for complex issues'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'What should you do if no KB article exists for the issue?',
                    options: [
                      'Give up',
                      'Search GPT/Google, verify solutions, document findings',
                      'Escalate immediately',
                      'Tell customer it cannot be fixed'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'What is the final step in the decision tree?',
                    options: [
                      'Close ticket',
                      'Create KB article from the resolution',
                      'Escalate',
                      'Take a break'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'Why should the decision tree become muscle memory?',
                    options: [
                      'It should not',
                      'To ensure consistent, efficient troubleshooting',
                      'Only for new employees',
                      'Management requires it'
                    ],
                    correctAnswer: 1
                  }
                ]
              }
            });
            console.log('Updated quiz for: Tier-1 Decision Tree');
          }
        }
      }
      
      // Get Module 2 (Top 50 Issues)
      const moduleTop50 = await LearningModule.findOne({ applicationId: academyApplicationId, name: 'Level 2: Top 50 Issues' });
      if (moduleTop50) {
        const moduleTop50Id = moduleTop50._id;
        const lessons = await LearningLesson.find({ moduleId: moduleTop50Id });
        console.log('Found lessons in Top 50 Issues:', lessons.map(l => l.title));
        
        for (const lesson of lessons) {
          if (lesson.title === 'Top 50 Issues Program') {
            await LearningLesson.findByIdAndUpdate(lesson._id, {
              quiz: {
                questions: [
                  {
                    question: 'What percentage of tickets do the Top 50 issues typically cover?',
                    options: [
                      '10-20%',
                      '30-40%',
                      '70-80%',
                      '100%'
                    ],
                    correctAnswer: 2
                  },
                  {
                    question: 'Why focus on Top 50 issues instead of learning everything?',
                    options: [
                      'It is easier',
                      'High-impact approach that covers most tickets',
                      'Management said so',
                      'Other issues are not important'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'How often should the Top 50 list be updated?',
                    options: [
                      'Never',
                      'Once a year',
                      'Monthly to reflect current recurring issues',
                      'Daily'
                    ],
                    correctAnswer: 2
                  },
                  {
                    question: 'What is the first step in creating a Top 50 list?',
                    options: [
                      'Guess the issues',
                      'Analyze ticket history to identify recurring issues',
                      'Ask customers',
                      'Use random selection'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'What is the expected result of mastering Top 50 issues?',
                    options: [
                      'No change',
                      'Ticket handling speed doubles',
                      'More escalations',
                      'Worse customer satisfaction'
                    ],
                    correctAnswer: 1
                  }
                ]
              }
            });
            console.log('Updated quiz for: Top 50 Issues Program');
          }
        }
      }
      
      // Get Module 3 (Advanced Skills)
      const module3 = await LearningModule.findOne({ applicationId: academyApplicationId, name: 'Level 3: Advanced Skills' });
      if (module3) {
        const module3Id = module3._id;
        const lessons = await LearningLesson.find({ moduleId: module3Id });
        console.log('Found lessons in Advanced Skills:', lessons.map(l => l.title));
        
        for (const lesson of lessons) {
          if (lesson.title === 'Root Cause Analysis') {
            await LearningLesson.findByIdAndUpdate(lesson._id, {
              quiz: {
                questions: [
                  {
                    question: 'What is the purpose of Root Cause Analysis (RCA)?',
                    options: [
                      'To fix symptoms quickly',
                      'To identify underlying causes and prevent recurrence',
                      'To blame someone',
                      'To document for compliance'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'How many times should you ask "Why?" in the 5 Whys technique?',
                    options: [
                      'Once',
                      'Three times',
                      'Five times',
                      'Until you get the answer you want'
                    ],
                    correctAnswer: 2
                  },
                  {
                    question: 'What are the categories in a Fishbone (Ishikawa) diagram?',
                    options: [
                      'Good, Bad, Ugly',
                      'People, Process, Technology, Environment, Materials, Management',
                      'Alpha, Beta, Gamma',
                      'Past, Present, Future'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'What is a common mistake in RCA?',
                    options: [
                      'Asking too many questions',
                      'Stopping at surface-level causes instead of root cause',
                      'Documenting findings',
                      'Involving the team'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'Why is RCA important for support teams?',
                    options: [
                      'It is not important',
                      'Prevents issue recurrence and improves system reliability',
                      'Only for complex issues',
                      'Management requires it'
                    ],
                    correctAnswer: 1
                  }
                ]
              }
            });
            console.log('Updated quiz for: Root Cause Analysis');
          }
          
          if (lesson.title === 'Knowledge Creation') {
            await LearningLesson.findByIdAndUpdate(lesson._id, {
              quiz: {
                questions: [
                  {
                    question: 'What should happen after every ticket resolution?',
                    options: [
                      'Nothing',
                      'Move to next ticket',
                      'Convert resolution to KB article',
                      'Delete the ticket'
                    ],
                    correctAnswer: 2
                  },
                  {
                    question: 'What is the first section of a KB article?',
                    options: [
                      'Resolution steps',
                      'Title with application name and error/symptom',
                      'Root cause',
                      'Prevention'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'Why is tagging KB articles important?',
                    options: [
                      'It is not important',
                      'For easy search and categorization',
                      'Only for statistics',
                      'Management requires it'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'What is the "Clarity" standard for KB documentation?',
                    options: [
                      'Use technical jargon',
                      'Write as much as possible',
                      'Use simple, clear language and include examples',
                      'Write for experts only'
                    ],
                    correctAnswer: 2
                  },
                  {
                    question: 'What is the expected result of good knowledge creation?',
                    options: [
                      'More work',
                      'Reduced resolution time and higher first-contact resolution',
                      'Worse documentation',
                      'No change'
                    ],
                    correctAnswer: 1
                  }
                ]
              }
            });
            console.log('Updated quiz for: Knowledge Creation');
          }
          
          if (lesson.title === 'OEM Collaboration') {
            await LearningLesson.findByIdAndUpdate(lesson._id, {
              quiz: {
                questions: [
                  {
                    question: 'When should you escalate to OEM?',
                    options: [
                      'Immediately for every issue',
                      'Only after completing initial troubleshooting and gathering information',
                      'Never',
                      'When you feel like it'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'What should you do BEFORE escalating to OEM?',
                    options: [
                      'Nothing',
                      'Complete troubleshooting, gather logs, document steps taken',
                      'Just call them',
                      'Email them immediately'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'What is Level 2 OEM support?',
                    options: [
                      'Email/ticket submission',
                      'Phone escalation with faster response',
                      'Direct engineer contact',
                      'No support available'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'What should you include in an OEM escalation ticket?',
                    options: [
                      'Just the error message',
                      'Application version, error, reproduction steps, troubleshooting taken, impact',
                      'Only customer name',
                      'Nothing, let them figure it out'
                    ],
                    correctAnswer: 1
                  },
                  {
                    question: 'What should you do after OEM provides a resolution?',
                    options: [
                      'Nothing',
                      'Document OEM resolution, create KB article, share with team',
                      'Forget about it',
                      'Only tell the customer'
                    ],
                    correctAnswer: 1
                  }
                ]
              }
            });
            console.log('Updated quiz for: OEM Collaboration');
          }
        }
      }
      
      console.log('✅ Academy lessons updated with quizzes!');
      await mongoose.disconnect();
      return;
    }

    console.log('Starting Application Support Academy seed...');

    // Application Support Academy
    const academyApplication = await LearningApplication.create({
      name: 'Application Support Academy',
      description: 'Comprehensive training program to build application support engineering mindset and skills',
      icon: 'school',
      color: '#9c27b0',
      order: 0,
      isActive: true,
    });
    const academyApplicationId = academyApplication._id;
    console.log('Created Application Support Academy:', academyApplicationId);

    // Level 1: Support Fundamentals
    const academyModule1 = await LearningModule.create({
      applicationId: academyApplicationId,
      name: 'Level 1: Support Fundamentals',
      description: 'Foundation training for application support engineers - mindset, processes, and communication',
      order: 1,
      isActive: true,
    });
    const academyModule1Id = academyModule1._id;
    console.log('Created Academy Module 1:', academyModule1Id);

    await LearningLesson.create([
      {
        moduleId: academyModule1Id,
        title: 'What is Application Support?',
        objective: 'Understand the difference between application support, development, infrastructure, and OEM roles',
        businessPurpose: 'Understanding the support role is critical for proper ticket handling and customer expectations.',
        concepts: [
          'Developer vs Support Engineer',
          'Infrastructure vs Application Support',
          'OEM vs Internal Support',
          'Customer perspective',
          'Support mindset',
        ],
        content: `What is Application Support?

Key Differences:

Developer:
- Builds and maintains applications
- Focuses on code and features
- Debugs from source code
- Long-term project focus

Application Support Engineer:
- Supports end users of applications
- Focuses on issue resolution
- Troubleshoots from user perspective
- Immediate ticket resolution focus

Infrastructure Engineer:
- Manages servers, networks, databases
- Focuses on system health
- Monitors performance metrics
- Proactive maintenance

OEM (Original Equipment Manufacturer):
- Application vendor support
- Has access to source code
- Provides patches and updates
- Escalation point for complex issues

Customer:
- End user of the application
- Expects quick resolution
- May not understand technical details
- Business impact is their priority

Support Mindset:
Instead of thinking like a developer (Google → Try random fixes → Solve), a support engineer should think:

Identify → Classify → Verify → Search KB → Troubleshoot → Resolve → Document

This structured approach ensures:
- Consistent problem-solving
- Knowledge retention
- Faster resolution times
- Better customer communication`,
        importantNotes: [
          'Support is not development - different mindset required',
          'Customer experience is priority #1',
          'Communication is as important as technical resolution',
          'Every ticket should produce knowledge',
        ],
        commonMistakes: [
          'Approaching tickets like a developer',
          'Going straight to Google without structured analysis',
          'Not communicating with customers during troubleshooting',
          'Not documenting resolutions for future use',
        ],
        estimatedDuration: 20,
        order: 1,
        isActive: true,
        quiz: {
          questions: [
            {
              question: 'What is the key difference between a Developer and an Application Support Engineer?',
              options: [
                'There is no difference',
                'Developers build applications, Support Engineers help end users',
                'Support Engineers write code, Developers fix bugs',
                'Developers work with customers, Support Engineers work with code'
              ],
              correctAnswer: 1
            },
            {
              question: 'What is the correct support mindset for troubleshooting?',
              options: [
                'Google → Try random fixes → Solve',
                'Identify → Classify → Verify → Search KB → Troubleshoot → Resolve → Document',
                'Ask for help immediately',
                'Try the first solution that comes to mind'
              ],
              correctAnswer: 1
            },
            {
              question: 'Which of the following is NOT a characteristic of an Application Support Engineer?',
              options: [
                'Focuses on issue resolution',
                'Troubleshoots from user perspective',
                'Debugs from source code',
                'Immediate ticket resolution focus'
              ],
              correctAnswer: 2
            },
            {
              question: 'What is the primary focus of an OEM (Original Equipment Manufacturer)?',
              options: [
                'End user support',
                'Application vendor support with source code access',
                'Infrastructure management',
                'Customer relationship management'
              ],
              correctAnswer: 1
            },
            {
              question: 'Why is documentation important in application support?',
              options: [
                'It is not important',
                'Only for compliance purposes',
                'Every ticket should produce knowledge to prevent repeated work',
                'Only for billing purposes'
              ],
              correctAnswer: 2
            }
          ]
        }
      },
      {
        moduleId: academyModule1Id,
        title: 'Ticket Lifecycle',
        objective: 'Learn the complete ticket handling process from receipt to closure',
        businessPurpose: 'Following the ticket lifecycle ensures consistent, high-quality support.',
        concepts: [
          'Ticket receipt',
          'Acknowledgement',
          'Issue understanding',
          'Reproduction',
          'Classification',
          'KB search',
          'Resolution',
          'Documentation',
          'Closure',
        ],
        content: `Ticket Lifecycle:

1. Ticket Received
- Ticket arrives via email, portal, or phone
- Auto-assign or manual assignment
- Initial priority assessment

2. Acknowledge User
- Send immediate acknowledgement
- Set expectations for response time
- Provide ticket number for reference

3. Understand Issue
- Read ticket description carefully
- Ask clarifying questions if needed
- Identify application and error type
- Gather screenshots/logs if available

4. Reproduce Issue
- Try to reproduce the problem
- Document reproduction steps
- Note environment details
- Identify if issue is intermittent

5. Identify Application
- Confirm which application is affected
- Check application status
- Verify version information
- Check for known issues

6. Search Knowledge Base
- Search for similar issues
- Check for existing KB articles
- Review resolution steps
- Apply known fixes if available

7. Try Known Fix
- Apply documented resolution
- Test the fix
- Verify with customer
- Document results

8. Collect Logs
- If no known fix, collect diagnostic information
- Gather application logs
- Collect system information
- Document error messages

9. Escalate if Required
- Determine if OEM escalation needed
- Prepare escalation documentation
- Follow escalation process
- Communicate with customer

10. Document Resolution
- Document root cause
- Record resolution steps
- Create or update KB article
- Tag with appropriate keywords

11. Close Ticket
- Verify resolution with customer
- Update ticket status
- Send closure notification
- Archive for future reference`,
        importantNotes: [
          'Never skip steps in the lifecycle',
          'Communication at every stage is critical',
          'Documentation is mandatory for every ticket',
          'SLA compliance depends on following this process',
        ],
        commonMistakes: [
          'Skipping acknowledgement phase',
          'Not searching KB before troubleshooting',
          'Not documenting resolution steps',
          'Closing ticket without customer verification',
        ],
        estimatedDuration: 25,
        order: 2,
        isActive: true,
        quiz: {
          questions: [
            {
              question: 'What is the first step in the ticket lifecycle?',
              options: [
                'Search KB',
                'Ticket Received',
                'Acknowledge User',
                'Close Ticket'
              ],
              correctAnswer: 1
            },
            {
              question: 'When should you search the Knowledge Base?',
              options: [
                'After trying all possible fixes',
                'Before starting troubleshooting',
                'Only when the customer asks',
                'Never, Google is better'
              ],
              correctAnswer: 1
            },
            {
              question: 'What should you do before closing a ticket?',
              options: [
                'Nothing, just close it',
                'Verify resolution with customer',
                'Ask the customer to close it',
                'Wait 24 hours'
              ],
              correctAnswer: 1
            },
            {
              question: 'Which step comes before "Escalate if Required"?',
              options: [
                'Close Ticket',
                'Collect Logs',
                'Try Known Fix',
                'Document Resolution'
              ],
              correctAnswer: 1
            },
            {
              question: 'Why is the acknowledgement phase critical?',
              options: [
                'It is not critical',
                'Only for SLA compliance',
                'Sets customer expectations and starts SLA timer',
                'Just to be polite'
              ],
              correctAnswer: 2
            }
          ]
        }
      },
      {
        moduleId: academyModule1Id,
        title: 'Communication Best Practices',
        objective: 'Learn professional communication skills for application support',
        businessPurpose: 'Poor communication is the #1 cause of SLA breaches and customer dissatisfaction.',
        concepts: [
          'Professional English',
          'Empathy',
          'Expectation setting',
          'Escalation communication',
          'OEM communication',
          'Internal communication',
        ],
        content: `Communication Best Practices:

Golden Rule: Never disappear.

Even if you don't know the answer, update the customer.

Good Communication Example:
> We are currently investigating the issue. Initial analysis is in progress. We will provide another update within 30 minutes.

Bad Communication:
> ...
> (No update for 2 hours)

Professional English:
- Use clear, concise language
- Avoid technical jargon when possible
- Be specific about timelines
- Use proper grammar and spelling

Empathy:
- Acknowledge customer frustration
- Show understanding of business impact
- Apologize for delays sincerely
- Keep customer informed

Expectation Setting:
- Always provide estimated resolution time
- Update if timeline changes
- Be realistic, not optimistic
- Under-promise, over-deliver

Escalation Communication:
- Inform customer when escalating
- Explain why escalation is needed
- Provide new timeline
- Maintain ownership even during escalation

OEM Communication:
- Be professional and concise
- Provide all relevant information
- Follow OEM escalation process
- Document OEM responses

Internal Communication:
- Update team on complex issues
- Share knowledge with colleagues
- Escalate to team lead appropriately
- Document for team knowledge

Communication Templates:
Use these templates for common scenarios:

Initial Response:
> Thank you for contacting support. We have received your ticket #[TICKET]. A support engineer is reviewing your issue and will respond within [TIMEFRAME].

Update Request:
> We are investigating your issue [TICKET]. Current status: [STATUS]. We will provide another update by [TIME].

Resolution:
> Your issue [TICKET] has been resolved. [BRIEF DESCRIPTION]. Please confirm if this resolves your issue.

Escalation:
> Your issue [TICKET] requires escalation to our engineering team. We have escalated this and expect a response by [TIME]. We will keep you updated.`,
        importantNotes: [
          'Communication is MORE important than resolution',
          'Regular updates prevent SLA breaches',
          'Templates ensure consistency',
          'Always close the communication loop',
        ],
        commonMistakes: [
          'Going silent during troubleshooting',
          'Using technical jargon with non-technical customers',
          'Over-promising on resolution times',
          'Not following up after resolution',
        ],
        estimatedDuration: 30,
        order: 3,
        isActive: true,
        quiz: {
          questions: [
            {
              question: 'What is the golden rule of communication in support?',
              options: [
                'Always be formal',
                'Never disappear - always update the customer',
                'Only communicate when you have a solution',
                'Use technical language to show expertise'
              ],
              correctAnswer: 1
            },
            {
              question: 'What should you do if you cannot meet the resolution SLA?',
              options: [
                'Nothing, just work harder',
                'Communicate early, explain the delay, provide new timeline',
                'Escalate immediately',
                'Ignore the SLA'
              ],
              correctAnswer: 1
            },
            {
              question: 'Why is communication MORE important than resolution?',
              options: [
                'It is not more important',
                'Only for customer satisfaction surveys',
                'Regular updates prevent SLA breaches and manage expectations',
                'Resolution is always more important'
              ],
              correctAnswer: 2
            },
            {
              question: 'What is the best approach to expectation setting?',
              options: [
                'Under-promise, over-deliver',
                'Over-promise to impress the customer',
                'Never make promises',
                'Promise the fastest possible time'
              ],
              correctAnswer: 0
            },
            {
              question: 'When should you use communication templates?',
              options: [
                'Never, they are too impersonal',
                'Only for escalations',
                'For consistency in common scenarios',
                'Only when you are busy'
              ],
              correctAnswer: 2
            }
          ]
        }
      },
      {
        moduleId: academyModule1Id,
        title: 'SLA and Priority Management',
        objective: 'Understand SLA requirements and priority-based ticket handling',
        businessPurpose: 'SLA compliance is critical for business relationships and penalties.',
        concepts: [
          'Response SLA',
          'Resolution SLA',
          'Priority levels (P1-P4)',
          'Business impact',
          'SLA breach consequences',
        ],
        content: `SLA and Priority Management:

SLA Types:

Response SLA:
- Time to first acknowledge ticket
- Usually measured in minutes/hours
- Critical for customer satisfaction
- Triggers escalation if breached

Resolution SLA:
- Time to fully resolve the issue
- Measured from ticket creation
- Varies by priority level
- Business impact consideration

Priority Levels:

P1 - Critical:
- Business completely down
- Multiple users affected
- Response: 15 minutes
- Resolution: 4 hours
- Example: System-wide outage

P2 - High:
- Major functionality broken
- Single critical user affected
- Response: 30 minutes
- Resolution: 8 hours
- Example: Cannot process payroll

P3 - Medium:
- Partial functionality issue
- Workaround available
- Response: 2 hours
- Resolution: 24 hours
- Example: Report not generating

P4 - Low:
- Minor issue
- No business impact
- Response: 4 hours
- Resolution: 72 hours
- Example: UI formatting issue

SLA Breach Consequence Chain:

Late Acknowledgement
↓
Manager Escalation
↓
Client Dissatisfaction
↓
Penalty (financial)
↓
Poor CSAT Score
↓
Contract Renewal Risk

Key Principles:

Resolution is important
BUT
Communication is MORE important

If you cannot meet resolution SLA:
- Communicate early
- Explain the delay
- Provide new timeline
- Escalate if needed
- Document the reason

SLA Monitoring:
- Track time to first response
- Monitor time to resolution
- Set alerts before SLA breach
- Report SLA compliance monthly`,
        importantNotes: [
          'P1 tickets require immediate attention',
          'Communication prevents SLA breaches',
          'Always prioritize by business impact',
          'Document SLA breach reasons',
        ],
        commonMistakes: [
          'Not acknowledging P1 tickets immediately',
          'Ignoring SLA timers',
          'Not escalating when SLA at risk',
          'Treating all tickets with same priority',
        ],
        estimatedDuration: 25,
        order: 4,
        isActive: true,
        quiz: {
          questions: [
            {
              question: 'What is the response SLA for a P1 (Critical) ticket?',
              options: [
                '30 minutes',
                '15 minutes',
                '2 hours',
                '4 hours'
              ],
              correctAnswer: 1
            },
            {
              question: 'What is the resolution SLA for a P2 (High) ticket?',
              options: [
                '4 hours',
                '8 hours',
                '24 hours',
                '72 hours'
              ],
              correctAnswer: 1
            },
            {
              question: 'What should you do if you cannot meet the resolution SLA?',
              options: [
                'Nothing, just work harder',
                'Communicate early, explain delay, provide new timeline',
                'Escalate immediately without communication',
                'Ignore the SLA'
              ],
              correctAnswer: 1
            },
            {
              question: 'Which priority level has the longest resolution SLA?',
              options: [
                'P1',
                'P2',
                'P3',
                'P4'
              ],
              correctAnswer: 3
            },
            {
              question: 'What is the first consequence of an SLA breach?',
              options: [
                'Penalty',
                'Manager escalation',
                'Client dissatisfaction',
                'Contract renewal risk'
              ],
              correctAnswer: 1
            }
          ]
        }
      },
    ]);
    console.log('Created Academy Module 1 lessons');

    // Level 2: Common Support Methodology
    const academyModule2 = await LearningModule.create({
      applicationId: academyApplicationId,
      name: 'Level 2: Common Support Methodology',
      description: 'Learn universal troubleshooting concepts that apply to all applications',
      order: 2,
      isActive: true,
    });
    const academyModule2Id = academyModule2._id;
    console.log('Created Academy Module 2:', academyModule2Id);

    await LearningLesson.create({
      moduleId: academyModule2Id,
      title: 'Universal Application Concepts',
      objective: 'Learn common concepts that exist across all applications',
      businessPurpose: 'Understanding universal concepts allows you to troubleshoot any application using the same methodology.',
      concepts: [
        'Login and authentication',
        'Permissions and access control',
        'Database and data storage',
        'Logs and diagnostics',
        'Configuration and settings',
        'Services and processes',
        'Cache and temporary files',
        'User profiles and preferences',
        'File locations and paths',
        'Updates and patches',
        'Licensing and activation',
        'Import and export',
        'Backups and restores',
        'Printing and PDF generation',
        'Performance optimization',
        'Network connectivity',
      ],
      content: `Universal Application Concepts:

Every application has these components. Learn them once, apply everywhere.

1. Login and Authentication
- Username/password authentication
- Multi-factor authentication
- SSO integration
- Session management
- Password reset processes

2. Permissions and Access Control
- User roles and permissions
- Administrative access
- Feature-level permissions
- Data access restrictions
- Permission inheritance

3. Database and Data Storage
- Database types (SQL, NoSQL, file-based)
- Data integrity
- Data corruption issues
- Database maintenance
- Backup and recovery

4. Logs and Diagnostics
- Application logs
- Error logs
- Debug logs
- Event logs
- Log location and rotation

5. Configuration and Settings
- Application configuration files
- User preferences
- System settings
- Registry settings (Windows)
- Environment variables

6. Services and Processes
- Windows services
- Background processes
- Service dependencies
- Service startup types
- Process monitoring

7. Cache and Temporary Files
- Application cache
- Browser cache
- Temporary file locations
- Cache clearing
- Cache corruption issues

8. User Profiles and Preferences
- User profile locations
- Roaming profiles
- Profile corruption
- Profile migration
- Preference reset

9. File Locations and Paths
- Installation directories
- Data directories
- Configuration file paths
- Log file paths
- Backup locations

10. Updates and Patches
- Update mechanisms
- Patch management
- Version compatibility
- Rollback procedures
- Update failures

11. Licensing and Activation
- License types
- Activation processes
- License validation
- License errors
- License renewal

12. Import and Export
- Data import formats
- Data export formats
- Import/export failures
- Data mapping
- Validation errors

13. Backups and Restores
- Backup types
- Backup schedules
- Restore procedures
- Backup verification
- Disaster recovery

14. Printing and PDF Generation
- Printer drivers
- PDF components
- Print spooler
- Print failures
- PDF generation issues

15. Performance Optimization
- Memory usage
- CPU usage
- Disk I/O
- Network latency
- Performance tuning

16. Network Connectivity
- Network requirements
- Firewall settings
- Proxy configuration
- DNS resolution
- Network troubleshooting

Application Examples:

QuickBooks Common Issues:
- Company file (database)
- Backup/restore
- Network connectivity
- License errors
- Printer/PDF issues

CCH Axcess Common Issues:
- Login/authentication
- Cloud sync
- Permissions
- Workflow locks
- Print failures

Lacerte Common Issues:
- Database corruption
- Locator issues
- Permission errors
- Update failures
- Print issues

Notice: 80% is the same. Only names change.

Learn the concept once. Apply it everywhere.`,
      importantNotes: [
        'These concepts apply to ALL applications',
        'Master these once, reuse forever',
        'Focus on concepts, not just application-specific details',
        'Build mental models for each concept',
      ],
      commonMistakes: [
        'Learning each application separately without recognizing patterns',
        'Not applying knowledge from one app to another',
        'Focusing on symptoms instead of underlying concepts',
        'Not building universal troubleshooting skills',
      ],
      estimatedDuration: 35,
      order: 1,
      isActive: true,
    });
    console.log('Created Academy Module 2 lessons');

    // Level 2: Tier-1 Decision Tree
    const academyModule3 = await LearningModule.create({
      applicationId: academyApplicationId,
      name: 'Level 2: Tier-1 Decision Tree',
      description: 'Learn the structured decision tree for ticket handling',
      order: 3,
      isActive: true,
    });
    const academyModule3Id = academyModule3._id;
    console.log('Created Academy Module 3:', academyModule3Id);

    await LearningLesson.create({
      moduleId: academyModule3Id,
      title: 'Tier-1 Decision Tree',
      objective: 'Master the structured approach to ticket resolution',
      businessPurpose: 'The decision tree ensures consistent, efficient ticket handling and reduces dependency on Google.',
      concepts: [
        'Structured troubleshooting',
        'Decision tree methodology',
        'KB-first approach',
        'Knowledge creation',
        'Muscle memory development',
      ],
      content: `Tier-1 Decision Tree:

Your team should never start with Google.

Instead, follow this structured approach:

Step 1: Ticket Arrives
↓
Step 2: Which Application?
- Identify the affected application
- Confirm version and environment
- Check application status

↓
Step 3: Which Module?
- Identify which feature/module is affected
- Narrow down the problem area
- Check module-specific known issues

↓
Step 4: Which Error?
- Identify specific error message/code
- Document exact error text
- Note error frequency and timing

↓
Step 5: Known Error?
- Check if this is a known, documented error
- Search internal KB first
- Check error code references

↓
Step 6: Search KB
- Search knowledge base for similar issues
- Use keywords: application, error code, symptoms
- Review resolution steps
- Check for recent KB updates

↓
Step 7: Resolution (if KB found)
- Apply documented resolution
- Test the fix
- Verify with customer
- Document any variations

↓
Step 8: If no KB found
- Search GPT/Google for similar issues
- Verify solutions from external sources
- Test in safe environment first
- Document findings

↓
Step 9: Verify
- Test the resolution thoroughly
- Confirm with customer
- Check for side effects
- Document verification steps

↓
Step 10: Resolve
- Apply the final resolution
- Update ticket with full details
- Communicate with customer
- Set follow-up if needed

↓
Step 11: Create KB
- Document the resolution
- Create new KB article
- Tag with application, error code, keywords
- Add root cause analysis

This should become muscle memory.

Practice Drills:
- Run through decision tree for past tickets
- Time yourself on decision tree execution
- Identify where you skip steps
- Practice until it becomes automatic

Benefits:
- Consistent troubleshooting
- Faster resolution times
- Knowledge retention
- Reduced dependency on external searches
- Better customer communication`,
      importantNotes: [
        'Never skip steps in the decision tree',
        'KB search should happen BEFORE Google',
        'Every resolution should create or update KB',
        'Practice until this becomes automatic',
      ],
      commonMistakes: [
        'Starting with Google instead of KB',
        'Skipping documentation steps',
        'Not creating KB after resolution',
        'Not following the tree under time pressure',
      ],
      estimatedDuration: 30,
      order: 1,
      isActive: true,
    });
    console.log('Created Academy Module 3 lessons');

    // Level 2: Top 50 Issues
    const academyModule4 = await LearningModule.create({
      applicationId: academyApplicationId,
      name: 'Level 2: Top 50 Issues',
      description: 'Master the most common recurring issues across applications',
      order: 4,
      isActive: true,
    });
    const academyModule4Id = academyModule4._id;
    console.log('Created Academy Module 4:', academyModule4Id);

    await LearningLesson.create({
      moduleId: academyModule4Id,
      title: 'Top 50 Issues Program',
      objective: 'Understand the Top 50 Issues approach and why it works',
      businessPurpose: 'Top 50 recurring issues cover 70-80% of all tickets. Mastering these doubles resolution speed.',
      concepts: [
        'Pareto principle (80/20 rule)',
        'Recurring issue identification',
        'Issue categorization',
        'Knowledge prioritization',
        'Training focus',
      ],
      content: `Top 50 Issues Program:

The Concept:
Instead of teaching thousands of KB articles, focus on the Top 50 recurring issues.

Why This Works:
- These issues cover 70-80% of all tickets
- Mastering these doubles resolution speed
- High-impact training approach
- Builds confidence quickly

QuickBooks Top Issues (Examples):
1. Cannot Open Company File
2. PDF Printing Failure
3. H202 Error (Multi-user)
4. H505 Error (Multi-user)
5. Backup Failed
6. License Error
7. Verify Data Issues
8. Rebuild Data Issues
9. Transaction Pro Import Failure
10. Bank Feed Problems
11. Missing PDF Component
12. Network Connectivity
13. Performance Issues
14. Data Corruption
15. Update Failures

CCH Axcess Top Issues (Examples):
1. Login Failed
2. Authentication Issues
3. Print Failure
4. Workflow Lock
5. Permission Error
6. Cloud Sync Issues
7. Update Failure
8. Browser Compatibility
9. Session Timeout
10. Data Import Issues
11. Export Failures
12. Diagnostics Errors
13. Performance Issues
14. Multi-factor Authentication
15. User Profile Issues

Implementation Steps:

1. Analyze Ticket History
- Review last 6 months of tickets
- Identify recurring issues
- Count frequency of each issue
- Rank by frequency and impact

2. Create Top 50 List
- Select top 50 issues
- Document each issue
- Include resolution steps
- Add KB article references

3. Training Focus
- Prioritize Top 50 in training
- Create focused lessons
- Practice drills for each
- Test knowledge retention

4. Continuous Update
- Review Top 50 monthly
- Add new recurring issues
- Remove resolved issues
- Keep list current

Expected Results:
- 70-80% of tickets resolved faster
- Reduced escalation rate
- Higher first-contact resolution
- Improved customer satisfaction
- Better knowledge retention`,
      importantNotes: [
        'Focus on high-impact issues first',
        'Regularly update the Top 50 list',
        'Train until these become automatic',
        'Track resolution time improvements',
      ],
      commonMistakes: [
        'Trying to learn all issues instead of focusing on Top 50',
        'Not updating the list regularly',
        'Not practicing enough for mastery',
        'Not tracking impact on resolution times',
      ],
      estimatedDuration: 25,
      order: 1,
      isActive: true,
    });
    console.log('Created Academy Module 4 lessons');

    // Level 3: Advanced Skills
    const academyModule5 = await LearningModule.create({
      applicationId: academyApplicationId,
      name: 'Level 3: Advanced Skills',
      description: 'Advanced troubleshooting, root cause analysis, and knowledge creation',
      order: 5,
      isActive: true,
    });
    const academyModule5Id = academyModule5._id;
    console.log('Created Academy Module 5:', academyModule5Id);

    await LearningLesson.create([
      {
        moduleId: academyModule5Id,
        title: 'Root Cause Analysis',
        objective: 'Learn to perform deep root cause analysis for complex issues',
        businessPurpose: 'Root cause analysis prevents recurrence and improves system reliability.',
        concepts: [
          '5 Whys technique',
          'Fishbone diagram',
          'Timeline analysis',
          'Pattern recognition',
          'Systematic investigation',
        ],
        content: `Root Cause Analysis (RCA):

What is RCA?
Root Cause Analysis is a systematic method for identifying the underlying causes of problems, not just treating symptoms.

Why RCA Matters:
- Prevents issue recurrence
- Improves system reliability
- Reduces long-term support costs
- Identifies process improvements
- Builds organizational knowledge

RCA Techniques:

1. 5 Whys Technique
Ask "Why?" five times to get to the root cause.

Example:
Issue: Application crashed
Why 1: Database connection failed
Why 2: Database server was down
Why 3: Server exceeded memory limit
Why 4: Memory leak in application
Why 5: Bug in recent update
Root Cause: Bug in recent update caused memory leak

2. Fishbone Diagram (Ishikawa)
Categories to investigate:
- People: Training, staffing, communication
- Process: Procedures, workflows, policies
- Technology: Systems, tools, equipment
- Environment: Physical conditions, external factors
- Materials: Resources, data, inputs
- Management: Leadership, oversight, decisions

3. Timeline Analysis
- Create timeline of events
- Identify when issue started
- Correlate with changes/updates
- Look for patterns
- Identify triggering events

4. Pattern Recognition
- Look for similar past issues
- Identify common factors
- Check for environmental similarities
- Review user behavior patterns
- Analyze system metrics

RCA Process:

1. Define the Problem
- What happened?
- When did it happen?
- Where did it happen?
- Who was affected?
- What was the impact?

2. Collect Data
- Gather logs and diagnostics
- Interview users
- Review system metrics
- Document timeline
- Collect relevant information

3. Identify Possible Causes
- Brainstorm potential causes
- Use RCA techniques
- Don't eliminate possibilities too early
- Consider all factors

4. Determine Root Cause
- Test hypotheses
- Eliminate non-root causes
- Identify the true root cause
- Verify with evidence

5. Implement Solutions
- Address root cause, not symptoms
- Implement permanent fixes
- Update processes if needed
- Provide training if required

6. Monitor Results
- Monitor for recurrence
- Track effectiveness
- Update documentation
- Share learnings

RCA Documentation:
Always document:
- Problem description
- Root cause identified
- Solution implemented
- Prevention measures
- Lessons learned`,
        importantNotes: [
          'RCA takes time but prevents recurrence',
          'Don\'t stop at surface-level causes',
          'Document RCA for future reference',
          'Share findings with the team',
        ],
        commonMistakes: [
          'Treating symptoms instead of root cause',
          'Stopping too early in the investigation',
          'Not documenting RCA findings',
          'Not implementing preventive measures',
        ],
        estimatedDuration: 35,
        order: 1,
        isActive: true,
      },
      {
        moduleId: academyModule5Id,
        title: 'Knowledge Creation',
        objective: 'Learn to create effective knowledge base articles from ticket resolutions',
        businessPurpose: 'Every ticket should produce knowledge. Knowledge creation prevents repeated work.',
        concepts: [
          'KB article structure',
          'Documentation standards',
          'Tagging and categorization',
          'Knowledge reuse',
          'Continuous improvement',
        ],
        content: `Knowledge Creation:

The Problem Today:
Ticket comes → Engineer solves → Knowledge disappears
Tomorrow → Same issue → Engineer Googles again

The Solution:
Ticket → Resolution → Convert to KB → Tag → Reuse

Within three months, you'll have 500+ reusable solutions.

KB Article Structure:

Title:
- Application name
- Error code or symptom
- Clear, descriptive title
Example: "QuickBooks H202 Error - Multi-User Access Issue"

Summary:
- Brief description of the issue
- Impact on users
- Quick overview

Application Information:
- Application name and version
- Affected modules
- Environment details

Issue Description:
- Detailed problem description
- Error messages
- Screenshots if applicable
- Conditions that trigger the issue

Root Cause:
- What caused the issue
- Why it happened
- Contributing factors

Resolution Steps:
- Step-by-step resolution
- Numbered list
- Clear instructions
- Include commands/paths
- Warning notes for critical steps

Verification:
- How to verify the fix worked
- What to check
- Expected results

Prevention:
- How to prevent recurrence
- Monitoring recommendations
- Configuration changes
- User education if applicable

Related Articles:
- Links to related KB articles
- Cross-references
- Dependencies

Tags:
- Application name
- Error code
- Keywords
- Module/feature
- Severity

Documentation Standards:

Clarity:
- Use simple, clear language
- Avoid jargon when possible
- Be specific and precise
- Include examples

Completeness:
- Include all relevant information
- Don't assume knowledge
- Provide context
- Link to prerequisites

Accuracy:
- Test resolution steps
- Verify all information
- Update when changes occur
- Review periodically

Consistency:
- Use standard template
- Follow naming conventions
- Maintain formatting
- Standardize terminology

Tagging Strategy:

Application Tags:
- quickbooks, cch-axcess, lacerte, drake, ultratax

Error Code Tags:
- h202, h505, error-1234, login-failed

Module Tags:
- backup, restore, print, import, export

Keyword Tags:
- multi-user, network, license, performance

Severity Tags:
- critical, high, medium, low

Knowledge Reuse:

Search Process:
1. Search by application
2. Search by error code
3. Search by symptoms
4. Search by keywords
5. Review related articles

Application:
- Follow documented steps
- Adapt if needed
- Document variations
- Update KB if improvement found

Continuous Improvement:
- Review KB article usage
- Update based on feedback
- Add new variations
- Merge duplicate articles
- Archive outdated content

Expected Results:
- Reduced resolution time
- Higher first-contact resolution
- Less dependency on external searches
- Better knowledge retention
- Improved onboarding for new engineers`,
        importantNotes: [
          'Every ticket should produce or update a KB article',
          'Follow the standard template consistently',
          'Tag articles for easy search',
          'Review and update KB articles regularly',
        ],
        commonMistakes: [
          'Not documenting resolutions',
          'Creating incomplete KB articles',
          'Not tagging articles properly',
          'Not updating outdated articles',
        ],
        estimatedDuration: 30,
        order: 2,
        isActive: true,
      },
      {
        moduleId: academyModule5Id,
        title: 'OEM Collaboration',
        objective: 'Learn to effectively escalate and collaborate with OEM support',
        businessPurpose: 'Effective OEM collaboration speeds up resolution of complex issues.',
        concepts: [
          'When to escalate',
          'Escalation preparation',
          'OEM communication',
          'Managing OEM relationships',
          'Documenting OEM interactions',
        ],
        content: `OEM Collaboration:

When to Escalate to OEM:

Escalate when:
- Issue is not documented in KB
- Root cause is unclear
- Requires source code access
- Needs patch/fix from vendor
- Complex configuration issue
- Security vulnerability
- Data corruption requiring vendor tools

Before Escalating:

1. Complete Initial Troubleshooting
- Follow decision tree
- Document all steps taken
- Collect all relevant logs
- Try all known fixes
- Verify environment requirements

2. Gather Information
- Application version and build
- Error messages and codes
- Reproduction steps
- System configuration
- Recent changes
- Impact assessment

3. Prepare Documentation
- Create comprehensive ticket
- Include all gathered information
- Format for OEM readability
- Attach logs and screenshots
- Summarize troubleshooting steps

OEM Communication:

Best Practices:
- Be professional and concise
- Provide all relevant information upfront
- Use proper ticket format
- Follow OEM escalation process
- Set clear expectations

Communication Template:
Subject: [Application] [Issue] - [Priority]

Description:
- Application name and version
- Issue description
- Error messages/codes
- Reproduction steps
- Environment details
- Troubleshooting steps taken
- Expected behavior vs actual behavior
- Business impact

Attachments:
- Application logs
- Screenshots
- Configuration files
- Diagnostic reports
- Any other relevant files

Managing OEM Relationships:

During Escalation:
- Track OEM response time
- Follow up if no response
- Provide additional information if requested
- Test OEM-provided solutions
- Document OEM responses

After Resolution:
- Document OEM resolution
- Create KB article
- Share with team
- Update internal knowledge
- Note OEM contact for future

OEM Contacts:
- Maintain OEM contact list
- Document preferred contact methods
- Note escalation paths
- Track OEM support hours
- Know OEM SLA

Escalation Matrix:

Level 1: Standard OEM Support
- Email/ticket submission
- Standard response time
- First-line support

Level 2: Priority Support
- Phone escalation
- Faster response time
- Higher-tier support

Level 3: Emergency Support
- Direct engineer contact
- Immediate response
- Critical issue handling

Documenting OEM Interactions:

For each OEM interaction, document:
- Date and time
- OEM contact person
- Issue description
- Information provided
- OEM response
- Resolution provided
- Follow-up actions
- Lessons learned

Tips for Success:
- Build relationships with OEM contacts
- Be a valued customer (provide good information)
- Follow OEM processes
- Provide feedback on OEM support
- Share knowledge with OEM when appropriate`,
        importantNotes: [
          'Complete troubleshooting before escalating',
          'Provide comprehensive information upfront',
          'Follow OEM escalation processes',
          'Document all OEM interactions',
        ],
        commonMistakes: [
          'Escalating without proper troubleshooting',
          'Providing incomplete information to OEM',
          'Not following OEM processes',
          'Not documenting OEM resolutions',
        ],
        estimatedDuration: 30,
        order: 3,
        isActive: true,
      },
    ]);
    console.log('Created Academy Module 5 lessons');

    // Daily Learning Routine
    const academyModule6 = await LearningModule.create({
      applicationId: academyApplicationId,
      name: 'Daily Learning Routine',
      description: 'Guidelines for daily 30-minute learning sessions',
      order: 6,
      isActive: true,
    });
    const academyModule6Id = academyModule6._id;
    console.log('Created Academy Module 6:', academyModule6Id);

    await LearningLesson.create({
      moduleId: academyModule6Id,
      title: 'Continuous Learning and Knowledge Sharing',
      objective: 'Learn strategies for continuous skill development and effective knowledge sharing in support teams',
      businessPurpose: 'Continuous learning prevents skill stagnation and ensures the team stays current with evolving applications and issues.',
      concepts: [
        'Learning from tickets',
        'Knowledge sharing culture',
        'Personal development',
        'Team learning',
        'Skill retention',
      ],
      content: `Continuous Learning and Knowledge Sharing:

Why Continuous Learning Matters:

In application support, technology and applications are constantly evolving. Without continuous learning, skills stagnate and resolution times increase. The most successful support engineers have a systematic approach to learning.

The Learning Cycle:

1. Experience
- Handle real tickets
- Encounter new issues
- Work with different applications

2. Reflect
- What did I learn?
- What could I do better?
- What patterns do I see?

3. Document
- Create KB articles
- Update documentation
- Share with team

4. Share
- Present to team
- Mentor others
- Build collective knowledge

5. Apply
- Use knowledge in future tickets
- Improve resolution times
- Reduce escalations

Learning from Tickets:

Every ticket is a learning opportunity. Instead of just solving and moving on, extract the learning:

After resolving a ticket, ask:
- Was this a known issue?
- If not, should it be documented?
- What pattern does this fit?
- Could this have been resolved faster?
- What did I learn that applies to other tickets?

Knowledge Sharing Culture:

A strong support team shares knowledge freely. Benefits include:
- Faster resolution times for everyone
- Reduced dependency on individuals
- Better onboarding for new team members
- Higher team morale
- Less burnout from repeated issues

Ways to Share Knowledge:

1. Documentation
- Create KB articles
- Update existing documentation
- Add comments to tickets
- Share resolution summaries

2. Presentations
- Weekly ticket reviews
- New issue walkthroughs
- Application feature demos
- Troubleshooting technique sharing

3. Mentoring
- Pair with less experienced engineers
- Explain your thought process
- Share troubleshooting tips
- Provide feedback

4. Collaboration
- Discuss complex tickets
- Brainstorm solutions together
- Review each other's work
- Learn from different approaches

Personal Development Strategies:

Set Learning Goals:
- Master one new application feature per week
- Learn one new troubleshooting technique per month
- Contribute one KB article per week
- Present one ticket review per month

Track Your Progress:
- Resolution time trends
- KB articles created
- New skills learned
- Tickets resolved without escalation

Build Your Knowledge Base:
- Keep personal notes on common issues
- Bookmark useful resources
- Create cheat sheets for complex procedures
- Maintain a list of go-to solutions

Overcoming Learning Barriers:

Common barriers:
- "Too busy to learn"
- "I'll remember it"
- "Someone else already knows this"
- "Documentation takes too long"

Solutions:
- Schedule dedicated learning time
- Document immediately while fresh
- Share even if others know it
- Use templates to speed up documentation

Building a Learning Culture:

Leaders should:
- Model learning behavior
- Allocate time for learning
- Recognize knowledge sharing
- Provide learning resources
- Celebrate team improvements

Team members should:
- Share freely without hesitation
- Ask questions openly
- Give and receive feedback
- Help others learn
- Contribute to collective knowledge

Measuring Learning Impact:

Track these metrics:
- Average resolution time (should decrease)
- First-contact resolution rate (should increase)
- KB article usage (should increase)
- Escalation rate (should decrease)
- Team satisfaction (should increase)

Continuous Improvement:

Regularly assess:
- What are we learning?
- Are we sharing effectively?
- What gaps exist in our knowledge?
- How can we learn better?

Adjust your approach based on what works for your team.`,
      importantNotes: [
        'Every ticket should produce knowledge',
        'Share knowledge immediately, don\'t hoard it',
        'Learning is a team sport, not individual',
        'Document while it\'s fresh in your mind',
        'Consistency beats intensity - learn a little every day',
      ],
      commonMistakes: [
        'Solving tickets without documenting',
        'Keeping knowledge to yourself',
        'Thinking you\'ll remember everything',
        'Not allocating time for learning',
        'Only learning when forced to',
      ],
      estimatedDuration: 25,
      order: 1,
      isActive: true,
      quiz: {
        questions: [
          {
            question: 'Why is continuous learning important in application support?',
            options: [
              'It is not important',
              'Only for career advancement',
              'Applications and technology constantly evolve, preventing skill stagnation',
              'Only required for new employees'
            ],
            correctAnswer: 2
          },
          {
            question: 'What should you do immediately after resolving a ticket?',
            options: [
              'Move to the next ticket',
              'Take a break',
              'Extract learning: Was it known? Should it be documented? What patterns exist?',
              'Forget about it'
            ],
            correctAnswer: 2
          },
          {
            question: 'What is a benefit of a strong knowledge sharing culture?',
            options: [
              'Increased workload',
              'Faster resolution times for everyone',
              'More competition between team members',
              'Less job security'
            ],
            correctAnswer: 1
          },
          {
            question: 'How often should you contribute to the team knowledge base?',
            options: [
              'Never',
              'Only when asked',
              'Regularly - every ticket should produce knowledge',
              'Once a year'
            ],
            correctAnswer: 2
          },
          {
            question: 'What is the best approach to learning in a support environment?',
            options: [
              'Learn everything at once during training',
              'Consistency beats intensity - learn a little every day',
              'Only learn when you encounter a problem',
              'Wait for management to provide training'
            ],
            correctAnswer: 1
          }
        ]
      }
    });
    console.log('Created Academy Module 6 lessons');

    console.log('\n✅ Application Support Academy seeded successfully!');
    console.log('Summary:');
    console.log('- 1 Application (Application Support Academy)');
    console.log('- 6 Modules');
    console.log('- 11 Lessons');
    console.log('\nYou can now access the Learning Center at /learning');

  } catch (error) {
    console.error('❌ Error seeding academy data:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedAcademyData();
