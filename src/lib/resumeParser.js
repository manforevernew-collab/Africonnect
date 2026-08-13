// AI Resume Parser - Client-side skill extraction
// Handles PDFs, DOCs, and plain text

const SKILL_DICTIONARY = {
  // Programming Languages
  'javascript': 'JavaScript', 'js': 'JavaScript', 'typescript': 'TypeScript', 'ts': 'TypeScript',
  'python': 'Python', 'java': 'Java', 'c++': 'C++', 'c#': 'C#', 'csharp': 'C#',
  'go': 'Go', 'golang': 'Go', 'rust': 'Rust', 'ruby': 'Ruby', 'php': 'PHP',
  'swift': 'Swift', 'kotlin': 'Kotlin', 'scala': 'Scala', 'perl': 'Perl', 'r': 'R',
  'matlab': 'MATLAB', 'dart': 'Dart', 'lua': 'Lua', 'shell': 'Shell Scripting',
  'bash': 'Bash', 'powershell': 'PowerShell',

  // Frontend
  'react': 'React', 'react.js': 'React', 'reactjs': 'React',
  'vue': 'Vue.js', 'vue.js': 'Vue.js', 'angular': 'Angular',
  'svelte': 'Svelte', 'next.js': 'Next.js', 'nextjs': 'Next.js',
  'html': 'HTML', 'html5': 'HTML5', 'css': 'CSS', 'css3': 'CSS3',
  'sass': 'Sass', 'scss': 'SCSS', 'less': 'Less',
  'tailwind': 'Tailwind CSS', 'bootstrap': 'Bootstrap',
  'webpack': 'Webpack', 'vite': 'Vite', 'gulp': 'Gulp',
  'jquery': 'jQuery', 'redux': 'Redux', 'zustand': 'Zustand',

  // Backend
  'node.js': 'Node.js', 'nodejs': 'Node.js', 'node': 'Node.js',
  'express': 'Express.js', 'express.js': 'Express.js',
  'django': 'Django', 'flask': 'Flask', 'fastapi': 'FastAPI',
  'spring': 'Spring Boot', 'spring boot': 'Spring Boot',
  'laravel': 'Laravel', 'rails': 'Ruby on Rails',
  'asp.net': 'ASP.NET', 'asp': 'ASP.NET',
  'graphql': 'GraphQL', 'rest': 'REST API', 'restful': 'REST API',
  'soap': 'SOAP', 'grpc': 'gRPC', 'websocket': 'WebSocket',

  // Databases
  'postgresql': 'PostgreSQL', 'postgres': 'PostgreSQL',
  'mysql': 'MySQL', 'mongodb': 'MongoDB', 'mongoose': 'Mongoose',
  'redis': 'Redis', 'sqlite': 'SQLite', 'oracle': 'Oracle',
  'dynamodb': 'DynamoDB', 'cassandra': 'Cassandra', 'neo4j': 'Neo4j',
  'elasticsearch': 'Elasticsearch', 'firebase': 'Firebase',
  'supabase': 'Supabase', 'prisma': 'Prisma', 'sequelize': 'Sequelize',
  'sql': 'SQL', 'nosql': 'NoSQL',

  // DevOps / Cloud
  'aws': 'AWS', 'amazon web services': 'AWS',
  'azure': 'Azure', 'gcp': 'GCP', 'google cloud': 'GCP',
  'docker': 'Docker', 'kubernetes': 'Kubernetes', 'k8s': 'Kubernetes',
  'jenkins': 'Jenkins', 'github actions': 'GitHub Actions', 'ci/cd': 'CI/CD',
  'terraform': 'Terraform', 'ansible': 'Ansible', 'puppet': 'Puppet',
  'nginx': 'Nginx', 'apache': 'Apache',
  'linux': 'Linux', 'ubuntu': 'Ubuntu', 'centos': 'CentOS',

  // Mobile
  'react native': 'React Native', 'flutter': 'Flutter',
  'ios': 'iOS Development', 'android': 'Android Development',
  'swiftui': 'SwiftUI', 'jetpack compose': 'Jetpack Compose',

  // AI / Data
  'machine learning': 'Machine Learning', 'ml': 'Machine Learning',
  'deep learning': 'Deep Learning', 'neural networks': 'Neural Networks',
  'tensorflow': 'TensorFlow', 'pytorch': 'PyTorch', 'keras': 'Keras',
  'scikit-learn': 'Scikit-learn', 'pandas': 'Pandas', 'numpy': 'NumPy',
  'opencv': 'OpenCV', 'nlp': 'NLP', 'computer vision': 'Computer Vision',
  'data science': 'Data Science', 'data analysis': 'Data Analysis',
  'big data': 'Big Data', 'hadoop': 'Hadoop', 'spark': 'Spark',
  'tableau': 'Tableau', 'power bi': 'Power BI', 'looker': 'Looker',

  // Design
  'figma': 'Figma', 'sketch': 'Sketch', 'adobe xd': 'Adobe XD',
  'photoshop': 'Photoshop', 'illustrator': 'Illustrator',
  'ui design': 'UI Design', 'ux design': 'UX Design',
  'user research': 'User Research', 'prototyping': 'Prototyping',
  'wireframing': 'Wireframing', 'design systems': 'Design Systems',
  'accessibility': 'Accessibility', 'wcag': 'WCAG',

  // Product / Management
  'product management': 'Product Management', 'agile': 'Agile',
  'scrum': 'Scrum', 'kanban': 'Kanban', 'jira': 'Jira',
  'confluence': 'Confluence', 'trello': 'Trello', 'asana': 'Asana',
  'roadmapping': 'Roadmapping', 'okr': 'OKRs', 'kpis': 'KPIs',
  'stakeholder management': 'Stakeholder Management',
  'user stories': 'User Stories', 'product strategy': 'Product Strategy',

  // Marketing / Sales
  'digital marketing': 'Digital Marketing', 'seo': 'SEO',
  'sem': 'SEM', 'content marketing': 'Content Marketing',
  'social media': 'Social Media Marketing', 'email marketing': 'Email Marketing',
  'google analytics': 'Google Analytics', 'hubspot': 'HubSpot',
  'salesforce': 'Salesforce', 'crm': 'CRM', 'lead generation': 'Lead Generation',
  'b2b sales': 'B2B Sales', 'b2c': 'B2C Marketing',
  'copywriting': 'Copywriting', 'content strategy': 'Content Strategy',
  'brand strategy': 'Brand Strategy', 'market research': 'Market Research',

  // Finance / Business
  'financial analysis': 'Financial Analysis', 'accounting': 'Accounting',
  'bookkeeping': 'Bookkeeping', 'quickbooks': 'QuickBooks',
  'excel': 'Excel', 'google sheets': 'Google Sheets',
  'erp': 'ERP', 'sap': 'SAP', 'oracle erp': 'Oracle ERP',
  'business analysis': 'Business Analysis', 'strategy': 'Strategy',
  'consulting': 'Consulting', 'project management': 'Project Management',
  'pmp': 'PMP', 'six sigma': 'Six Sigma', 'lean': 'Lean',

  // Security
  'cybersecurity': 'Cybersecurity', 'penetration testing': 'Penetration Testing',
  'ethical hacking': 'Ethical Hacking', 'owasp': 'OWASP',
  'encryption': 'Encryption', 'ssl': 'SSL/TLS', 'oauth': 'OAuth',
  'jwt': 'JWT', 'identity management': 'Identity Management',

  // Other
  'git': 'Git', 'github': 'GitHub', 'gitlab': 'GitLab', 'bitbucket': 'BitBucket',
  'slack': 'Slack', 'microsoft teams': 'Microsoft Teams', 'zoom': 'Zoom',
  'canva': 'Canva', 'wordpress': 'WordPress',
  'shopify': 'Shopify', 'woocommerce': 'WooCommerce',
  'stripe': 'Stripe', 'paypal': 'PayPal', 'payment gateways': 'Payment Gateways',
}

