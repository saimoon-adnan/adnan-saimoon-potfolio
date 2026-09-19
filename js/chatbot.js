/* =====================================================================
   SAIMOON'S AI CHATBOT — 100% FREE, NO API
   Drop in js/ folder. Add before </body>: <script src="js/chatbot.js"></script>
   ===================================================================== */
(function () {

  /* =====================================================================
     LIVE DATA — auto-updates from the real pages, no JS edits needed.
     On load, fetches certificates.html, projects.html, skills.html,
     about.html and blog.html, and scrapes their content. Edit those
     HTML files (add a cert, change your bio, swap the CV link, write a
     new blog post) and the chatbot picks it up automatically — chatbot.js
     itself never needs to change again.
     If a fetch fails (e.g. opened as a local file:// instead of via a
     real host/server), that topic silently falls back to the static
     text below so the chatbot still works.
     ===================================================================== */
  var LIVE = { certs: null, projects: null, skills: null, about: null, contact: null, extracurricular: null, blog: null, cv: null };

  function fetchDoc(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('fetch failed: ' + url);
      return r.text();
    }).then(function (html) {
      return new DOMParser().parseFromString(html, 'text/html');
    });
  }

  function clean(s) { return s.replace(/\s+/g, ' ').trim(); }

  function buildCerts(doc) {
    var cards = doc.querySelectorAll('.cert-card');
    if (!cards.length) return null;
    var lines = [];
    cards.forEach(function (c) {
      var title = c.querySelector('h3');
      var issuer = c.querySelector('.pill');
      if (title) lines.push('• ' + clean(title.textContent) + (issuer ? ' (' + clean(issuer.textContent) + ')' : ''));
    });
    return "**Certifications** (" + cards.length + ")\n\n" + lines.join('\n');
  }

  function buildProjects(doc) {
    var cards = doc.querySelectorAll('.proj-card');
    if (!cards.length) return null;
    var blocks = [];
    cards.forEach(function (c, i) {
      var title = c.querySelector('h3');
      var desc = c.querySelector('p');
      var link = c.querySelector('a[href]');
      if (!title) return;
      var t = (i + 1) + '. ' + clean(title.textContent);
      if (desc) t += ' — ' + clean(desc.textContent);
      if (link) t += '\n' + link.getAttribute('href');
      blocks.push(t);
    });
    return "**Data Analytics Projects** (" + cards.length + ")\n\n" + blocks.join('\n\n');
  }

  function buildSkills(doc) {
    var groups = doc.querySelectorAll('.card h3');
    if (!groups.length) return null;
    var blocks = [];
    groups.forEach(function (h3) {
      var group = h3.closest('.card');
      if (!group) return;
      var pills = group.querySelectorAll('.pill');
      if (!pills.length) return;
      var names = [];
      pills.forEach(function (p) { names.push(clean(p.textContent)); });
      blocks.push('• ' + clean(h3.textContent) + ': ' + names.join(', '));
    });
    return "**Technical Skills**\n\n" + blocks.join('\n');
  }

  // shared by about/education/location/available/cv — all read from about.html
  function scrapeAboutInfo(doc) {
    var bioParas = doc.querySelectorAll('main p.body-text');
    var bio = Array.prototype.map.call(bioParas, function (p) { return clean(p.textContent); }).join(' ');
    var info = {};
    doc.querySelectorAll('.text-faint').forEach(function (label) {
      var val = label.nextElementSibling;
      if (val) info[clean(label.textContent)] = clean(val.textContent);
    });
    var cvLink = null;
    doc.querySelectorAll('a.btn').forEach(function (a) {
      if (/download cv/i.test(a.textContent)) cvLink = a.getAttribute('href');
    });
    return { bio: bio, info: info, cvLink: cvLink };
  }

  function buildAbout(parsed) {
    if (!parsed.bio) return null;
    var lines = [];
    ['Focus', 'Education', 'Location'].forEach(function (k) {
      if (parsed.info[k]) lines.push(k + ': ' + parsed.info[k]);
    });
    return "**About Saimoon**\n\n" + parsed.bio + (lines.length ? '\n\n' + lines.join('\n') : '');
  }

  function buildEducation(parsed) {
    if (!parsed.info['Education']) return null;
    var txt = "**Education**\n\nPursuing " + parsed.info['Education'];
    if (parsed.info['Location']) txt += ", based in " + parsed.info['Location'] + ".";
    return txt;
  }

  function buildAvailability(parsed) {
    if (!parsed.info['Availability']) return null;
    var txt = "**Availability**\n\n" + parsed.info['Availability'] + ".";
    if (parsed.info['Focus']) txt += "\nFocus: " + parsed.info['Focus'];
    return txt;
  }

  function buildLocation(parsed) {
    if (!parsed.info['Location']) return null;
    return "**Location**\n\n" + parsed.info['Location'] + ". Available for remote work globally too.";
  }

  function buildCV(parsed) {
    if (!parsed.cvLink) return null;
    return "**CV / Resume**\n\n" + parsed.cvLink;
  }

  function buildExtracurricular(doc) {
    var panels = doc.querySelectorAll('[data-sim-panel]');
    if (!panels.length) return null;
    var blocks = [];
    panels.forEach(function (panel) {
      var h3 = panel.querySelector('h3');
      var meta = panel.querySelector('p');
      if (!h3) return;
      var text = clean(h3.textContent);
      if (meta) text += '\n' + clean(meta.textContent);
      panel.querySelectorAll('li').forEach(function (li) { text += '\n• ' + clean(li.textContent).replace(/^—\s*/, ''); });
      blocks.push(text);
    });
    return "**Job Simulations** (" + panels.length + ")\n\n" + blocks.join('\n\n');
  }

  // contact links live in the footer, present on every page
  function buildContact(doc) {
    var links = {};
    doc.querySelectorAll('.footer__contact-item, .footer__social-btn').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href.indexOf('mailto:') === 0) links.email = href.replace('mailto:', '');
      else if (href.indexOf('wa.me') !== -1) links.whatsapp = href;
      else if (href.indexOf('github.com') !== -1) links.github = href;
      else if (href.indexOf('linkedin.com') !== -1) links.linkedin = href;
      else if (href.indexOf('facebook.com') !== -1) links.facebook = href;
      else if (href.indexOf('x.com') !== -1 || href.indexOf('twitter.com') !== -1) links.x = href;
    });
    if (!links.email) return null;
    var out = "**Contact**\n\nEmail: " + links.email;
    if (links.whatsapp) out += "\nWhatsApp: " + links.whatsapp;
    if (links.linkedin) out += "\nLinkedIn: " + links.linkedin;
    if (links.github) out += "\nGitHub: " + links.github;
    out += "\n\nOpen to internships, freelance and full-time roles.";
    LIVE.socials = "**Social Links**\n\n"
      + (links.github ? "GitHub: " + links.github + "\n" : "")
      + (links.linkedin ? "LinkedIn: " + links.linkedin + "\n" : "")
      + (links.facebook ? "Facebook: " + links.facebook + "\n" : "")
      + (links.x ? "X (Twitter): " + links.x + "\n" : "")
      + (links.email ? "Email: " + links.email : "");
    LIVE.emailRaw = links.email;
    LIVE.whatsappRaw = links.whatsapp;
    return out;
  }

  function buildBlog(doc) {
    var post = doc.querySelector('main article.card h2');
    if (!post) return null;
    var article = post.closest('article');
    var excerpt = article.querySelector('p');
    var tags = [];
    article.querySelectorAll('.pill').forEach(function (p) { if (!/featured/i.test(p.textContent)) tags.push(clean(p.textContent)); });
    var out = "**Blog**\n\n\"" + clean(post.textContent) + "\"";
    if (excerpt) out += "\n\n" + clean(excerpt.textContent);
    if (tags.length) out += "\n\nTopics: " + tags.join(', ');
    return out;
  }

  // ── whole-site search index — a lightweight "brain" over every page,
  // so questions the fixed topics above don't cover can still be answered
  // from whatever text actually exists on the site.
  var SEARCH_INDEX = [];

  function extractSections(doc, pageLabel) {
    var main = doc.querySelector('main') || doc.body;
    if (!main) return [];
    var els = main.querySelectorAll('h1, h2, h3, p, li');
    var sections = [], current = null;
    els.forEach(function (el) {
      var text = clean(el.textContent);
      if (!text) return;
      if (/^H[1-3]$/.test(el.tagName)) {
        current = { heading: text, body: [], page: pageLabel };
        sections.push(current);
      } else {
        if (!current) { current = { heading: pageLabel, body: [], page: pageLabel }; sections.push(current); }
        if (current.body.length < 6) current.body.push(text);
      }
    });
    return sections.map(function (s) { return { heading: s.heading, body: s.body.join(' '), page: s.page }; });
  }

  function searchSite(rawQuery) {
    var words = rawQuery.toLowerCase().split(/[^a-z0-9]+/).filter(function (w) { return w.length > 2; });
    if (!words.length || !SEARCH_INDEX.length) return null;
    var best = null, bestScore = 0;
    SEARCH_INDEX.forEach(function (sec) {
      var hay = (sec.heading + ' ' + sec.body).toLowerCase();
      var score = 0;
      words.forEach(function (w) { if (hay.indexOf(w) !== -1) score += w.length; });
      if (score > bestScore) { bestScore = score; best = sec; }
    });
    if (bestScore < 6 || !best || !best.body) return null;
    var snippet = best.body.length > 320 ? best.body.slice(0, 320).replace(/\s+\S*$/, '') + '…' : best.body;
    return "**" + best.heading + "**\n\n" + snippet;
  }

  var LIVE_READY = Promise.all([
    fetchDoc('certificates.html').then(function (doc) {
      LIVE.certs = buildCerts(doc);
      LIVE.contact = buildContact(doc);
      SEARCH_INDEX = SEARCH_INDEX.concat(extractSections(doc, 'Certificates'));
    }).catch(function () {}),
    fetchDoc('projects.html').then(function (doc) {
      LIVE.projects = buildProjects(doc);
      SEARCH_INDEX = SEARCH_INDEX.concat(extractSections(doc, 'Projects'));
    }).catch(function () {}),
    fetchDoc('skills.html').then(function (doc) {
      LIVE.skills = buildSkills(doc);
      SEARCH_INDEX = SEARCH_INDEX.concat(extractSections(doc, 'Skills'));
    }).catch(function () {}),
    fetchDoc('about.html').then(function (doc) {
      var parsed = scrapeAboutInfo(doc);
      LIVE.about = buildAbout(parsed);
      LIVE.education = buildEducation(parsed);
      LIVE.availability = buildAvailability(parsed);
      LIVE.location = buildLocation(parsed);
      LIVE.cv = buildCV(parsed);
      LIVE.extracurricular = buildExtracurricular(doc);
      SEARCH_INDEX = SEARCH_INDEX.concat(extractSections(doc, 'About'));
    }).catch(function () {}),
    fetchDoc('blog.html').then(function (doc) {
      LIVE.blog = buildBlog(doc);
      SEARCH_INDEX = SEARCH_INDEX.concat(extractSections(doc, 'Blog'));
    }).catch(function () {}),
    fetchDoc('contact.html').then(function (doc) {
      SEARCH_INDEX = SEARCH_INDEX.concat(extractSections(doc, 'Contact'));
    }).catch(function () {}),
    fetchDoc('index.html').then(function (doc) {
      SEARCH_INDEX = SEARCH_INDEX.concat(extractSections(doc, 'Home'));
    }).catch(function () {})
  ]).then(function () {
    // cross-page enrichment — runs only after every fetch has settled,
    // so it's safe to combine data scraped from different pages
    if (LIVE.availability && LIVE.emailRaw) {
      LIVE.availability += "\n\nReach out: " + LIVE.emailRaw + (LIVE.whatsappRaw ? "  ·  " + LIVE.whatsappRaw : "");
    }
  }).catch(function () { /* whatever failed just falls back to static */ });

  var KB = [
    {
      keys: ['skill','tech','language','tool','know','use','python','sql','power bi','excel','javascript','c++','pandas','numpy','dokkhota','ki jane','ki pare','ki ki pare','skill ki'],
      dynamic: function () { return LIVE.skills; },
      answer: "**Technical Skills**\n\n• Languages: Python, SQL, JavaScript, C++\n• Libraries: Pandas, NumPy\n• Visualization: Power BI, Excel\n• Tools: VS Code, Git, Jupyter Notebook"
    },
    {
      keys: ['project','build','work done','portfolio project','his project','show project','challenging project','difficult project','hardest project','toughest project','biggest project','project you worked on','worked on a project','projekt','ki kaj korse','ki kaj korche','kaj dekhte chai'],
      dynamic: function () { return LIVE.projects; },
      answer: "**Data Analytics Projects** (3)\n\n1. Netflix Movie Data Analysis — 9,000+ movies, Python & Pandas\nhttps://github.com/saimoon-adnan/Netflix-Movie-Data-Analysis-Project-using-Python\n\n2. Quantium Retail Analytics — 260K+ transactions, Store 77 had +29.1% uplift\nhttps://github.com/saimoon-adnan/Quantium-Retail-Analytics-by-using-python\n\n3. Zepto E-commerce Inventory Analysis — SQL-based insights\nhttps://github.com/saimoon-adnan/Zepto-E-commerce-SQL-Data-Analysis-Project"
    },
    {
      keys: ['netflix'],
      answer: "**Netflix Movie Data Analysis**\n\nAnalyzed 9,000+ Netflix movies using Python, Pandas, NumPy, Matplotlib.\n\n• Drama is the most frequent genre\n• Popular movies ≠ highest-rated\n• Visualized release trends by year\n\nhttps://github.com/saimoon-adnan/Netflix-Movie-Data-Analysis-Project-using-Python"
    },
    {
      keys: ['quantium','retail','store trial','store 77','uplift'],
      answer: "**Quantium Retail Analytics**\n\nAnalyzed 260K+ retail transactions.\n\n• Store 77: +29.1% sales uplift\n• Store 86: +9.8% uplift\n• Top segment: Mainstream Young Singles/Couples\n• Top brands: Kettle, Pringles, Doritos\n\nhttps://github.com/saimoon-adnan/Quantium-Retail-Analytics-by-using-python"
    },
    {
      keys: ['zepto','inventory','sql project','ecommerce'],
      answer: "**Zepto E-commerce Inventory Analysis**\n\nSQL-based project:\n• Cleaned raw inventory data\n• Explored pricing and stock trends\n• Generated business insights for inventory decisions\n\nhttps://github.com/saimoon-adnan/Zepto-E-commerce-SQL-Data-Analysis-Project"
    },
    {
      keys: ['certificate','certification','course','forage','sololearn','simplilearn','certificate ache','course korse','kono certificate'],
      dynamic: function () { return LIVE.certs; },
      answer: "**Certifications** (11)\n\n• Quantium Data Analytics (Forage)\n• EA Product Management (Forage)\n• Python Developer (SoloLearn)\n• SQL Intermediate (SoloLearn)\n• Microsoft Power BI (Skill Course)\n• Microsoft Excel (Skill Course)\n• Data Analytics & Power BI (Interactive Cares)\n• Inventory Management (HP Foundation)\n• Supply Chain Management (Simplilearn)\n• Prompt Engineering (Simplilearn)\n• SQL Micro Course (Skill Course)"
    },
    {
      keys: ['contact','email','reach','message','whatsapp','gmail','how to contact','get in touch','jogajog','jogajog korbo','number dao','email address','kotha bolte chai','kivabe jogajog'],
      dynamic: function () { return LIVE.contact; },
      answer: "**Contact**\n\nEmail: adnansaimoon@gmail.com\nLinkedIn: linkedin.com/in/saimoon-adnan-771079322\nWhatsApp: wa.me/8801600627822\nGitHub: github.com/saimoon-adnan\n\nOpen to internships, freelance and full-time roles."
    },
    {
      keys: ['github','linkedin','facebook','twitter','x/twitter','social','link','social media'],
      dynamic: function () { return LIVE.socials; },
      answer: "**Social Links**\n\nGitHub: github.com/saimoon-adnan\nLinkedIn: linkedin.com/in/saimoon-adnan-771079322\nFacebook: facebook.com/adnan.irfan.1213\nX (Twitter): x.com/OnlySaimon\nEmail: adnansaimoon@gmail.com"
    },
    {
      keys: ['who is','about saimoon','about him','tell me about','introduce','who are you','describe him','shomporke bolo','tar shomporke','ke o','shomporke bolen','focus area','main focus'],
      dynamic: function () { return LIVE.about; },
      answer: "**About Saimoon Ahmed Adnan**\n\nComputer Science student and aspiring Product Data Analyst based in Dhaka, Bangladesh.\n\nSpecializes in SQL, Python, Power BI, and Product Analytics — transforming raw data into actionable insights.\n\nCurrently open to internships and full-time opportunities."
    },
    {
      keys: ['education','study','university','cse','degree','student','background','ki poreche','porashuna','kon university'],
      dynamic: function () { return LIVE.education; },
      answer: "**Education**\n\nPursuing a B.Sc. in Computer Science and Engineering (CSE), based in Dhaka, Bangladesh.\n\nAlongside his degree, he's completed 11 certifications and 2 Forage job simulations."
    },
    {
      keys: ['available','hire','open to work','opportunity','job','intern','freelance','job korte parbe','kaj korte ready','niyog','chakri','available ache'],
      dynamic: function () { return LIVE.availability; },
      answer: "**Availability**\n\nCurrently open to work.\n\n• Internships\n• Freelance projects\n• Full-time opportunities\n\nFocus: Data Analytics, Product Analytics, Data Science\n\nadnansaimoon@gmail.com  ·  wa.me/8801600627822"
    },
    {
      keys: ['blog','article','writing','post','read his'],
      dynamic: function () { return LIVE.blog; },
      answer: "**Blog**\n\n\"How Data Drives Better Product Decisions\"\n\nCovers product metrics, a food delivery case study, common analytics mistakes, and tools like SQL, Python, Power BI.\n\nCheck the Blog section in the nav."
    },
    {
      keys: ['extracurricular','extra curricular','simulation','electronic arts','ea product'],
      dynamic: function () { return LIVE.extracurricular; },
      answer: "**Job Simulations** (2)\n\nProduct Management — Electronic Arts (March 2026)\n• KPI framework for a strategy RPG mobile game\n\nData Analytics — Quantium (June 2026)\n• Transaction analytics & benchmark store analysis"
    },
    {
      keys: ['location','where','country','bangladesh','dhaka','based in','kothay thake','kon desh','kothay thako'],
      dynamic: function () { return LIVE.location; },
      answer: "**Location**\n\nDhaka, Bangladesh. Available for remote work globally too."
    },
    {
      keys: ['cv','resume','download cv','cv ta dao','resume ta dao','cv dorkar'],
      dynamic: function () { return LIVE.cv; },
      answer: "**CV / Resume**\n\nAvailable on the About page — click 'About' in the navigation, then 'Download CV'."
    },
    {
      keys: ['what is a data analyst','what does a data analyst do','role of a data analyst','data analyst role'],
      answer: "**What a Data Analyst Does**\n\nA data analyst collects, cleans, and interprets data to help a business make better decisions — spotting trends, building dashboards, and turning raw numbers into a clear story.\n\nThat's exactly the work Saimoon does: SQL for querying, Python/Pandas for analysis, and Power BI/Excel for reporting. His Quantium and Zepto projects are good examples — ask me about them."
    },
    {
      keys: ['data analysis process','analysis process','how do you analyze data','data analytics workflow','data pipeline'],
      answer: "**A Typical Data Analysis Workflow**\n\n1. Collect — pull data from files, databases, or APIs\n2. Clean — handle missing values, duplicates, formatting\n3. Explore — find patterns with SQL/Pandas\n4. Visualize — build charts and dashboards in Power BI/Excel\n5. Recommend — turn findings into a business decision\n\nSaimoon follows this exact process in his Netflix, Quantium, and Zepto projects."
    },
    {
      keys: ['why hire','why choose','good fit','strength','what makes him','value','standout','why should we hire','why should i hire','over other candidates','better than other candidates','competitive edge','unique about him','reason to hire','keno tomake nibo','keno hire korbo','keno take nibo'],
      answer: "**Why Saimoon**\n\n• Practical experience across 3 real analytics projects (Python, SQL, Power BI)\n• Forage job simulations with EA and Quantium — real-world business problems\n• 11 certifications spanning analytics, BI, and supply chain\n• Currently pursuing a CSE degree while actively building industry skills\n\nHe's open to internships, freelance work, and full-time roles — see the Contact section to reach out."
    },
    {
      keys: ['fresher','entry level','years of experience','work experience','industry experience','professional experience','internship experience','experience level','real world experience','hands-on experience','any experience'],
      answer: "**Experience**\n\nSaimoon is a Computer Science student, so this is early-career / fresher-level experience — built hands-on rather than through a formal job yet:\n\n• 3 real analytics projects (Netflix, Quantium, Zepto)\n• 2 Forage job simulations with EA and Quantium\n• 11 certifications across analytics, SQL, and BI tools\n\nHe's actively looking for internships and entry-level roles to build on this."
    },
    {
      keys: ['tableau','r programming','r language','power query','looker','matlab','aws','azure','.net framework','sas software'],
      answer: "**Tool Fit**\n\nHis core stack is Python, SQL, Power BI, and Excel — that's not something he's specifically worked with yet, but he's quick to pick up new tools when a role calls for it.\n\nAsk me about his skills or projects to see what he's built with his current stack."
    },
    {
      keys: ['cgpa','gpa','grade point','academic record','academic result','transcript','academic score'],
      answer: "**Academic Record**\n\nDetailed academic records like CGPA aren't listed on the site — happy to share more directly. Feel free to reach out by email, or check his CV."
    },
    {
      keys: ['notice period','salary','compensation','pay expectation','stipend','expected salary','joining date','when can you start','availability to start'],
      answer: "**Logistics**\n\nAs a student, Saimoon is flexible on start date and role structure. For specifics like compensation or timelines, it's best to ask him directly — reach out by email or WhatsApp."
    }
  ];

  var FALLBACK = "I didn't quite catch that — could you try rephrasing?\n\nYou can ask about:\n• Skills & tools\n• Projects\n• Certificates\n• Contact info\n• Availability for hire";

  // ── typo tolerance: small edit-distance check for single-word keys ──
  function levenshtein(a, b) {
    var m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    var prev = [];
    for (var j = 0; j <= n; j++) prev[j] = j;
    for (var i = 1; i <= m; i++) {
      var curr = [i];
      for (var j2 = 1; j2 <= n; j2++) {
        var cost = a.charAt(i - 1) === b.charAt(j2 - 1) ? 0 : 1;
        curr[j2] = Math.min(prev[j2] + 1, curr[j2 - 1] + 1, prev[j2 - 1] + cost);
      }
      prev = curr;
    }
    return prev[n];
  }
  function fuzzyThreshold(len) {
    if (len < 4) return 0;   // too short to safely fuzzy-match
    if (len <= 6) return 1;
    return 2;
  }

  function respond(raw) {
    var q = raw.toLowerCase().trim();
    var qWords = q.split(/[^a-z0-9]+/).filter(Boolean);

    // Pure greeting — only if message is JUST a greeting word
    var greetOnly = ['hi','hello','hey','hii','helo','yo','sup','salam','assalamualaikum','ki khobor','kemon acho','kmn aso'];
    if (greetOnly.some(function(g){ return q === g || q === g+'!' || q === g+'.'; })) {
      return "Hello! How can I help you learn about Saimoon?\n\nAsk me about his skills, projects, certificates, or how to contact him.";
    }

    // Thank you
    if (q.includes('thank') || q.includes('thanks') || q.includes('tnx') || q.includes('dhonnobad') || q.includes('dhonyobad')) {
      return "You're welcome! Feel free to ask anything else about Saimoon.";
    }

    // Score each KB entry — longer/exact keyword match = higher weight,
    // single-word keys also get a lighter fuzzy (typo-tolerant) match
    var best = null, bestScore = 0;
    KB.forEach(function(entry) {
      var score = 0;
      entry.keys.forEach(function(k) {
        if (q.includes(k)) { score += k.length * 2; return; }
        if (k.indexOf(' ') === -1) {
          var th = fuzzyThreshold(k.length);
          if (!th) return;
          for (var i = 0; i < qWords.length; i++) {
            var w = qWords[i];
            if (Math.abs(w.length - k.length) <= th && levenshtein(w, k) <= th) {
              score += k.length * 1.4;
              break;
            }
          }
        }
      });
      if (score > bestScore) { bestScore = score; best = entry; }
    });

    if (bestScore === 0) {
      var found = searchSite(raw);
      return found || FALLBACK;
    }
    if (best.dynamic) {
      var live = best.dynamic();
      if (live) return live;   // fresh data scraped from the live pages
    }
    return best.answer;        // static fallback (fetch not ready / failed)
  }

  /* ── CSS ── */
  var css = document.createElement('style');
  css.textContent = `
#sai-btn{position:fixed;bottom:28px;right:28px;width:50px;height:50px;border-radius:50%;background:#1c1c1f;color:#fff;border:2px solid rgba(255,255,255,.12);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(0,0,0,.32),0 1px 3px rgba(0,0,0,.2);z-index:9999;transition:transform .2s,box-shadow .2s;padding:0;overflow:visible;}
#sai-btn:hover{transform:scale(1.07);box-shadow:0 8px 30px rgba(0,0,0,.4);}
#sai-btn img{width:100%;height:100%;border-radius:50%;object-fit:cover;object-position:center 12%;display:block;}
#sai-btn svg{width:22px;height:22px;}
.sai-dot{position:absolute;top:0;right:0;width:11px;height:11px;border-radius:50%;background:#22c55e;border:2px solid #1c1c1f;}
@keyframes saiPulseRing{0%{box-shadow:0 6px 24px rgba(0,0,0,.28),0 0 0 0 rgba(255,255,255,.35);}70%{box-shadow:0 6px 24px rgba(0,0,0,.28),0 0 0 12px rgba(255,255,255,0);}100%{box-shadow:0 6px 24px rgba(0,0,0,.28),0 0 0 0 rgba(255,255,255,0);}}
#sai-btn.sai-pulse{animation:saiPulseRing 1.8s ease-out 3;}
.sai-teaser{position:fixed;bottom:100px;right:28px;max-width:220px;background:rgba(28,28,31,.92);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:16px 16px 4px 16px;padding:11px 30px 11px 14px;font-size:13px;line-height:1.45;font-weight:500;font-family:"Inter",-apple-system,sans-serif;box-shadow:0 8px 28px -6px rgba(0,0,0,.5);z-index:9998;opacity:0;transform:translateY(8px) scale(.96);transition:opacity .35s ease,transform .35s ease;pointer-events:none;}
.sai-teaser.show{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}
.sai-teaser-x{position:absolute;top:6px;right:6px;width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.1);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.7);padding:0;}
.sai-teaser-x svg{width:9px;height:9px;}
#sai-win{position:fixed;bottom:100px;right:28px;width:380px;max-height:min(580px,78vh);background:rgba(24,24,27,.78);-webkit-backdrop-filter:blur(28px) saturate(160%);backdrop-filter:blur(28px) saturate(160%);border:1px solid rgba(255,255,255,.08);border-radius:22px;box-shadow:0 20px 60px -12px rgba(0,0,0,.55),0 2px 8px rgba(0,0,0,.3);display:none;flex-direction:column;overflow:hidden;z-index:9998;font-family:"Inter",-apple-system,sans-serif;}
#sai-win.open{display:flex;}
.s-hd{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.02);}
.s-av{width:38px;height:38px;border-radius:50%;overflow:hidden;background:#2c2c30;flex-shrink:0;border:1px solid rgba(255,255,255,.12);}
.s-av img{width:100%;height:100%;object-fit:cover;object-position:center 12%;}
.s-nm{font-size:13.5px;font-weight:700;color:#fff;}
.s-st{font-size:11.5px;color:rgba(255,255,255,.55);display:flex;align-items:center;gap:4px;margin-top:1px;}
.s-st::before{content:"";width:6px;height:6px;border-radius:50%;background:#fff;display:inline-block;}
.s-cl{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.5);padding:4px;border-radius:6px;display:flex;margin-left:auto;transition:color .15s;}
.s-cl:hover{color:#fff;}
.s-cl svg{width:16px;height:16px;}
.s-msgs{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth;}
.s-msgs::-webkit-scrollbar{width:4px;}
.s-msgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:4px;}
.s-day{align-self:center;font-size:10.5px;font-weight:600;color:rgba(255,255,255,.4);background:rgba(255,255,255,.06);padding:3px 11px;border-radius:999px;margin-bottom:4px;text-transform:uppercase;letter-spacing:.04em;}
.s-row{display:flex;flex-direction:column;max-width:86%;}
.s-row.s-row-u{align-self:flex-end;align-items:flex-end;}
.s-row.s-row-ai{align-self:flex-start;align-items:flex-start;}
.s-m{font-size:13.5px;line-height:1.55;}
.s-ai{background:#2c2c30;color:#f2f2f3;padding:10px 13px;border-radius:4px 16px 16px 16px;box-shadow:0 1px 3px rgba(0,0,0,.2);}
.s-u{background:#f2f2f3;color:#111;padding:10px 13px;border-radius:16px 4px 16px 16px;box-shadow:0 2px 8px rgba(0,0,0,.15);}
.s-ts{font-size:10px;color:rgba(255,255,255,.35);margin-top:3px;padding:0 3px;}
.s-typing{align-self:flex-start;display:flex;gap:4px;padding:11px 13px;background:#2c2c30;border-radius:4px 16px 16px 16px;}
.s-typing span{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.4);animation:sDot 1.2s infinite ease-in-out;}
.s-typing span:nth-child(2){animation-delay:.2s;}
.s-typing span:nth-child(3){animation-delay:.4s;}
@keyframes sDot{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}
.s-qs{padding:0 14px 10px;display:flex;flex-wrap:wrap;gap:6px;}
.s-qs button{font-size:11.5px;font-weight:500;padding:5px 11px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:rgba(255,255,255,.75);cursor:pointer;transition:background .15s,color .15s;font-family:inherit;}
.s-qs button:hover{background:#fff;color:#111;border-color:#fff;}
.s-ir{padding:10px 12px;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px));border-top:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.02);}
.s-ir input{flex:1;min-width:0;font-family:inherit;font-size:13.5px;padding:9px 6px 9px 14px;border:none;background:transparent;color:#fff;outline:none;}
.s-ir input::placeholder{color:rgba(255,255,255,.35);}
.s-sd{padding:0 18px;height:36px;border-radius:999px;background:#fff;color:#111;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px;font-weight:700;font-family:inherit;transition:opacity .15s,transform .1s;box-shadow:0 2px 10px rgba(0,0,0,.25);}
.s-sd:hover{opacity:.9;}
.s-sd:active{transform:scale(.94);}
.s-lnk{color:#fff;font-weight:600;text-decoration:underline;text-decoration-color:rgba(255,255,255,.4);text-underline-offset:2px;word-break:break-word;transition:text-decoration-color .15s;}
.s-lnk:hover{text-decoration-color:currentColor;}
.s-m strong{font-weight:700;color:#fff;}
@media(max-width:480px){
  #sai-win{width:calc(100vw - 20px);max-height:min(72vh,620px);border-radius:18px;}
  #sai-btn{right:16px;bottom:16px;width:46px;height:46px;}
  .sai-teaser{max-width:200px;}
}
@media(max-height:560px){
  #sai-win{max-height:88vh;}
}
`;
  document.head.appendChild(css);

  var AVATAR = 'my%20pic/saimon%201.jpeg';

  /* ── HTML ── */
  var wrap = document.createElement('div');
  wrap.innerHTML = `
<div class="sai-teaser" id="sai-teaser">
  Need quick assist?
  <button class="sai-teaser-x" id="sai-teaser-x" aria-label="Dismiss">
    <svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
  </button>
</div>
<button id="sai-btn" aria-label="Chat about Saimoon" title="Ask about Saimoon">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
  <span class="sai-dot"></span>
</button>
<div id="sai-win" role="dialog" aria-label="Saimoon's assistant">
  <div class="s-hd">
    <div class="s-av"><img src="${AVATAR}" alt="Saimoon" onerror="this.style.display='none'"></div>
    <div>
      <div class="s-nm">Saimoon's Assistant</div>
      <div class="s-st">Always online</div>
    </div>
    <button class="s-cl" id="sai-cl" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
    </button>
  </div>
  <div class="s-msgs" id="sai-msgs">
    <div class="s-day">Today</div>
    <div class="s-row s-row-ai"><div class="s-m s-ai">Hi, I'm Saimoon's assistant. Ask me about his skills, projects, certifications, or how to reach him.</div><div class="s-ts">${timeNow()}</div></div>
  </div>
  <div class="s-qs" id="sai-qs">
    <button>About him</button>
    <button>His skills</button>
    <button>His projects</button>
    <button>Certificates</button>
    <button>Contact him</button>
  </div>
  <div class="s-ir">
    <input type="text" id="sai-inp" placeholder="Ask anything about Saimoon..." autocomplete="off"/>
    <button class="s-sd" id="sai-sd" aria-label="Send">Send</button>
  </div>
</div>`;
  document.body.appendChild(wrap);

  var teaser = document.getElementById('sai-teaser');
  var btn = document.getElementById('sai-btn');
  var win  = document.getElementById('sai-win');

  /* ── Teaser popup: shows ~1.5s after load, auto-hides after 10s ── */
  var teaserShown = 0, teaserMax = 4, teaserCycle = null, teaserHideT = null;

  function hideTeaserOnce() {
    teaser.classList.remove('show');
    btn.classList.remove('sai-pulse');
    if (teaserHideT) clearTimeout(teaserHideT);
  }
  function showTeaserOnce() {
    teaserShown++;
    teaser.classList.add('show');
    btn.classList.add('sai-pulse');
    teaserHideT = setTimeout(hideTeaserOnce, 6000);
  }
  // dismiss for good — user closed it or opened the chat
  function stopTeaser() {
    hideTeaserOnce();
    if (teaserCycle) clearInterval(teaserCycle);
  }

  setTimeout(function () {
    showTeaserOnce();
    teaserCycle = setInterval(function () {
      if (teaserShown >= teaserMax) { clearInterval(teaserCycle); return; }
      showTeaserOnce();
    }, 30000);
  }, 1500);
  document.getElementById('sai-teaser-x').addEventListener('click', stopTeaser);

  /* ── Logic ── */
  var box  = document.getElementById('sai-msgs');
  var inp  = document.getElementById('sai-inp');
  var qs   = document.getElementById('sai-qs');

  document.getElementById('sai-btn').addEventListener('click', function () {
    win.classList.toggle('open');
    stopTeaser();
    if (win.classList.contains('open')) inp.focus();
  });
  document.getElementById('sai-cl').addEventListener('click', function () {
    win.classList.remove('open');
  });
  qs.querySelectorAll('button').forEach(function (b) {
    b.addEventListener('click', function () {
      go(b.textContent.trim());
      qs.style.display = 'none';
    });
  });
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go(inp.value); }
  });
  document.getElementById('sai-sd').addEventListener('click', function () { go(inp.value); });

  function go(text) {
    text = text.trim();
    if (!text) return;
    qs.style.display = 'none';
    add(text, 'u');
    inp.value = '';
    var t = document.createElement('div');
    t.className = 's-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    box.appendChild(t);
    scroll();
    var minDelay = new Promise(function (res) {
      setTimeout(res, 500 + Math.random() * 300);
    });
    Promise.all([minDelay, LIVE_READY]).then(function () {
      t.remove();
      add(respond(text), 'ai');
    });
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // one pass: full URLs, bare known domains, and emails all become real <a> links
  var LINK_RE = /(https?:\/\/[^\s<]+)|((?:github\.com|linkedin\.com|facebook\.com|x\.com|wa\.me)\/[^\s<,]+)|([\w.+-]+@[\w-]+\.[a-zA-Z]{2,})/g;

  function linkify(html) {
    return html.replace(LINK_RE, function (m, full, bare, email) {
      if (full) {
        var trimmed = full.replace(/[.,)]+$/, '');
        var label = trimmed.replace(/^https?:\/\//, '').replace(/\/$/, '');
        return '<a class="s-lnk" href="' + trimmed + '" target="_blank" rel="noopener">' + label + '</a>';
      }
      if (bare) {
        return '<a class="s-lnk" href="https://' + bare + '" target="_blank" rel="noopener">' + bare + '</a>';
      }
      if (email) {
        return '<a class="s-lnk" href="mailto:' + email + '" target="_blank" rel="noopener">' + email + '</a>';
      }
      return m;
    });
  }

  function formatAi(text) {
    var html = escapeHtml(text);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = linkify(html);
    return html.replace(/\n/g, '<br>');
  }

  function timeNow() {
    var d = new Date();
    var h = d.getHours(), m = d.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
  }

  function add(text, type) {
    var row = document.createElement('div');
    row.className = 's-row s-row-' + type;
    var d = document.createElement('div');
    d.className = 's-m s-' + type;
    d.innerHTML = type === 'ai' ? formatAi(text) : escapeHtml(text).replace(/\n/g, '<br>');
    var ts = document.createElement('div');
    ts.className = 's-ts';
    ts.textContent = timeNow();
    row.appendChild(d);
    row.appendChild(ts);
    box.appendChild(row);
    scroll();
  }
  function scroll() { box.scrollTop = box.scrollHeight; }

})();