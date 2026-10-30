// src/lib/content.js

export const siteContent = {
  // Add this new links object
  links: {
    whatsappCommunity: "https://chat.whatsapp.com/CZux2bHuhFWHWM7LTz9LcR",
    whatsappMoralCircle: "https://chat.whatsapp.com/IuafGYgWDRiI3UGY300Ute",
    instagram: "https://www.instagram.com/ssfnitc/",
    linkedin: "https://linkedin.com",
    youtube: "https://youtube.com/@SSFNITCALICUT",
    email: "ssfnitcalicut@gmail.com",
    phone: "+91 99487 69318 / +91 95624 70788",
    address: "SDC Secretariat, Alqamar, Companymukk, Kerala - 673601",
    timing: "Circles: Wed 6:30 PM (Alqamar) & Fri 1:00 PM"
  },
  
  donate: {
    hero: {
      tag: "Mutual-Aid",
      title: "SDC Organizational Fund",
      description: "Fund required for organizing events, providing refreshments, etc. Also we conduct daily ifthar in Ramadan. Current contribution will also be involved in the construction of Zahra Centre. Our prayers will be with you."
    },
    upi: {
      badge: "INSTANT UPI SCAN",
      qrImage: "/resources/images/donate-qr.jpeg",
      upiId: "shadilkavanancheri34@okhdfcbank",
      hint: "Scan via Google Pay, PhonePe or Paytm."
    },
    bank: {
      title: "Bank Details",
      accountName: "Muhammed Shadhil KC",
      bankName: "State Bank of India (SBI)",
      branch: "Manjeri",
      accountNumber: "37097329937",
      ifscCode: "SBIN00029937"
    },
    accountability: {
      title: "Strict Confidentiality & Audit",
      description: "The identity of aid recipients is held strictly confidential by the SDC Executive Board to safeguard student dignity. Accounts are audited annually by the Advisory Council."
    }
  },


  // ... Keep all your existing tickerText, hero, metrics, etc. below here ...

  tickerText: "CELEBRATING 15+ YEARS OF MORAL GUIDANCE, STUDENT EMPOWERMENT & EXCELLENCE AT NIT CALICUT • WEEKLY MORAL CIRCLES",
  
  hero: {
    badgeText: "JOIN THE JOURNEY TO ENRICH AND HAVE COMPLETE MINDFULNESS",
    titleStart: "Nurturing Moral Character, Academic Mastery &",
    titleHighlight: "Future Leaders.",
    description: "Working as a community outside NIT Calicut for better advancements in career, network and have great opportunities to leverage your intellectual level. Weekly moral mindful sessions namely 'Essence of Mahabba'. Regular gatherings to share the weights and be free. Supported by alumnus."
  },

  metrics: [
    { target: 15, suffix: "+", title: "Years Campus Legacy", desc: "Continuous Mentorship", accent: "emerald" },
    { target: 750, suffix: "+", title: "Scholars Guided", desc: "B.Tech, M.Tech & Ph.D", accent: "navy" },
    { target: 100, suffix: "+", title: "Alumni in Various Industries", desc: "Meesho, BPCL, ISRO", accent: "emerald" },
    { target: 500, suffix: "+", title: "Moral Circles Held", desc: "Weekly Classes", accent: "amber" }
  ],

  recentEvents: [
    { year: "Weekly", title: "Essence of Mahabba", desc: "Weekly moral classes led by CM Sabir Saqafi (Research Scholar, NITC) at Alqamar, Companymukk" },
    { year: "Sep 16", title: "Turn A Page", desc: "Conducted fresher's meet to newly admitted B26 students. Mudassir (Research Scholar, NITC), Munaver lead the sessions." },
    { year: "Sep 03", title: "The Solace", desc: "Grand Mawlid gathering conducted at Alqamar, Companymukk as part of Meeladunnabi (SAW) celebrations. Jabir Kanthapuram led a mindful session." },
    { year: "June 11", title: "Sahityotsav", desc: "Became a part of the biggest Art and Literature festival conducted across world wide. Students from NITC actively participated." },
    { year: "Apr 03", title: "Rihla", desc: "Had a 2 days enjoying trip from NIT to various locations, including Kadalundi, Markaz Knowledge City, etc." }
  ],

  pillars: [
    {
      category: "moral",
      num: "Pillar 01",
      time: "Every Wednesday 6.30 PM",
      title: "Weekly Moral Classes & Values Education",
      text: "Held every Wednesday 6.30 PM at Alqamar, Companymukk. Cultivating inner balance, ethical conviction, and spiritual mindfulness amid demanding engineering coursework.",
      footer: "Alqamar, Companymukk"
    },
    {
      category: "academics",
      num: "Pillar 02",
      time: "Archived Repository",
      title: "Academic Support & Question Bank",
      text: "Comprehensive coverage across 12 NITC Departments. Curated previous year question papers (PYQs), topper handwritten notes, and peer-to-peer crash workshops ahead of Mid & End-Semesters.",
      footer: "12 Departments Covered"
    },
    {
      category: "career",
      num: "Pillar 03",
      time: "Industry Ready",
      title: "Career Guidance, Placements & GATE/CAT",
      text: "Sessions on Placement related and create supportive environment for cracking competitive exams like GATE/CAT. Opportunities for emerging startup ventures.",
      footer: "Alumni Network"
    },
    {
      category: "moral",
      num: "Pillar 04",
      time: "Help Desk",
      title: "Mental Health & Campus Well-being",
      text: "Safe, judgment-free spaces with senior student mentors to talk through exam stress, hostel adaptation, personal grief, and relational pressures with total discretion and empathy.",
      footer: "Peer Helpdesk Active"
    }
  ],

  gallery: [
    { src: "/resources/images/mawlid.jpeg", title: "Mawlid Congregation", tag: "Alqamar Masjid" },
    { src: "/resources/images/mahabba.jpeg", title: "Essence of Mahabba", tag: "Weekly Moral Class" },
    { src: "/resources/images/rihla4.jpeg", title: "Rihla 2.0", tag: "2-Day Camp" },
    { src: "/resources/images/rihla2.jpeg", title: "Rihla 2.0", tag: "2-Day Camp" }
  ],

  galleryPage: {
    header: {
      tag: "Visual Archive",
      title: "Campus Memories & Events",
      description: "A glimpse into community living, grand Iftars, academic workshops, and our weekly moral circles."
    },
    // Categories for the filter tabs
    categories: ["All", "Events", "Moral Classes", "Trips & Camps"],
    // Simulated database rows
    images: [
      { id: 1, src: "/resources/images/mawlid.jpeg", title: "Mawlid Congregation", category: "Events", tag: "Alqamar Masjid" },
      { id: 2, src: "/resources/images/mahabba.jpeg", title: "Essence of Mahabba", category: "Moral Classes", tag: "Weekly Class" },
      { id: 3, src: "/resources/images/rihla4.jpeg", title: "Rihla 2.0 Journey", category: "Trips & Camps", tag: "Kadalundi" },
      { id: 4, src: "/resources/images/rihla2.jpeg", title: "Alumni Leadership Retreat", category: "Trips & Camps", tag: "2-Day Camp" },
      // Note: You can add more images here later or reuse existing ones for now to test the grid
      { id: 5, src: "/resources/images/mawlid.jpeg", title: "Sahityotsav Participation", category: "Events", tag: "Art Fest" },
      { id: 6, src: "/resources/images/mahabba.jpeg", title: "Turn A Page", category: "Events", tag: "Fresher's Meet" }
    ]
  },

  questionBankPage: {
    header: {
      tag: "Academic Archive",
      title: "SDC Question Bank",
      description: "Access previous year question papers, notes, and study materials across all departments."
    },
    // Filter Options
    departments: ["All", "Computer Science", "Electrical", "Electronics", "Mechanical", "Civil", "Chemical", "Architecture", "Mathematics"],
    semesters: ["All", "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "Elective"],
  }
};