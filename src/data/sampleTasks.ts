export interface SampleTask {
  title: string;
  description: string;
  category: string;
}

export const sampleTasks: SampleTask[] = [
  // Product Development & Engineering
  {
    title: 'Implement Redis caching for user sessions',
    description: 'Deploy Redis cluster on AWS to handle 50k concurrent users. Tasks: Configure Redis Sentinel for HA, implement session serialization in Node.js backend, set up monitoring with DataDog, create cache invalidation strategy for user profile updates, benchmark response times (target: <100ms p95)',
    category: 'Product Development & Engineering'
  },
  {
    title: 'Migrate payment processing to Stripe Connect',
    description: 'Replace legacy PayPal integration with Stripe Connect for marketplace vendors. Components: Implement OAuth flow for vendor onboarding, set up webhook handlers for payment events, create reconciliation reports matching our accounting format, update PCI compliance documentation, coordinate with 200+ active vendors for account migration',
    category: 'Product Development & Engineering'
  },
  {
    title: 'Build ML pipeline for fraud detection',
    description: 'Deploy TensorFlow model to identify suspicious transactions in real-time. Requirements: Process 10k transactions/second, integrate with Kafka streaming, achieve <50ms inference time, implement feature engineering for IP geolocation/device fingerprinting/velocity checks, set up A/B testing framework with 5% holdout group',
    category: 'Product Development & Engineering'
  },
  {
    title: 'Refactor authentication microservice',
    description: 'Modernize auth service handling 2M daily logins. Deliverables: Migrate from JWT to PASETO tokens, implement WebAuthn for passwordless login, add rate limiting with Redis (100 req/min per IP), integrate with Okta SAML for enterprise SSO, achieve 99.99% uptime SLA',
    category: 'Product Development & Engineering'
  },
  {
    title: 'Optimize PostgreSQL query performance',
    description: 'Fix slow queries affecting dashboard load times for enterprise customers. Action items: Analyze slow query log (queries >500ms), create compound indexes for JOIN operations, partition orders table by date (3-year retention), implement read replicas for analytics queries, reduce p99 latency from 3s to 500ms',
    category: 'Product Development & Engineering'
  },
  {
    title: 'Deploy Kubernetes autoscaling for API gateway',
    description: 'Configure HPA and VPA for production API serving 100M requests/day. Setup: Define CPU/memory thresholds (target 70% utilization), implement pod disruption budgets, configure Istio service mesh for traffic management, set up Prometheus alerts for scaling events, test with Locust (simulate 10k concurrent users)',
    category: 'Product Development & Engineering'
  },
  {
    title: 'Implement GDPR compliance features',
    description: 'Build data privacy tools for EU market launch. Features: User data export API (JSON/CSV formats), automated 30-day deletion pipeline, consent management UI with granular permissions, audit logging for all data access, integrate with OneTrust for cookie management, update privacy policy with DPO contact',
    category: 'Product Development & Engineering'
  },
  {
    title: 'Create GraphQL federation gateway',
    description: 'Unite 5 microservices under single GraphQL endpoint. Implementation: Set up Apollo Federation 2.0, define shared schemas with @key directives, implement DataLoader for N+1 query prevention, add query complexity analysis (max 1000 points), configure Redis caching with 5-minute TTL, document in GraphQL Playground',
    category: 'Product Development & Engineering'
  },

  // Sales & Business Development
  {
    title: 'Prepare Goldman Sachs enterprise pitch',
    description: 'Customize presentation for their 45k employee rollout. Sections: ROI analysis showing $2.3M annual savings, integration roadmap with their Workday HRIS, security compliance (SOC2, ISO 27001 certifications), tiered pricing for global deployment, case study from JP Morgan implementation, 30-day pilot program proposal',
    category: 'Sales & Business Development'
  },
  {
    title: 'Negotiate AWS partnership agreement',
    description: 'Finalize co-selling partnership with AWS for marketplace listing. Terms to negotiate: 15% revenue share (down from 20%), $100k marketing development fund, inclusion in AWS Activate program, featured placement in AWS Marketplace, joint webinar series (quarterly), access to AWS solution architects for customer deployments',
    category: 'Sales & Business Development'
  },
  {
    title: 'Close Series B lead investor',
    description: 'Secure $15M commitment from Sequoia Capital. Preparation: Update pitch deck with Q3 metrics (180% YoY growth), financial model showing path to $100M ARR, competitive analysis vs. Datadog/New Relic, reference calls with 3 Fortune 500 customers, due diligence data room with 200+ documents, negotiate 20% dilution cap',
    category: 'Sales & Business Development'
  },
  {
    title: 'Structure Microsoft reseller agreement',
    description: 'Establish channel partnership for Azure marketplace distribution. Deliverables: Technical integration with Azure AD, pricing model with 30% partner margin, joint GTM plan targeting 500 enterprise accounts, co-branded collateral for Microsoft field sales, quarterly business review framework, $2M first-year revenue target',
    category: 'Sales & Business Development'
  },
  {
    title: 'Expand Walmart vendor relationship',
    description: 'Grow from 50 to 200 stores in Q4 rollout. Action items: Present sales data showing 23% lift in pilot stores, negotiate promotional calendar for Black Friday, coordinate with supply chain for 3x inventory increase, train 150 store managers via virtual sessions, implement EDI integration for automated reordering',
    category: 'Sales & Business Development'
  },
  {
    title: 'Develop Salesforce integration partnership',
    description: 'Build native app for Salesforce AppExchange. Requirements: Pass security review (OWASP top 10), create Lightning components for Sales Cloud, implement OAuth 2.0 flow with named credentials, develop 5 pre-built workflow templates, achieve Salesforce ISV partner status, target 1000 installs in year one',
    category: 'Sales & Business Development'
  },
  {
    title: 'Onboard Tesla as enterprise client',
    description: 'Deploy solution across 120k employees globally. Implementation plan: Pilot with 500 engineers in Fremont, integrate with their custom LDAP directory, configure role-based access for 8 departments, set up dedicated AWS region for data residency, provide 24/7 support with 15-minute SLA, quarterly executive business reviews',
    category: 'Sales & Business Development'
  },
  {
    title: 'Launch healthcare vertical strategy',
    description: 'Enter $4.3T healthcare market with HIPAA-compliant offering. Strategy: Achieve HITRUST certification by Q2, recruit VP Sales from Epic/Cerner, develop integrations with top 5 EHR systems, create case studies with 2 hospital systems, attend HIMSS conference with 20x20 booth, target $5M ARR from healthcare by year-end',
    category: 'Sales & Business Development'
  },

  // Marketing & Growth
  {
    title: 'Launch Product Hunt campaign',
    description: 'Coordinate launch to reach #1 Product of the Day. Tasks: Prepare 60-second demo video (Loom recording), write compelling tagline under 60 characters, coordinate 50 hunters from Slack community, schedule 24 social media posts across timezones, offer 40% discount for PH users, prepare FAQ for 20 common questions, target 1000+ upvotes',
    category: 'Marketing & Growth'
  },
  {
    title: 'Execute LinkedIn ABM campaign',
    description: 'Target Fortune 500 CTOs with personalized outreach. Campaign structure: Create 10 custom landing pages by industry, develop 5-touch email sequence with 3 value props, produce 3 case study videos (2-min each), run $50k sponsored InMail campaign, track 15% meeting book rate, coordinate with sales for immediate follow-up',
    category: 'Marketing & Growth'
  },
  {
    title: 'Optimize Google Ads for $200k monthly spend',
    description: 'Improve CAC from $450 to $300 within 60 days. Optimization plan: Audit 500+ keywords for quality score, implement dayparting based on conversion data, create 20 new responsive display ads, set up enhanced conversions with GA4, test 5 landing page variants, implement negative keyword list (1000+ terms)',
    category: 'Marketing & Growth'
  },
  {
    title: 'Build influencer marketing program',
    description: 'Partner with 20 B2B thought leaders on LinkedIn/Twitter. Program details: Identify influencers with 50k+ followers in SaaS space, offer $5k/month retainer plus performance bonus, create co-branded content calendar (3 posts/week), track attribution with UTM parameters, measure 30% pipeline influence, scale to 50 influencers by Q4',
    category: 'Marketing & Growth'
  },
  {
    title: 'Create customer referral program',
    description: 'Launch two-sided incentive program targeting 25% participation. Program structure: Offer $500 credit for referrer, 20% discount for referee, build referral portal with unique tracking links, integrate with HubSpot for attribution, create email nurture campaign (5 touchpoints), gamify with leaderboard and quarterly prizes ($5k budget)',
    category: 'Marketing & Growth'
  },
  {
    title: 'Produce virtual conference content',
    description: 'Host 2-day virtual summit for 5000 attendees. Production tasks: Book 20 speakers (including 5 Fortune 500 execs), set up Hopin platform with networking features, create 10 breakout workshop sessions, coordinate 15 sponsor booths ($100k revenue target), produce 30 promotional assets, achieve 65% attendance rate',
    category: 'Marketing & Growth'
  },
  {
    title: 'Redesign pricing page for conversion',
    description: 'Increase trial signups from 3% to 5% conversion rate. Changes: Implement interactive pricing calculator, add competitor comparison table, create FAQ addressing top 10 objections, add social proof (logos of 50 customers), implement exit-intent popup with 20% discount, A/B test annual vs monthly default, add live chat for enterprise inquiries',
    category: 'Marketing & Growth'
  },
  {
    title: 'Launch podcast sponsorship strategy',
    description: 'Sponsor 10 B2B podcasts reaching target audience. Execution: Research shows with 10k+ downloads per episode, negotiate $30k quarterly package, create unique promo codes for attribution, develop 3 host-read ad scripts (30/60/90 seconds), provide interview opportunities for CEO, track 500 trial signups, measure $150k pipeline influence',
    category: 'Marketing & Growth'
  },

  // Operations & Process Improvement
  {
    title: 'Implement ISO 27001 certification process',
    description: 'Achieve certification within 6 months for enterprise sales. Roadmap: Conduct gap analysis with external auditor, document 50+ security procedures, implement mandatory security training (100% completion), deploy DLP tools across all endpoints, conduct penetration testing quarterly, prepare for Stage 2 audit with 0 major findings',
    category: 'Operations & Process Improvement'
  },
  {
    title: 'Automate customer onboarding workflow',
    description: 'Reduce time-to-value from 14 days to 3 days. Automation plan: Build Zapier workflows connecting 5 systems, create self-service portal with 20 tutorial videos, implement progressive disclosure UI, set up automated health scoring, trigger alerts for at-risk accounts (NPS < 7), achieve 85% self-service completion rate',
    category: 'Operations & Process Improvement'
  },
  {
    title: 'Optimize supply chain for 30% cost reduction',
    description: 'Restructure vendor relationships and logistics network. Initiatives: Consolidate from 15 to 5 strategic suppliers, negotiate volume discounts (MOQ 10k units), implement JIT inventory system, reduce air freight from 40% to 10%, optimize warehouse locations using network modeling, achieve 2-day delivery for 95% of US customers',
    category: 'Operations & Process Improvement'
  },
  {
    title: 'Deploy company-wide OKR framework',
    description: 'Roll out objectives and key results across 500 employees. Implementation: Train 50 team leads on OKR methodology, set up Weekdone for tracking, define 3 company-level objectives with 4 KRs each, cascade to department/individual level, establish weekly check-ins, quarterly review process with 70% achievement target',
    category: 'Operations & Process Improvement'
  },
  {
    title: 'Reduce customer churn from 15% to 10%',
    description: 'Implement retention program for at-risk accounts. Strategy: Build predictive churn model using 20 behavioral indicators, create customer success playbooks for 5 risk segments, implement quarterly business reviews for top 100 accounts, launch win-back campaign with 30% discount, establish customer advisory board with 20 members',
    category: 'Operations & Process Improvement'
  },
  {
    title: 'Establish remote work infrastructure',
    description: 'Enable fully distributed team across 15 countries. Setup: Deploy Okta for SSO across 30 applications, implement Slack Connect for client communication, establish 24/7 IT helpdesk with 1-hour SLA, create remote work policy handbook (50 pages), provide $1000 home office stipend, maintain 95% employee satisfaction score',
    category: 'Operations & Process Improvement'
  },
  {
    title: 'Implement financial planning system',
    description: 'Deploy Anaplan for company-wide budgeting and forecasting. Project scope: Model revenue across 5 product lines, create cost center hierarchy for 20 departments, build rolling 18-month forecast, implement variance analysis dashboards, train 30 budget owners, integrate with NetSuite for actuals, reduce monthly close from 10 to 5 days',
    category: 'Operations & Process Improvement'
  },
  {
    title: 'Create disaster recovery plan',
    description: 'Ensure business continuity with RTO of 4 hours, RPO of 1 hour. Plan components: Set up hot standby in secondary AWS region, implement database replication with 1-minute lag, document 50 runbooks for incident response, conduct quarterly DR drills, establish war room protocols, maintain 99.95% uptime SLA for critical services',
    category: 'Operations & Process Improvement'
  },

  // Strategic Planning & Analysis
  {
    title: 'Develop 3-year product roadmap',
    description: 'Create strategic vision for $100M ARR target. Roadmap elements: Define 4 major product themes, prioritize 50 features using RICE framework, analyze competitive landscape (10 key players), project resource needs (grow from 50 to 150 engineers), identify 3 potential acquisitions, present to board with 5-year financial model',
    category: 'Strategic Planning & Analysis'
  },
  {
    title: 'Analyze market expansion into Asia-Pacific',
    description: 'Evaluate opportunity for APAC headquarters in Singapore. Analysis: Size TAM at $2.5B across 5 countries, assess regulatory requirements for data residency, model P&L with 40% gross margin target, identify 10 local channel partners, recommend hiring plan for 30 employees, project break-even within 18 months',
    category: 'Strategic Planning & Analysis'
  },
  {
    title: 'Conduct competitive intelligence research',
    description: 'Deep dive on top 5 competitors for strategic planning. Research: Analyze pricing strategies across 3 tiers, compare feature sets in 15 categories, review 500 customer reviews on G2/Capterra, estimate market share using web traffic data, identify white space opportunities, create battle cards for sales team, present findings to executive team',
    category: 'Strategic Planning & Analysis'
  },
  {
    title: 'Build financial model for Series C fundraise',
    description: 'Create comprehensive model for $50M round at $500M valuation. Model components: 5-year revenue projection with 3 scenarios, cohort-based LTV/CAC analysis, unit economics by customer segment, sensitivity analysis on 10 key variables, comparable company valuation analysis, use of funds across 8 categories, dilution table for existing investors',
    category: 'Strategic Planning & Analysis'
  },
  {
    title: 'Design pricing strategy overhaul',
    description: 'Restructure pricing to increase ARPU by 35%. Strategy elements: Analyze price elasticity across 1000 accounts, create value-based pricing tiers, design feature packaging for good/better/best, model cannibalization impact, develop migration plan for 5000 existing customers, implement usage-based pricing component, project $10M revenue uplift',
    category: 'Strategic Planning & Analysis'
  },
  {
    title: 'Evaluate acquisition of competitor startup',
    description: 'Assess $25M acquisition of complementary technology company. Due diligence: Technical architecture compatibility review, customer overlap analysis (estimate 20%), team retention risk assessment (30 engineers), integration roadmap over 12 months, synergy identification ($5M cost savings), regulatory approval requirements, earn-out structure proposal',
    category: 'Strategic Planning & Analysis'
  },
  {
    title: 'Create digital transformation strategy',
    description: 'Modernize legacy systems over 24-month period. Transformation plan: Migrate from on-premise to cloud (AWS), replace 10 legacy applications, implement API-first architecture, establish data lake for analytics, train 200 employees on new tools, achieve 40% operational efficiency gain, invest $15M with 3-year ROI target',
    category: 'Strategic Planning & Analysis'
  },
  {
    title: 'Develop sustainability initiative roadmap',
    description: 'Achieve carbon neutrality by 2025 for ESG compliance. Initiatives: Reduce data center energy consumption by 50%, transition to 100% renewable energy, implement carbon offset program ($500k budget), create sustainability reporting framework, achieve B-Corp certification, engage 80% of suppliers in sustainability pledge, publish annual ESG report',
    category: 'Strategic Planning & Analysis'
  },

  // Client Work & Consulting
  {
    title: 'Deliver McKinsey digital strategy project',
    description: 'Complete 12-week engagement for Fortune 100 retailer. Deliverables: Omnichannel strategy affecting 2000 stores, customer journey mapping across 8 touchpoints, technology stack recommendations ($50M budget), organizational design for 100-person digital team, implementation roadmap with 20 initiatives, executive presentation to C-suite and board',
    category: 'Client Work & Consulting'
  },
  {
    title: 'Implement Deloitte SAP transformation',
    description: 'Lead S/4HANA migration for $5B manufacturing client. Project scope: Migrate from ECC to S/4HANA for 10 plants, redesign 50 business processes, configure 15 SAP modules, manage team of 30 consultants, conduct 100 user training sessions, achieve go-live in 6 months with zero production downtime',
    category: 'Client Work & Consulting'
  },
  {
    title: 'Execute BCG cost reduction program',
    description: 'Identify $100M savings for global pharmaceutical company. Analysis areas: Procurement spend analysis across 5000 vendors, organizational efficiency assessment (reduce layers from 8 to 5), outsourcing evaluation for 10 functions, automation opportunities in 20 processes, negotiate 15% reduction with top suppliers, implement zero-based budgeting',
    category: 'Client Work & Consulting'
  },
  {
    title: 'Complete Accenture cloud migration',
    description: 'Migrate 200 applications to Azure for financial services client. Migration plan: Application portfolio assessment using 6R framework, create dependency mapping for 500 integrations, implement DevOps pipelines for 50 teams, achieve 99.99% availability SLA, reduce infrastructure costs by 35%, complete in 4 waves over 18 months',
    category: 'Client Work & Consulting'
  },
  {
    title: 'Design PwC post-merger integration',
    description: 'Integrate two $2B companies within 100 days. Integration workstreams: Combine IT systems (migrate 5000 users), harmonize product portfolio (SKU reduction from 1000 to 600), restructure organization (identify $50M synergies), align culture across 10 locations, retain 90% of key talent, achieve Day 1 readiness',
    category: 'Client Work & Consulting'
  },
  {
    title: 'Deliver KPMG regulatory compliance audit',
    description: 'Ensure SOX compliance for newly public company. Audit scope: Document 100 key controls, test 25 critical processes, remediate 15 material weaknesses, implement segregation of duties for 500 users, establish quarterly control testing, train 20 process owners, achieve clean audit opinion from external auditors',
    category: 'Client Work & Consulting'
  },
  {
    title: 'Build custom CRM for enterprise client',
    description: 'Develop Salesforce solution for 5000-user deployment. Requirements: Custom Lightning components for 10 business processes, integration with 8 legacy systems via MuleSoft, data migration of 10M records, configure Einstein Analytics dashboards, implement CPQ for complex pricing, provide admin training and documentation, achieve 90% user adoption in 60 days',
    category: 'Client Work & Consulting'
  },
  {
    title: 'Conduct EY digital marketing audit',
    description: 'Assess marketing effectiveness for $500M e-commerce company. Audit components: Attribution modeling across 15 channels, conversion funnel analysis (identify 30% drop-off points), SEO technical audit of 50k pages, paid media efficiency review ($10M annual spend), marketing automation assessment, recommend MarTech stack consolidation, project 25% ROI improvement',
    category: 'Client Work & Consulting'
  },

  // Personal Finance & Investments
  {
    title: 'Rebalance investment portfolio',
    description: 'Adjust $500k portfolio for market conditions. Actions: Reduce tech allocation from 40% to 30%, increase international exposure to 25%, add 10% alternative investments (REITs, commodities), implement tax-loss harvesting for $15k deduction, review expense ratios (target under 0.3%), set up quarterly rebalancing alerts, update investment policy statement',
    category: 'Personal Finance & Investments'
  },
  {
    title: 'Optimize tax strategy for RSU vesting',
    description: 'Manage $200k RSU vest with minimal tax impact. Strategy: Calculate AMT exposure for ISO exercise, set up 10b5-1 trading plan, coordinate with CPA for estimated quarterly payments, evaluate charitable giving via DAF, implement tax-loss harvesting in taxable accounts, model scenarios for 83(b) election, target effective tax rate under 35%',
    category: 'Personal Finance & Investments'
  },
  {
    title: 'Establish estate planning documents',
    description: 'Complete comprehensive estate plan with attorney. Documents: Revocable living trust with A/B provisions, pour-over will, durable power of attorney, advance healthcare directive, guardianship nominations for children, update beneficiaries on 8 accounts, fund trust with home title transfer, create family emergency binder with all documents',
    category: 'Personal Finance & Investments'
  },
  {
    title: 'Analyze real estate investment opportunity',
    description: 'Evaluate $750k rental property for passive income. Analysis: Calculate cap rate (target 6%), model 20-year cash flow with 3% appreciation, review comparable rentals in area ($3500/month), arrange property inspection, secure pre-approval for 20% down payment, evaluate property management companies (8% fee), project $500/month positive cash flow',
    category: 'Personal Finance & Investments'
  },
  {
    title: 'Create retirement savings catch-up plan',
    description: 'Accelerate retirement savings to reach $2M by age 60. Plan: Max 401k contribution ($22,500), backdoor Roth IRA ($6,500), mega-backdoor Roth ($37,500), increase savings rate to 35% of gross income, model retirement spending needs ($120k/year), optimize asset location across accounts, project 7% annual returns, review annually',
    category: 'Personal Finance & Investments'
  },
  {
    title: 'Negotiate equity compensation package',
    description: 'Optimize offer from startup (Series B, $200M valuation). Negotiation points: Request 0.5% equity (50k options), understand 409A valuation ($2.50/share), negotiate 4-year vest with 1-year cliff, ask for acceleration on change of control, request early exercise provision, model potential outcomes (10x target), compare to market data for similar roles',
    category: 'Personal Finance & Investments'
  },
  {
    title: 'Build emergency fund strategy',
    description: 'Establish 12-month emergency fund ($120k target). Implementation: Open high-yield savings account (4.5% APY), automate $5k monthly transfer, create tiered structure (3/6/12 months), separate from checking account, invest months 7-12 in bond ladder, document emergency scenarios and thresholds, review and adjust quarterly',
    category: 'Personal Finance & Investments'
  },
  {
    title: 'Plan college savings for children',
    description: 'Fund education for 2 children (ages 5 and 7). Strategy: Open 529 plans with age-based portfolios, contribute $500/month per child, project $300k total college costs, coordinate with grandparent contributions, research state tax deductions, evaluate prepaid tuition vs investment options, model financial aid impact, review investment performance annually',
    category: 'Personal Finance & Investments'
  },

  // Health & Fitness Goals
  {
    title: 'Complete marathon training program',
    description: 'Prepare for Chicago Marathon in 16 weeks. Training plan: Build from 20 to 50 miles/week, include 3 20-mile long runs, incorporate speed work (tempo, intervals, fartlek), strength training 2x/week focusing on glutes/core, dial in race nutrition (consume 60g carbs/hour), taper final 3 weeks, target sub-3:30 finish time',
    category: 'Health & Fitness Goals'
  },
  {
    title: 'Implement comprehensive nutrition overhaul',
    description: 'Optimize diet for energy and body composition. Changes: Track macros (40% carbs, 30% protein, 30% fat), meal prep Sundays for 5 days, eliminate processed foods and added sugars, increase vegetable intake to 8 servings/day, hydration target 100oz water daily, supplement with vitamin D/omega-3/magnesium, monthly body composition scans',
    category: 'Health & Fitness Goals'
  },
  {
    title: 'Design home gym setup',
    description: 'Build complete training facility in garage ($5k budget). Equipment: Power rack with pull-up bar, Olympic barbell and 300lbs plates, adjustable dumbbells (5-75lbs), concept2 rower, rubber flooring (400 sq ft), mirror wall installation, sound system, climate control, organize 30-day return policy for all items',
    category: 'Health & Fitness Goals'
  },
  {
    title: 'Establish consistent sleep optimization routine',
    description: 'Achieve 8 hours quality sleep with 90+ sleep score. Protocol: Consistent 10pm bedtime/6am wake, bedroom temperature at 67°F, blackout curtains and white noise, no screens 1 hour before bed, magnesium glycinate supplement, morning sunlight exposure (10 min), track with Oura ring, limit caffeine to before noon',
    category: 'Health & Fitness Goals'
  },
  {
    title: 'Complete 12-week strength program',
    description: 'Increase major lifts by 20% using 5/3/1 methodology. Program: 4-day upper/lower split, progressive overload on squat/bench/deadlift/overhead press, accessory work targeting weak points, deload every 4th week, track all workouts in Strong app, mobility work 15 min daily, protein intake 1g/lb bodyweight',
    category: 'Health & Fitness Goals'
  },
  {
    title: 'Reduce stress through mindfulness practice',
    description: 'Establish daily meditation and stress management routine. Components: 20-minute morning meditation using Headspace, 5-minute breathing exercises (4-7-8 technique) 3x daily, weekly yoga class, monthly float tank sessions, quarterly digital detox weekends, maintain gratitude journal, achieve average HRV improvement of 15%',
    category: 'Health & Fitness Goals'
  },
  {
    title: 'Train for triathlon sprint distance',
    description: 'Complete first triathlon in 12 weeks (750m swim, 20k bike, 5k run). Training schedule: 6 days/week with 2 disciplines per day, join masters swim group for technique, bike intervals on trainer (FTP testing monthly), brick workouts on weekends, practice transitions, race simulation 2 weeks out, target finish under 1:30',
    category: 'Health & Fitness Goals'
  },

  // Learning & Certification
  {
    title: 'Obtain AWS Solutions Architect certification',
    description: 'Pass AWS SAA-C03 exam within 60 days. Study plan: Complete A Cloud Guru course (40 hours), read AWS Well-Architected Framework, hands-on labs for 15 services, take 6 practice exams (target 85% score), join study group meeting weekly, schedule exam for end of month 2, create flashcards for 200 concepts',
    category: 'Learning & Certification'
  },
  {
    title: 'Complete Google Data Analytics Certificate',
    description: 'Finish 6-course program on Coursera in 3 months. Curriculum: Foundations of data analytics, R programming and visualization, SQL for data extraction, Tableau dashboard creation, capstone project using real dataset, 10 hours study/week, build portfolio with 3 projects, update LinkedIn with certification',
    category: 'Learning & Certification'
  },
  {
    title: 'Master TypeScript for senior developer role',
    description: 'Achieve advanced proficiency in TypeScript. Learning path: Complete TypeScript Deep Dive book, build 5 projects using advanced types (generics, conditional types, mapped types), contribute to 3 open-source TS projects, complete 100 TypeScript challenges on Codewars, refactor existing JS codebase (10k lines) to TS',
    category: 'Learning & Certification'
  },
  {
    title: 'Earn PMP certification for project management',
    description: 'Pass PMP exam to advance PM career. Preparation: Complete 35-hour training with approved provider, study PMBOK Guide 7th edition, memorize 49 processes across 5 groups, take 4 full-length mock exams, create brain dump sheet, join PMP study group, apply to PMI with 3 years experience documentation',
    category: 'Learning & Certification'
  },
  {
    title: 'Learn Mandarin Chinese for business',
    description: 'Achieve HSK 3 proficiency for Asia expansion role. Study plan: Daily 1-hour lessons on iTalki, Anki flashcards for 1200 characters, HelloChinese app for grammar, weekly language exchange partner, watch 50 hours of Chinese content with subtitles, business vocabulary focus (500 terms), visit China for 2-week immersion',
    category: 'Learning & Certification'
  },
  {
    title: 'Complete Executive MBA prerequisites',
    description: 'Prepare application for top-10 EMBA program. Requirements: Achieve 720+ GMAT score (study 150 hours), write 4 essays demonstrating leadership impact, secure 3 recommendations (CEO, board member, client), update resume highlighting P&L responsibility, attend information sessions at Wharton/Booth/Kellogg, submit by round 2 deadline',
    category: 'Learning & Certification'
  }
];

// Helper function to get random tasks
export function getRandomTasks(count: number): SampleTask[] {
  const shuffled = [...sampleTasks].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to get tasks by category
export function getTasksByCategory(category: string): SampleTask[] {
  return sampleTasks.filter(task => task.category === category);
}

// Get all unique categories
export function getCategories(): string[] {
  return Array.from(new Set(sampleTasks.map(task => task.category)));
}