// Check if text contains PDF binary markers
function isPdfBinary(text) {
  if (!text) return false
  // PDF binary files start with %PDF- and contain obj/stream markers
  return text.includes('%PDF-') || 
         text.includes('obj\n<<') || 
         text.includes('endobj') ||
         text.includes('/Type /Catalog') ||
         text.includes('/Length') ||
         text.includes('stream\n') ||
         /\d+\s+\d+\s+obj/.test(text)
}

// Clean text by removing PDF binary artifacts
function cleanPdfText(text) {
  if (!text) return ''

  // If it's clearly binary, return empty to force manual paste
  if (isPdfBinary(text)) {
    return ''
  }

  // Remove common PDF artifacts from partially-extracted text
  let cleaned = text
    .replace(/%[0-9A-Fa-f]{2}/g, ' ')  // hex encoded chars
    .replace(/\d+\s+\d+\s+obj\s*<</g, ' ')
    .replace(/endobj/g, ' ')
    .replace(/stream\s*\n/g, ' ')
    .replace(/endstream/g, ' ')
    .replace(/\/\w+\s*\(/g, ' ')
    .replace(/\)/g, ' ')
    .replace(/\[\s*\d+\s+\d+\s+\d+\s+\d+\s*\]/g, ' ')
    .replace(/\b(Title|Creator|Producer|CreationDate|ModDate|Keywords|Subject|Author)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned
}

// Extract skills from resume text
export function extractSkillsFromText(text) {
  if (!text) return []

  // Reject pure binary PDFs
  if (isPdfBinary(text)) {
    return []
  }

  const cleaned = cleanPdfText(text)
  const lowerText = cleaned.toLowerCase()
  const found = new Set()

  for (const [keyword, skillName] of Object.entries(SKILL_DICTIONARY)) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp('\\b' + escaped + '\\b', 'i')
    if (regex.test(lowerText)) {
      found.add(skillName)
    }
  }

  return Array.from(found).sort()
}

