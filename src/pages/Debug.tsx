import { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonButtons,
  IonBackButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonBadge,
  IonButton,
  IonToggle,
  IonIcon,
  useIonPicker
} from '@ionic/react';
import { chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SqliteServiceContext, StorageServiceContext } from '../App';
import { Task, TaskStatus } from '../models/Task';
import { Toast } from '@capacitor/toast';
import PreferencesService from '../services/preferencesService';
import IAPService, { Product } from '../services/iapService';
import { SUBSCRIPTION_CONFIG } from '../config/subscription.config';

const Debug: React.FC = () => {
  const history = useHistory();
  const sqliteServ = useContext(SqliteServiceContext);
  const storageServ = useContext(StorageServiceContext);
  const [present] = useIonPicker();

  const [loading, setLoading] = useState(true);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [groupedByDate, setGroupedByDate] = useState<{ [key: string]: Task[] }>({});
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [iapProducts, setIapProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showDatabaseSummary, setShowDatabaseSummary] = useState(false);

  useEffect(() => {
    loadAllTasks();
    loadPremiumStatus();
    loadIAPProducts();
  }, []);

  const loadPremiumStatus = async () => {
    const premium = await PreferencesService.getIsPremium();
    setIsPremium(premium);
  };

  const handlePremiumToggle = async (checked: boolean) => {
    setIsPremium(checked);
    await PreferencesService.setIsPremium(checked);
    Toast.show({
      text: `Premium ${checked ? 'enabled' : 'disabled'}`,
      duration: 'short'
    });
  };

  const loadIAPProducts = async () => {
    try {
      setLoadingProducts(true);
      const products = await IAPService.getProducts();
      setIapProducts(products);
    } catch {
      Toast.show({
        text: 'Error loading IAP products',
        duration: 'short'
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadAllTasks = async () => {
    try {
      setLoading(true);
      const dbName = storageServ.getDatabaseName();
      const isConn = await sqliteServ.isConnection(dbName, false);

      if (!isConn) {
        throw new Error('Database connection not available');
      }

      // Get all tasks
      const tasks = await storageServ.getTasks();
      setAllTasks(tasks);

      // Group by date
      const grouped: { [key: string]: Task[] } = {};
      tasks.forEach(obj => {
        const date = obj.creation_date;
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(obj);
      });

      setGroupedByDate(grouped);
    } catch (error) {
      Toast.show({
        text: `Error: ${error}`,
        duration: 'long'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case TaskStatus.Open:
        return 'Open';
      case TaskStatus.Done:
        return 'Done';
      case TaskStatus.Overdue:
        return 'Overdue';
      default:
        return `Unknown (${status})`;
    }
  };

  const getStatusColor = (status: number): string => {
    switch (status) {
      case TaskStatus.Open:
        return 'primary';
      case TaskStatus.Done:
        return 'success';
      case TaskStatus.Overdue:
        return 'danger';
      default:
        return 'medium';
    }
  };

  const handleDeleteTask = async (id: number, title: string) => {
    if (!confirm(`Delete task "${title}"?`)) {
      return;
    }

    try {
      await storageServ.deleteTaskById(id);
      Toast.show({
        text: `Deleted task: ${title}`,
        duration: 'short'
      });
      // Reload the list
      await loadAllTasks();
    } catch (error) {
      Toast.show({
        text: `Error deleting: ${error}`,
        duration: 'long'
      });
    }
  };

  const handleOpenStatusPicker = (task: Task) => {
    const statusIndex = [TaskStatus.Open, TaskStatus.Done, TaskStatus.Overdue].indexOf(task.status);

    present({
      columns: [
        {
          name: 'status',
          options: [
            { text: 'Open', value: TaskStatus.Open },
            { text: 'Done', value: TaskStatus.Done },
            { text: 'Overdue', value: TaskStatus.Overdue }
          ],
          selectedIndex: statusIndex >= 0 ? statusIndex : 0
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: (value) => {
            handleStatusChange(task, value.status.value);
          }
        }
      ]
    });
  };

  const handleStatusChange = async (task: Task, newStatus: number) => {
    try {
      const updatedTask: Task = {
        ...task,
        status: newStatus
      };

      await storageServ.updateTask(updatedTask);
      Toast.show({
        text: `Status updated to ${getStatusLabel(newStatus)}`,
        duration: 'short'
      });
      // Reload the list
      await loadAllTasks();
    } catch (error) {
      Toast.show({
        text: `Error updating status: ${error}`,
        duration: 'long'
      });
    }
  };

  const generateSampleData = async () => {
    try {
      // Clear existing data
      await storageServ.deleteAllTasks();

      const taskTemplates = [
        // Product Development & Engineering
        { title: 'Fix production bug in checkout', description: 'Customer reported cart items disappearing during payment. Reproduce issue with test account, check Sentry logs showing 500 errors on payment service, identify race condition in Redis cache, deploy hotfix to staging, run regression tests, coordinate with DevOps for 3 PM production deployment. Update incident report and notify support team.' },
        { title: 'Review pull request for auth system', description: 'Senior engineer submitted OAuth 2.0 integration (800 lines). Check implementation against RFC 6749 spec, verify token refresh logic, test edge cases for expired tokens, ensure proper error handling, validate security headers, run local tests with different providers, add comments on code improvements, approve for merge to develop branch.' },
        { title: 'Write API documentation', description: 'Document 5 new endpoints for partner integration. Include request/response examples, authentication requirements, rate limiting details, error codes with descriptions, webhook payload formats, versioning strategy. Use OpenAPI 3.0 spec, generate Postman collection, publish to developer portal, send announcement to partner engineering teams.' },
        { title: 'Optimize slow database query', description: 'Dashboard loading takes 8 seconds due to analytics query. Analyze execution plan, add composite index on user_id and timestamp, rewrite subquery as JOIN, implement query result caching for 5 minutes, test performance improvement (target <500ms), update monitoring alerts, document optimization in team wiki.' },
        { title: 'Implement feature flag', description: 'Add feature toggle for new pricing page using LaunchDarkly. Create flag with targeting rules for beta users, implement React component conditionals, add analytics events for A/B testing, test flag variations in staging, coordinate with PM on rollout percentage, document flag lifecycle, prepare rollback plan if metrics drop.' },
        { title: 'Debug memory leak', description: 'Node.js service consuming 4GB RAM after 24 hours. Take heap snapshot, analyze with Chrome DevTools, identify event listener accumulation, fix cleanup in websocket handlers, add memory monitoring metrics, test fix under load for 2 hours, prepare deployment plan, update runbook with troubleshooting steps.' },
        { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for new microservice. Write workflow for test, build, and deploy stages, add Docker build with multi-stage optimization, configure secrets for AWS credentials, set up branch protection rules, implement semantic versioning, add Slack notifications for failures, document pipeline in README.' },
        { title: 'Conduct code review session', description: 'Review 3 PRs from junior developers before standup. Check React component patterns, suggest performance optimizations, ensure proper error boundaries, validate accessibility requirements, verify unit test coverage >80%, provide constructive feedback with code examples, pair program on complex logic, update team coding standards doc.' },

        // Sales & Business Development
        { title: 'Prepare demo for Microsoft team', description: 'Tomorrow\'s call with Microsoft Azure team (5 stakeholders). Customize demo environment with their branding, prepare integration architecture slides, load sample data matching their use case, test screen sharing and backup laptop, prepare answers for security questions, create follow-up email template with pricing. Block 30 min before call for final prep.' },
        { title: 'Send quarterly business review deck', description: 'Finalize QBR presentation for Amazon account. Update metrics dashboard showing 23% growth, add case study from recent implementation, include roadmap for next quarter, calculate ROI from latest feature adoption, get approval from VP of Sales, export to PDF, send calendar invite with agenda, prepare talking points for upsell opportunity.' },
        { title: 'Follow up on Salesforce proposal', description: 'Partnership proposal sent last week needs follow-up. Call champion to check internal feedback, address concerns about revenue split, revise technical integration timeline based on their input, add two more use cases they mentioned, update legal terms per their counsel, schedule next steps meeting with decision makers, log all changes in CRM.' },
        { title: 'Update sales forecast', description: 'Weekly pipeline review due by 5 PM. Review 15 deals closing this month, update probability scores based on latest conversations, flag 3 at-risk deals needing executive attention, add notes from today\'s discovery calls, adjust forecast from $2.1M to $1.8M, prepare explanation for leadership, schedule rescue calls for slipping deals.' },
        { title: 'Qualify inbound enterprise lead', description: 'Fortune 500 retail company requested demo. Research company tech stack on BuiltWith, check LinkedIn for decision makers, review their latest 10-K for IT spending, prepare discovery questions about current pain points, schedule 45-minute call, create mutual evaluation plan, add to CRM with detailed notes, assign solutions engineer for technical questions.' },
        { title: 'Negotiate contract terms', description: 'Legal redlines came back on $450K deal. Review changes to liability caps, push back on source code escrow requirement, accept extended payment terms for 10% increase, add auto-renewal clause, clarify SLA definitions, get approval from legal team, schedule call to discuss remaining points, target signature by end of week.' },
        { title: 'Create competitive battle card', description: 'Lost two deals to new competitor this month. Research their pricing and features, interview customer who switched, document our differentiation points, create objection handling for "they\'re cheaper", add technical advantages section, validate with product team, distribute to sales team, schedule training session for Friday, update CRM compete fields.' },
        { title: 'Onboard channel partner', description: 'New VAR partner signed agreement yesterday. Schedule kickoff call with their sales team, create partner portal account, assign dedicated Slack channel, send product training videos, set up deal registration form, provide marketing materials and case studies, establish weekly check-in cadence, register their first opportunity, introduce to partner success manager.' },

        // Marketing & Growth
        { title: 'Write blog post on AI trends', description: 'Publish thought leadership piece by noon. Research 3 recent industry reports, interview our CTO for quotes, create 2 custom graphics in Canva, optimize for SEO keyword "AI automation tools" (8K monthly searches), add 5 internal links to product pages, include CTA for free trial, promote on LinkedIn and Twitter, schedule email blast to 5K subscribers.' },
        { title: 'Review Google Ads performance', description: 'Weekly optimization for $25K monthly budget. Pull 7-day performance report, pause 5 keywords with CPA >$200, increase bid on top 3 converting terms, add 10 negative keywords from search terms, test new ad copy for highest-traffic campaign, adjust mobile bid modifier based on conversion data, document changes in optimization log, report metrics to CMO.' },
        { title: 'Launch email campaign', description: 'Send product update newsletter to 15K subscribers. Write subject line and preview text, design email in Mailchimp with new feature screenshots, segment list by user activity level, set up A/B test for CTA button color, schedule send for 10 AM EST, prepare social media posts to coincide, monitor open rates for first 2 hours, prepare follow-up for non-openers.' },
        { title: 'Create social media content', description: 'Prepare week\'s LinkedIn posts for company page. Write 5 posts mixing thought leadership and product updates, design carousel for Tuesday\'s algorithm hack post, create native video for Thursday feature highlight, schedule all posts in Buffer, engage with 20 relevant industry posts, respond to all comments and DMs, track engagement metrics, adjust next week\'s strategy.' },
        { title: 'Analyze website conversion rate', description: 'Homepage performing below 2% target. Set up Hotjar recording for 100 sessions, analyze heatmaps showing drop-off points, review Google Analytics flow, identify that CTA is below fold, create variant with CTA moved up, set up A/B test in Optimizely, document hypothesis and success metrics, schedule review for next week, brief designer on findings.' },
        { title: 'Coordinate webinar logistics', description: 'Host "Best Practices" webinar Thursday 2 PM. Test Zoom setup and slides, send reminder email to 500 registrants, prepare 10 poll questions for engagement, create follow-up email with recording link, design landing page for replay, coordinate with sales for lead handoff, prepare FAQ document, assign team roles for Q&A, do dry run at noon.' },
        { title: 'Update competitor analysis', description: 'Quarterly competitive intelligence review. Check 5 competitors\' pricing pages for changes, sign up for trials to see new features, review their recent blog posts and press releases, update battle card with findings, analyze their Google Ads using SEMrush, document in competitive wiki, present findings at marketing standup, share with sales team.' },
        { title: 'Manage influencer outreach', description: 'Launch micro-influencer campaign for new feature. Research 20 relevant LinkedIn thought leaders, draft personalized outreach messages, offer exclusive access and co-marketing opportunity, track responses in spreadsheet, schedule calls with 5 interested parties, negotiate terms (post requirements, timeline), provide creative assets, set up tracking links, plan content calendar.' },

        // Operations & Strategic Planning
        { title: 'Prepare board deck', description: 'Monthly board meeting tomorrow at 2 PM. Update slides with latest metrics (MRR, burn rate, runway), add customer logos from last month\'s wins, create hiring pipeline slide showing 8 open roles, include product roadmap for Q4, address concerns from last meeting about churn, practice presenting with CEO, print 10 copies, test video link for remote directors.' },
        { title: 'Review Q3 financial results', description: 'Close the books and analyze performance. Pull reports from QuickBooks, calculate key metrics (CAC, LTV, gross margin), identify $50K variance in marketing spend, investigate reasons for 5% margin improvement, prepare executive summary with charts, highlight 3 positive trends and 2 concerns, schedule meeting with department heads, distribute report before tomorrow\'s leadership meeting.' },
        { title: 'Conduct team planning session', description: 'Facilitate Q4 OKR setting with product team. Review last quarter\'s 70% achievement rate, brainstorm objectives for next quarter, help team narrow down to 3 key objectives, define measurable key results, ensure alignment with company goals, document in Notion, schedule weekly check-ins, share with cross-functional partners, add to performance review criteria.' },
        { title: 'Interview VP candidate', description: 'Final round for VP of Engineering. Prepare behavioral questions about scaling teams, review their GitHub and past projects, coordinate with 3 other interviewers on focus areas, conduct 60-minute deep dive on technical leadership, assess culture fit with our values, complete scorecard immediately after, debrief with hiring committee at 4 PM, make go/no-go decision today.' },
        { title: 'Negotiate office lease renewal', description: 'Current lease expires in 60 days. Review market comps showing 20% decrease in rates, prepare negotiation strategy for 30% reduction, calculate cost of moving vs staying, tour 2 alternative spaces for leverage, meet with landlord at 3 PM, push for 6 months free rent and TI allowance, get legal to review terms, target signing next week.' },
        { title: 'Create investor update', description: 'Monthly update email to 50 investors. Write executive summary of progress, include metrics dashboard (growth, burn, runway), highlight 2 major customer wins, explain strategy pivot in sales approach, list 3 specific asks for help (intros, hiring, advice), attach financial statements, proofread with CFO, send by 6 PM, track opens and responses.' },
        { title: 'Run pricing analysis', description: 'Test price increase for enterprise tier. Analyze usage data for top 20 accounts, calculate value delivered vs price paid, model revenue impact of 20% increase, identify 5 accounts for price test, draft communication explaining added value, get sales team input, prepare retention offers if pushback, document in pricing committee memo, present recommendation at 2 PM.' },
        { title: 'Audit operational expenses', description: 'Find 10% cost reduction opportunities. Review all SaaS subscriptions for unused seats, analyze AWS bill for overprovisioned resources, check vendor contracts for renegotiation opportunities, identify duplicate tools across teams, calculate savings from identified cuts, prioritize by impact vs effort, present findings to CFO, implement quick wins today, schedule vendor calls for next week.' },

        // Client Consulting & Services
        { title: 'Present migration assessment', description: 'Client workshop for cloud migration project today. Finalize assessment showing 40% cost savings potential, create architecture diagram for hybrid cloud approach, identify top 10 applications for pilot phase, prepare risk mitigation slides, calculate 18-month ROI, practice demo of POC environment, print handouts for 8 stakeholders, book conference room with AV, follow up with SOW draft.' },
        { title: 'Deliver security audit findings', description: 'Present penetration test results to hospital CISO. Document 15 critical vulnerabilities found, prioritize fixes by risk score, create executive summary for board, demonstrate SQL injection vulnerability, provide remediation steps with effort estimates, discuss emergency patching for critical items, schedule follow-up test in 30 days, prepare compliance attestation letter, assign remediation tracking.' },
        { title: 'Conduct stakeholder interviews', description: 'Digital transformation discovery for retail client. Interview 5 department heads about pain points, document current state processes, identify integration challenges between systems, map data flow between applications, note change management concerns, compile findings in Miro board, prepare initial recommendations, schedule follow-up workshop for next week, send meeting notes within 24 hours.' },
        { title: 'Build project status report', description: 'Weekly status for $2M implementation project. Update RAID log with 2 new risks, calculate that project is 3 days behind schedule, identify mitigation plan to recover timeline, update budget tracker showing 85% spend, create burndown chart for remaining tasks, highlight wins from user testing, prepare escalation for resource conflict, distribute to 20 stakeholders, schedule steering committee call.' },
        { title: 'Run training workshop', description: 'Agile transformation training for client team. Prepare slides on Scrum fundamentals, create hands-on exercise for story writing, set up Jira project for practice, facilitate planning poker session, demonstrate daily standup format, explain retrospective techniques, provide templates and cheat sheets, record session for absent team members, schedule follow-up coaching sessions, gather feedback scores.' },
        { title: 'Design solution architecture', description: 'Create technical design for payment system. Draw component diagram showing microservices, specify API contracts between services, define database schema for transactions, plan message queue for async processing, document security controls for PCI compliance, estimate infrastructure costs, identify integration points with existing systems, present to client architects at 3 PM, incorporate feedback for v2.' },
        { title: 'Prepare change request', description: 'Scope change for additional features requested. Calculate 3-week timeline impact, estimate $50K budget increase, document requirements for new reporting module, assess impact on testing phase, update project plan with dependencies, prepare contract amendment, justify ROI of changes, get sign-off from project sponsor, communicate to development team, update stakeholder expectations.' },
        { title: 'Complete data migration', description: 'Move customer records to new CRM system. Extract 50K records from legacy database, transform data to match new schema, clean duplicate entries and fix formatting, validate business rules and constraints, run test load with 1K records, fix mapping issues identified, execute full load overnight, verify record counts and spot-check data, prepare rollback plan, document exceptions for manual cleanup.' },

        // Personal Finance & Career
        { title: 'Review investment performance', description: 'Quarterly portfolio check before market close. Log into Vanguard and check YTD returns (+12%), compare against S&P 500 benchmark, rebalance tech allocation from 35% to 25%, sell $10K of losing position for tax loss harvesting, buy international index fund with proceeds, set calendar reminder for next quarter, download statements for CPA, update investment tracking spreadsheet.' },
        { title: 'Update resume for job search', description: 'Apply to 3 director roles by tonight. Quantify achievements from last year (increased revenue by 40%), add recent AWS certification, update LinkedIn with new skills, tailor resume for each position using job keywords, write custom cover letters highlighting relevant experience, submit applications through company portals, set up job alerts, reach out to 2 contacts for referrals.' },
        { title: 'Prepare tax documents', description: 'Organize paperwork for CPA appointment tomorrow. Gather all 1099s and W-2, compile charitable donation receipts, calculate home office square footage, organize business expense receipts by category, download crypto trading history, find last year\'s return for reference, prepare list of questions about new deductions, scan everything to shared folder, confirm appointment time.' },
        { title: 'Research side hustle options', description: 'Explore consulting opportunity in my field. Update expert profile on clarity.fm, research market rates for similar consultants ($300/hour), draft service offering outline, identify 5 potential first clients, create simple landing page on Carrd, set up Calendly for bookings, write LinkedIn post announcing availability, join 2 relevant Slack communities, schedule coffee chat with successful consultant.' },
        { title: 'Negotiate current salary', description: 'Annual review meeting at 3 PM with manager. Research market rates showing I\'m 15% below, prepare list of accomplishments (led 3 major projects), create presentation showing value delivered ($2M in savings), practice negotiation talking points, prepare to ask for 20% increase, have backup ask for additional PTO, document conversation, follow up with email summary.' },
        { title: 'Set up emergency fund', description: 'Automate savings after paycheck hits Friday. Calculate 6 months expenses ($30K needed), open high-yield savings account (4.5% APY), set up automatic transfer of $500/month, rename account "Emergency Fund - Don\'t Touch", update budget to reflect new savings, cancel unused subscriptions to free up cash, set milestone alerts for 3 and 6 months, update financial spreadsheet.' },
        { title: 'Review insurance coverage', description: 'Annual insurance audit before renewal. Compare car insurance quotes (potential $400 savings), increase umbrella policy to $2M, review life insurance needs with new mortgage, add valuable items rider for engagement ring, check if eligible for home/auto bundle discount, update beneficiaries on all policies, schedule call with agent for tomorrow, document all policy numbers in password manager.' },
        { title: 'Plan year-end bonus allocation', description: 'Bonus arrives next week ($25K). Allocate 40% to Roth IRA ($6,500 max), pay extra $5K on student loans, invest $8K in index funds, set aside $3K for vacation fund, keep $2.5K for holiday shopping, update financial goals tracker, schedule investment purchases for Monday, celebrate hitting savings target with nice dinner.' },

        // Health & Fitness
        { title: 'Complete marathon training run', description: 'Long run today - 18 miles at 8:30 pace. Wake at 5 AM for light breakfast, dynamic warmup routine, first 6 miles easy, middle 6 at marathon pace (7:45), final 6 progressive, hydrate every 3 miles, consume gel at miles 6 and 12, cool down walk and stretch, ice bath for recovery, log run in Strava, meal prep for tomorrow.' },
        { title: 'Meal prep for the week', description: 'Prepare 5 days of meals in 3 hours. Shop list: 5 lbs chicken, 2 lbs salmon, sweet potatoes, broccoli, rice. Cook proteins with different seasonings, portion into containers (6 oz protein, 200g carbs, vegetables), prepare overnight oats for breakfasts, cut vegetables for snacks, make protein smoothie packs for freezer, label everything with calories/macros, clean kitchen.' },
        { title: 'Complete physical therapy session', description: 'Knee rehab appointment at 2 PM plus home exercises. Attend PT for manual therapy and assessment, learn 2 new strengthening exercises, complete all prescribed exercises (3 sets each), ice for 20 minutes post-session, schedule next appointment, pick up resistance bands from pharmacy, update recovery log, modify tomorrow\'s workout based on therapist feedback.' },
        { title: 'Track fitness metrics', description: 'Weekly measurement and progress check. Weigh in first thing morning, take body measurements (waist, arms, chest), calculate body fat with calipers, take progress photos from 3 angles, log everything in fitness app, compare to last week\'s numbers, adjust calorie intake if needed, plan next week\'s workouts, celebrate hitting protein target 7 days straight.' },
        { title: 'Complete CrossFit workout', description: 'Today\'s WOD plus strength training. Warm up with 500m row and dynamic stretches, strength: work up to 5RM back squat, WOD: 21-15-9 thrusters and pull-ups for time, beat last month\'s time by 30 seconds, cool down with 10-min yoga flow, update whiteboard with PR, foam roll problem areas, protein shake within 30 minutes, schedule tomorrow\'s class.' },
        { title: 'Plan race strategy', description: 'Half marathon next Sunday - finalize race plan. Study course elevation map, identify challenging hills at miles 7 and 10, plan pace strategy (start at 8:00, negative split), decide nutrition timing (gel at miles 5 and 9), lay out race outfit and gear, check weather forecast, arrange transportation to start line, visualize race execution, set three goals: A (1:45), B (1:48), C (finish strong).' },
        { title: 'Attend fitness class', description: 'Morning spin class plus evening yoga. 6 AM spin class: arrive early for bike setup, 45-min high-intensity intervals, burn 500+ calories, stretch afterwards. Evening: 7 PM vinyasa flow class, focus on hip openers, practice inversions if offered, stay for final relaxation, chat with instructor about teacher training, sign up for next week\'s classes, update fitness calendar.' },

        // Learning & Professional Development
        { title: 'Study for AWS exam', description: 'Complete EC2 and S3 modules today. Watch 2 hours of CloudGuru videos on compute services, take notes on instance types and pricing, complete hands-on lab launching auto-scaling group, review S3 storage classes and lifecycle policies, create 50 Anki flashcards from today\'s material, take practice quiz (target 80%), schedule tomorrow\'s study session, join study group Discord discussion.' },
        { title: 'Record podcast episode', description: 'Interview senior engineer about microservices. Test audio setup and internet connection, review guest bio and prepare 15 questions, conduct 45-minute interview via Zencastr, ask about their migration journey and lessons learned, edit out pauses and filler words in Descript, write show notes with timestamps, create audiogram for social media, schedule publishing for Thursday, send thank you note to guest.' },
        { title: 'Write technical blog post', description: 'Publish article on React performance optimization. Research latest React 18 features, write 2,000-word draft covering memoization and lazy loading, create 3 code examples with CodeSandbox demos, add performance metrics screenshots, optimize for SEO with keywords research, create cover image in Canva, publish on dev.to and Medium, share on LinkedIn and Twitter, respond to early comments.' },
        { title: 'Contribute to open source', description: 'Fix issue in popular GitHub project. Browse "good first issue" tags on React repos, claim issue #234 about form validation bug, fork repo and set up local environment, reproduce bug and write failing test, implement fix following contribution guidelines, create pull request with detailed description, respond to maintainer\'s code review feedback, update documentation if needed, share contribution on LinkedIn.' },
        { title: 'Complete online course module', description: 'Finish week 3 of Python course on Coursera. Watch 90 minutes of video lectures on data structures, complete coding exercises on lists and dictionaries, submit peer-reviewed assignment by midnight, grade 3 other students\' submissions, participate in forum discussion about recursion, take week 3 quiz (need 80% to pass), download slides for offline review, plan week 4 study schedule.' },
        { title: 'Attend virtual conference', description: 'Developer conference with 3 sessions today. Register and test Zoom setup, attend keynote on AI trends at 9 AM, participate in Q&A for cloud architecture talk, take notes on best practices shared, network in virtual breakout rooms during lunch, connect with 5 attendees on LinkedIn, download slide decks and resources, write summary of key learnings, share insights with team tomorrow.' },
        { title: 'Practice technical interview', description: 'Prepare for FAANG interview next week. Solve 3 LeetCode medium problems (arrays, trees, dynamic programming), time yourself at 45 minutes each, practice explaining approach out loud, review optimal solutions and understand time complexity, do mock interview on Pramp at 3 PM, review system design basics for 1 hour, update notes on common patterns, schedule another practice session for Thursday.' }
      ];

      const today = new Date();
      const fourMonthsAgo = new Date();
      fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

      let carryOverTasks: Array<{ title: string; description: string }> = [];

      // Generate tasks for each day
      for (let d = new Date(fourMonthsAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const isToday = dateStr === today.toISOString().split('T')[0];

        const tasksForDay: Array<{ title: string; description: string; status: number }> = [];

        // Add carry-over tasks from previous day (overdue tasks)
        for (const carryOver of carryOverTasks) {
          tasksForDay.push({
            ...carryOver,
            status: isToday ? TaskStatus.Overdue : (Math.random() > 0.3 ? TaskStatus.Done : TaskStatus.Overdue)
          });
        }

        // Fill remaining slots with new tasks
        const remainingSlots = 3 - tasksForDay.length;
        for (let i = 0; i < remainingSlots; i++) {
          const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
          let status: number;

          if (isToday) {
            // Today: mix of open and overdue
            status = Math.random() > 0.7 ? TaskStatus.Overdue : TaskStatus.Open;
          } else {
            // Past days: done or overdue
            status = Math.random() > 0.2 ? TaskStatus.Done : TaskStatus.Overdue;
          }

          tasksForDay.push({
            title: template.title,
            description: template.description,
            status
          });
        }

        // Save tasks for this day
        for (const taskData of tasksForDay) {
          await storageServ.addTask({
            title: taskData.title,
            description: taskData.description,
            status: taskData.status,
            creation_date: dateStr,
            active: 1
          } as any);
        }

        // Prepare carry-over tasks for next day (overdue tasks)
        carryOverTasks = tasksForDay
          .filter(t => t.status === TaskStatus.Overdue)
          .slice(0, 1) // Carry over max 1 overdue task
          .map(t => ({ title: t.title, description: t.description }));
      }

      Toast.show({
        text: 'Sample data generated successfully!',
        duration: 'long'
      });

      // Reload tasks
      await loadAllTasks();
    } catch (error) {
      Toast.show({
        text: `Error generating data: ${error}`,
        duration: 'long'
      });
    }
  };

  const sendTestNotification = async (type: string) => {
    try {
      // Request permissions if needed
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        Toast.show({
          text: 'Notification permission not granted',
          duration: 'long'
        });
        return;
      }

      let notificationId: number;
      let title: string;
      let body: string;

      switch (type) {
        case 'startOfDay':
          notificationId = 1;
          title = '🌅 Good Morning!';
          body = 'A new day, a new opportunity. What are your three most important goals today?';
          break;
        case 'endOfDay':
          notificationId = 2;
          title = '🌙 Day Complete';
          body = 'Time to rest and recharge. Reflect on what you accomplished today.';
          break;
        case 'oneHourBefore':
          notificationId = 3;
          title = '⏰ One Hour Left';
          body = 'The day is almost over. Make this final hour count!';
          break;
        case 'intermediate':
          notificationId = 4;
          title = '💪 Keep Going!';
          body = 'You\'re doing great. Stay focused on your three goals.';
          break;
        case 'review':
          notificationId = 100;
          title = '🎉 All Goals Complete!';
          body = 'Amazing work! You crushed all three goals. See how far you\'ve come.';
          break;
        default:
          return;
      }

      // Schedule notification for immediate delivery (1 second from now)
      const now = new Date();
      now.setSeconds(now.getSeconds() + 1);

      await LocalNotifications.schedule({
        notifications: [{
          id: notificationId,
          title: title,
          body: body,
          schedule: {
            at: now
          }
        }]
      });

      Toast.show({
        text: `${type} notification sent!`,
        duration: 'short'
      });
    } catch (error) {
      Toast.show({
        text: `Error: ${error}`,
        duration: 'long'
      });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Debug Database</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IonSpinner />
          </div>
        ) : (
          <>
            <IonCard>
              <IonCardHeader
                onClick={() => setShowDatabaseSummary(!showDatabaseSummary)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <IonCardTitle>Database Summary</IonCardTitle>
                  <IonIcon icon={showDatabaseSummary ? chevronUpOutline : chevronDownOutline} />
                </div>
              </IonCardHeader>
              {showDatabaseSummary && (
                <IonCardContent>
                  <p>Total tasks: {allTasks.length}</p>
                  <p>Dates with tasks: {Object.keys(groupedByDate).length}</p>
                  <p>Dates: {Object.keys(groupedByDate).sort().reverse().join(', ')}</p>
                </IonCardContent>
              )}
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Premium Settings</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem lines="none">
                  <IonLabel>
                    <h3>Premium Status</h3>
                    <p>{isPremium ? 'Enabled' : 'Disabled'}</p>
                  </IonLabel>
                  <IonToggle
                    slot="end"
                    checked={isPremium}
                    onIonChange={(e) => handlePremiumToggle(e.detail.checked)}
                  />
                </IonItem>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>IAP Products</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p style={{ fontSize: '13px', marginBottom: '12px' }}>
                  <strong>Configuration:</strong>
                </p>
                <div style={{ marginBottom: '12px', padding: '8px', background: 'var(--ion-color-light)', borderRadius: '4px' }}>
                  <p style={{ fontSize: '11px', margin: '2px 0' }}>
                    Production IAP: {SUBSCRIPTION_CONFIG.ENABLE_PRODUCTION_IAP ? '✅ Enabled' : '❌ Disabled'}
                  </p>
                  <p style={{ fontSize: '11px', margin: '6px 0 2px 0', fontWeight: 'bold' }}>
                    Expected Product IDs:
                  </p>
                  <p style={{ fontSize: '10px', margin: '2px 0', wordBreak: 'break-all', paddingLeft: '8px' }}>
                    • {SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL}
                  </p>
                  <p style={{ fontSize: '10px', margin: '2px 0', wordBreak: 'break-all', paddingLeft: '8px' }}>
                    • {SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME}
                  </p>
                </div>

                <IonButton expand="block" onClick={loadIAPProducts} disabled={loadingProducts}>
                  {loadingProducts ? (
                    <>
                      <IonSpinner name="crescent" style={{ marginRight: '8px', width: '16px', height: '16px' }} />
                      Fetching...
                    </>
                  ) : (
                    'Fetch Products from Store'
                  )}
                </IonButton>

                {!loadingProducts && (
                  <>
                    {iapProducts.length > 0 ? (
                      <>
                        <p style={{ marginTop: '15px', fontSize: '13px', fontWeight: 'bold', color: 'var(--ion-color-success)' }}>
                          ✅ Products Loaded: {iapProducts.length}
                        </p>
                        {iapProducts.map((product, index) => (
                          <div key={index} style={{ marginTop: '10px', padding: '10px', background: 'var(--ion-color-light)', borderRadius: '8px', border: '1px solid var(--ion-color-success)' }}>
                            <p style={{ fontSize: '12px', margin: '2px 0', fontWeight: 'bold' }}>
                              {product.title}
                            </p>
                            <p style={{ fontSize: '10px', margin: '4px 0 2px 0', wordBreak: 'break-all', opacity: 0.7 }}>
                              ID: {product.id}
                            </p>
                            <p style={{ fontSize: '11px', margin: '4px 0 2px 0' }}>
                              Price: {product.price}
                            </p>
                            <p style={{ fontSize: '10px', margin: '2px 0', opacity: 0.7 }}>
                              {product.description}
                            </p>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div style={{ marginTop: '15px', padding: '12px', background: 'var(--ion-color-light)', borderRadius: '8px', border: '1px solid var(--ion-color-warning)' }}>
                        <p style={{ fontSize: '12px', margin: '0', color: 'var(--ion-color-warning)' }}>
                          ⚠️ No products loaded
                        </p>
                        <p style={{ fontSize: '11px', margin: '6px 0 0 0', opacity: 0.8 }}>
                          Products may not be configured in App Store Connect or haven't synced yet (2-6 hours after creation).
                        </p>
                      </div>
                    )}
                  </>
                )}
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Test Notifications</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p style={{ marginBottom: '12px', fontSize: '14px', opacity: 0.7 }}>
                  Send test notifications to preview all message types
                </p>
                <IonButton
                  expand="block"
                  onClick={() => sendTestNotification('startOfDay')}
                  style={{ marginBottom: '8px' }}
                >
                  🌅 Start of Day
                </IonButton>
                <IonButton
                  expand="block"
                  onClick={() => sendTestNotification('intermediate')}
                  style={{ marginBottom: '8px' }}
                >
                  💪 Intermediate
                </IonButton>
                <IonButton
                  expand="block"
                  onClick={() => sendTestNotification('oneHourBefore')}
                  style={{ marginBottom: '8px' }}
                >
                  ⏰ One Hour Before
                </IonButton>
                <IonButton
                  expand="block"
                  onClick={() => sendTestNotification('review')}
                  color="success"
                  style={{ marginBottom: '8px' }}
                >
                  🎉 Review (Premium)
                </IonButton>
                <IonButton
                  expand="block"
                  onClick={() => sendTestNotification('endOfDay')}
                  style={{ marginBottom: '8px' }}
                >
                  🌙 End of Day
                </IonButton>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Debug Navigation</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p style={{ marginBottom: '12px', fontSize: '14px', opacity: 0.7 }}>
                  Quick access to premium features for testing
                </p>
                <IonButton
                  expand="block"
                  color="primary"
                  onClick={() => history.push('/review')}
                >
                  Open Statistics Page
                </IonButton>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Sample Data Generator</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p style={{ marginBottom: '12px', fontSize: '14px', opacity: 0.7 }}>
                  Generate 4 months of realistic task data for testing statistics and charts
                </p>
                <IonButton
                  expand="block"
                  color="warning"
                  onClick={generateSampleData}
                >
                  Generate Sample Data (4 Months)
                </IonButton>
                <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--ion-color-danger)' }}>
                  ⚠️ Warning: This will delete all existing tasks
                </p>
              </IonCardContent>
            </IonCard>

            {Object.keys(groupedByDate)
              .sort()
              .reverse()
              .map(date => (
                <IonCard key={date}>
                  <IonCardHeader>
                    <IonCardTitle>{date} ({groupedByDate[date].length} tasks)</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      {groupedByDate[date].map(obj => (
                        <IonItem key={obj.id}>
                          <IonLabel>
                            <h3>{obj.title}</h3>
                            <p>ID: {obj.id}</p>
                            <p>Description: {obj.description || '(none)'}</p>
                            <p>Active: {obj.active}</p>
                          </IonLabel>
                          <IonBadge
                            slot="end"
                            color={getStatusColor(obj.status)}
                            onClick={() => handleOpenStatusPicker(obj)}
                            style={{ cursor: 'pointer', minWidth: '80px', textAlign: 'center' }}
                          >
                            {getStatusLabel(obj.status)}
                          </IonBadge>
                          <IonButton
                            slot="end"
                            color="danger"
                            fill="clear"
                            onClick={() => handleDeleteTask(obj.id, obj.title)}
                          >
                            Delete
                          </IonButton>
                        </IonItem>
                      ))}
                    </IonList>
                  </IonCardContent>
                </IonCard>
              ))}

            {allTasks.length === 0 && (
              <IonCard>
                <IonCardContent>
                  <p>No tasks found in database.</p>
                </IonCardContent>
              </IonCard>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Debug;