// Generate auto-summary from resume text
export function generateSummary(text, skills) {
  if (!text) return ''

  // Reject pure binary PDFs
  if (isPdfBinary(text)) {
    return ''
  }

  const cleaned = cleanPdfText(text)
  const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 10)
  const lowerText = cleaned.toLowerCase()

  // Detect role based on keywords
  let role = 'Professional'
  if (lowerText.includes('developer') || lowerText.includes('engineer')) role = 'Developer'
  else if (lowerText.includes('designer') || lowerText.includes('design')) role = 'Designer'
  else if (lowerText.includes('manager') || lowerText.includes('management')) role = 'Manager'
  else if (lowerText.includes('analyst') || lowerText.includes('analysis')) role = 'Analyst'
  else if (lowerText.includes('marketing') || lowerText.includes('marketer')) role = 'Marketer'
  else if (lowerText.includes('sales')) role = 'Sales Professional'
  else if (lowerText.includes('data scientist') || lowerText.includes('data science')) role = 'Data Scientist'

  // Detect experience level
  let experience = ''
  const yearsMatch = cleaned.match(/(\d+)\+?\s*years?\s*(of\s*)?experience/i)
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1])
    if (years >= 10) experience = 'Senior-level'
    else if (years >= 5) experience = 'Mid-level'
    else if (years >= 2) experience = 'Experienced'
    else experience = 'Entry-level'
  }

  // Build summary
  const skillStr = skills.slice(0, 5).join(', ')
  const topSentence = sentences.find(s => 
    s.length > 30 && s.length < 150 && 
    (s.toLowerCase().includes('experience') || s.toLowerCase().includes('skilled') || s.toLowerCase().includes('proficient'))
  ) || sentences[0] || ''

  let summary = ''
  if (experience) summary += `${experience} ${role}`
  else summary += `Skilled ${role}`

  if (skillStr) summary += ` with expertise in ${skillStr}`
  if (skills.length > 5) summary += ` and ${skills.length - 5} other skills`

  summary += '. '
  if (topSentence.trim()) {
    summary += topSentence.trim().replace(/^\w/, c => c.toUpperCase()) + '.'
  }

  return summary
}

// Read file as text
export async function readFileAsText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsText(file)
  })
}

// Check if file is a PDF
export function isPdfFile(file) {
  if (!file) return false
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}
