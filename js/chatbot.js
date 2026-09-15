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
    return "Saimoon has " + cards.length + " certificates 🏆\n\n" + lines.join('\n');
  }

  function buildProjects(doc) {
    var cards = doc.querySelectorAll('.proj-card');
    if (!cards.length) return null;
    var blocks = [];
    cards.forEach(function (c, i) {
      var title = c.querySelector('h3');
      var desc = c.querySelector('p');
      if (!title) return;
      var t = (i + 1) + '️⃣ ' + clean(title.textContent);
      if (desc) t += ' — ' + clean(desc.textContent);
      blocks.push(t);
    });
    return "Saimoon has " + cards.length + " data analytics projects:\n\n" + blocks.join('\n\n') + "\n\nClick Projects in the nav to see them all!";
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
      blocks.push('🔹 ' + clean(h3.textContent) + ': ' + names.join(', '));
    });
    return "Saimoon works with:\n\n" + blocks.join('\n');
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
    return "About Saimoon 👋\n\n" + parsed.bio + (lines.length ? '\n\n' + lines.join('\n') : '');
  }

  function buildEducation(parsed) {
    if (!parsed.info['Education']) return null;
    var txt = "Saimoon is pursuing " + parsed.info['Education'] + " 🎓";
    if (parsed.info['Location']) txt += "\n\nBased in " + parsed.info['Location'] + ".";
    return txt;
  }

  function buildAvailability(parsed) {
    if (!parsed.info['Availability']) return null;
    var txt = parsed.info['Availability'] + " 🟢";
    if (parsed.info['Focus']) txt += "\n\nFocus: " + parsed.info['Focus'];
    return txt;
  }

  function buildLocation(parsed) {
    if (!parsed.info['Location']) return null;
    return "Saimoon is based in " + parsed.info['Location'] + " 🇧🇩\n\nAvailable for remote work globally too!";
  }

  function buildCV(parsed) {
    if (!parsed.cvLink) return null;
    return "Here's Saimoon's CV 📄\n\n" + parsed.cvLink;
  }

  function buildExtracurricular(doc) {
    var panels = doc.querySelectorAll('[data-sim-panel]');
    if (!panels.length) return null;
    var blocks = [];
    panels.forEach(function (panel) {
      var h3 = panel.querySelector('h3');
      var meta = panel.querySelector('p');
      if (!h3) return;
      var text = '💼 ' + clean(h3.textContent);
      if (meta) text += '\n' + clean(meta.textContent);
      panel.querySelectorAll('li').forEach(function (li) { text += '\n• ' + clean(li.textContent).replace(/^—\s*/, ''); });
      blocks.push(text);
    });
    return "Saimoon completed " + panels.length + " job simulations:\n\n" + blocks.join('\n\n');
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
    var out = "You can reach Saimoon here 📬\n\n📧 Email: " + links.email;
    if (links.whatsapp) out += "\n💬 WhatsApp: " + links.whatsapp;
    if (links.linkedin) out += "\n💼 LinkedIn: " + links.linkedin;
    if (links.github) out += "\n🐙 GitHub: " + links.github;
    LIVE.socials = "Saimoon's social links 🔗\n\n"
      + (links.github ? "🐙 GitHub: " + links.github + "\n" : "")
      + (links.linkedin ? "💼 LinkedIn: " + links.linkedin + "\n" : "")
      + (links.facebook ? "📘 Facebook: " + links.facebook + "\n" : "")
      + (links.x ? "🐦 X: " + links.x + "\n" : "")
      + (links.email ? "📧 Email: " + links.email : "");
    return out;
  }

  function buildBlog(doc) {
    var post = doc.querySelector('main article.card h2');
    if (!post) return null;
    var article = post.closest('article');
    var excerpt = article.querySelector('p');
    var tags = [];
    article.querySelectorAll('.pill').forEach(function (p) { if (!/featured/i.test(p.textContent)) tags.push(clean(p.textContent)); });
    var out = "Saimoon wrote a blog article 📝\n\n\"" + clean(post.textContent) + "\"";
    if (excerpt) out += "\n\n" + clean(excerpt.textContent);
    if (tags.length) out += "\n\nTopics: " + tags.join(', ');
    return out;
  }

  var LIVE_READY = Promise.all([
    fetchDoc('certificates.html').then(function (doc) {
      LIVE.certs = buildCerts(doc);
      LIVE.contact = buildContact(doc);
    }).catch(function () {}),
    fetchDoc('projects.html').then(function (doc) { LIVE.projects = buildProjects(doc); }).catch(function () {}),
    fetchDoc('skills.html').then(function (doc) { LIVE.skills = buildSkills(doc); }).catch(function () {}),
    fetchDoc('about.html').then(function (doc) {
      var parsed = scrapeAboutInfo(doc);
      LIVE.about = buildAbout(parsed);
      LIVE.education = buildEducation(parsed);
      LIVE.availability = buildAvailability(parsed);
      LIVE.location = buildLocation(parsed);
      LIVE.cv = buildCV(parsed);
      LIVE.extracurricular = buildExtracurricular(doc);
    }).catch(function () {}),
    fetchDoc('blog.html').then(function (doc) { LIVE.blog = buildBlog(doc); }).catch(function () {})
  ]).then(function () {}).catch(function () { /* whatever failed just falls back to static */ });

  var KB = [
    {
      keys: ['skill','tech','language','tool','know','use','python','sql','power bi','excel','javascript','c++','pandas','numpy'],
      dynamic: function () { return LIVE.skills; },
      answer: "Saimoon works with:\n\n🔹 Languages: Python, SQL, JavaScript, C++\n🔹 Libraries: Pandas, NumPy\n🔹 Visualization: Power BI, Excel\n🔹 Tools: VS Code, Git, Jupyter Notebook"
    },
    {
      keys: ['project','build','work done','portfolio project','his project','show project'],
      dynamic: function () { return LIVE.projects; },
      answer: "Saimoon has 3 data analytics projects:\n\n1️⃣ Netflix Movie Data Analysis — 9,000+ movies, Python & Pandas\n\n2️⃣ Quantium Retail Analytics — 260K+ transactions, Store 77 had +29.1% uplift\n\n3️⃣ Zepto E-commerce Inventory Analysis — SQL-based insights\n\nClick Projects in the nav to see them all!"
    },
    {
      keys: ['netflix'],
      answer: "Netflix Movie Data Analysis 🎬\n\nAnalyzed 9,000+ Netflix movies using Python, Pandas, NumPy, Matplotlib.\n\n• Drama is the most frequent genre\n• Popular movies ≠ highest-rated\n• Visualized release trends by year\n\nGitHub: github.com/saimoon-adnan/Netflix-Movie-Data-Analysis-Project-usingPython"
    },
    {
      keys: ['quantium','retail','store trial','store 77','uplift'],
      answer: "Quantium Retail Analytics 🛒\n\nAnalyzed 260K+ retail transactions.\n\n• Store 77: +29.1% sales uplift ✅\n• Store 86: +9.8% uplift\n• Top segment: Mainstream Young Singles/Couples\n• Top brands: Kettle, Pringles, Doritos"
    },
    {
      keys: ['zepto','inventory','sql project','ecommerce'],
      answer: "Zepto E-commerce Inventory Analysis 📦\n\nSQL-based project:\n• Cleaned raw inventory data\n• Explored pricing and stock trends\n• Generated business insights for inventory decisions"
    },
    {
      keys: ['certificate','certification','course','forage','sololearn','simplilearn'],
      dynamic: function () { return LIVE.certs; },
      answer: "Saimoon has 11 certificates 🏆\n\n• Quantium Data Analytics (Forage)\n• EA Product Management (Forage)\n• Python Developer (SoloLearn)\n• SQL Intermediate (SoloLearn)\n• Microsoft Power BI (Skill Course)\n• Microsoft Excel (Skill Course)\n• Data Analytics & Power BI (Interactive Cares)\n• Inventory Management (HP Foundation)\n• Supply Chain Management (Simplilearn)\n• Prompt Engineering (Simplilearn)\n• SQL Micro Course (Skill Course)"
    },
    {
      keys: ['contact','email','reach','message','whatsapp','gmail','how to contact','get in touch'],
      dynamic: function () { return LIVE.contact; },
      answer: "You can reach Saimoon here 📬\n\n📧 Email: adnansaimoon@gmail.com\n💼 LinkedIn: linkedin.com/in/saimoon-adnan-771079322\n💬 WhatsApp: +8801600627822\n🐙 GitHub: github.com/saimoon-adnan\n\nHe's open to internships, freelance & full-time roles!"
    },
    {
      keys: ['github','linkedin','facebook','twitter','x/twitter','social','link','social media'],
      dynamic: function () { return LIVE.socials; },
      answer: "Saimoon's social links 🔗\n\n🐙 GitHub: github.com/saimoon-adnan\n💼 LinkedIn: linkedin.com/in/saimoon-adnan-771079322\n📘 Facebook: facebook.com/adnan.irfan.1213\n🐦 X: x.com/OnlySaimon\n📧 Email: adnansaimoon@gmail.com"
    },
    {
      keys: ['who is','about saimoon','about him','tell me about','introduce','who are you','describe him'],
      dynamic: function () { return LIVE.about; },
      answer: "About Saimoon Ahmed Adnan 👋\n\nComputer Science student and aspiring Product Data Analyst based in Dhaka, Bangladesh.\n\nSpecializes in SQL, Python, Power BI, and Product Analytics — transforming raw data into actionable insights.\n\nCurrently open to internships and full-time opportunities!"
    },
    {
      keys: ['education','study','university','cse','degree','student','background'],
      dynamic: function () { return LIVE.education; },
      answer: "Saimoon is pursuing a B.Sc. in Computer Science and Engineering (CSE) 🎓\n\nBased in Dhaka, Bangladesh.\n\nAlongside his degree, he's completed 11 certifications and 2 Forage job simulations."
    },
    {
      keys: ['available','hire','open to work','opportunity','job','intern','freelance'],
      dynamic: function () { return LIVE.availability; },
      answer: "Yes! Saimoon is currently open to work 🟢\n\n• Internships\n• Freelance projects\n• Full-time opportunities\n\nFocus: Data Analytics, Product Analytics, Data Science\n\n📧 adnansaimoon@gmail.com\n💬 +8801600627822"
    },
    {
      keys: ['blog','article','writing','post','read his'],
      dynamic: function () { return LIVE.blog; },
      answer: "Saimoon wrote a blog article 📝\n\n\"How Data Drives Better Product Decisions\"\n\nCovers product metrics, a food delivery case study, common analytics mistakes, and tools like SQL, Python, Power BI.\n\nCheck the Blog section in the nav!"
    },
    {
      keys: ['extracurricular','extra curricular','simulation','electronic arts','ea product'],
      dynamic: function () { return LIVE.extracurricular; },
      answer: "Saimoon completed 2 Forage simulations 💼\n\n🎮 EA Product Management (March 2026)\n• KPI framework for a strategy RPG mobile game\n\n📊 Quantium Data Analytics (June 2026)\n• Transaction analytics & benchmark store analysis"
    },
    {
      keys: ['location','where','country','bangladesh','dhaka','based in'],
      dynamic: function () { return LIVE.location; },
      answer: "Saimoon is based in Dhaka, Bangladesh 🇧🇩\n\nAvailable for remote work globally too!"
    },
    {
      keys: ['cv','resume','download cv'],
      dynamic: function () { return LIVE.cv; },
      answer: "Saimoon's CV is available on the About page 📄\n\nClick 'About' in the navigation, then click 'Download CV'."
    }
  ];

  var FALLBACK = "I'm not sure about that 🤔\n\nTry asking me about:\n• Skills & tools\n• Projects\n• Certificates\n• Contact info\n• Availability for hire";

  function respond(raw) {
    var q = raw.toLowerCase().trim();

    // Pure greeting — only if message is JUST a greeting word
    var greetOnly = ['hi','hello','hey','hii','helo','yo','sup','salam'];
    if (greetOnly.some(function(g){ return q === g || q === g+'!' || q === g+'.'; })) {
      return "Hello! 👋 How can I help you learn about Saimoon?\n\nAsk me about his skills, projects, certificates, or how to contact him!";
    }

    // Thank you
    if (q.includes('thank') || q.includes('thanks') || q.includes('tnx')) {
      return "You're welcome! 😊 Feel free to ask anything else about Saimoon.";
    }

    // Score each KB entry — longer keyword match = higher weight
    var best = null, bestScore = 0;
    KB.forEach(function(entry) {
      var score = 0;
      entry.keys.forEach(function(k) {
        if (q.includes(k)) score += k.length * 2;
      });
      if (score > bestScore) { bestScore = score; best = entry; }
    });

    if (bestScore === 0) return FALLBACK;
    if (best.dynamic) {
      var live = best.dynamic();
      if (live) return live;   // fresh data scraped from the live pages
    }
    return best.answer;        // static fallback (fetch not ready / failed)
  }

  /* ── CSS ── */
  var css = document.createElement('style');
  css.textContent = `
#sai-btn{position:fixed;bottom:28px;right:28px;width:56px;height:56px;border-radius:50%;background:var(--text,#111113);color:var(--bg,#fff);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.18);z-index:9999;transition:transform .2s,box-shadow .2s;}
#sai-btn:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(0,0,0,.22);}
#sai-btn svg{width:22px;height:22px;}
#sai-win{position:fixed;bottom:96px;right:28px;width:360px;max-height:520px;background:var(--bg,#fff);border:1px solid var(--border,#e7e7e9);border-radius:20px;box-shadow:0 8px 40px -8px rgba(120,120,128,.32),0 2px 8px rgba(0,0,0,.08);display:none;flex-direction:column;overflow:hidden;z-index:9998;font-family:"Inter",-apple-system,sans-serif;}
#sai-win.open{display:flex;}
.s-hd{padding:14px 16px;border-bottom:1px solid var(--border,#e7e7e9);display:flex;align-items:center;gap:10px;background:var(--bg-soft,#f7f7f8);}
.s-av{width:36px;height:36px;border-radius:10px;overflow:hidden;background:var(--bg-soft-2,#f2f2f3);flex-shrink:0;}
.s-av img{width:100%;height:100%;object-fit:cover;object-position:center 10%;}
.s-nm{font-size:13.5px;font-weight:700;color:var(--text,#111);}
.s-st{font-size:11.5px;color:#16a34a;display:flex;align-items:center;gap:4px;margin-top:1px;}
.s-st::before{content:"";width:6px;height:6px;border-radius:50%;background:#16a34a;display:inline-block;}
.s-cl{background:none;border:none;cursor:pointer;color:var(--text-faint,#9a9aa0);padding:4px;border-radius:6px;display:flex;margin-left:auto;transition:color .15s;}
.s-cl:hover{color:var(--text,#111);}
.s-cl svg{width:16px;height:16px;}
.s-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;}
.s-msgs::-webkit-scrollbar{width:4px;}
.s-msgs::-webkit-scrollbar-thumb{background:var(--border,#e7e7e9);border-radius:4px;}
.s-m{max-width:90%;font-size:13px;line-height:1.6;}
.s-ai{align-self:flex-start;background:var(--bg-soft,#f7f7f8);border:1px solid var(--border,#e7e7e9);color:var(--text,#111);padding:10px 13px;border-radius:4px 14px 14px 14px;}
.s-u{align-self:flex-end;background:var(--text,#111113);color:var(--bg,#fff);padding:10px 13px;border-radius:14px 14px 4px 14px;}
.s-typing{align-self:flex-start;display:flex;gap:4px;padding:11px 13px;background:var(--bg-soft,#f7f7f8);border:1px solid var(--border,#e7e7e9);border-radius:4px 14px 14px 14px;}
.s-typing span{width:6px;height:6px;border-radius:50%;background:var(--text-faint,#9a9aa0);animation:sDot 1.2s infinite ease-in-out;}
.s-typing span:nth-child(2){animation-delay:.2s;}
.s-typing span:nth-child(3){animation-delay:.4s;}
@keyframes sDot{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}
.s-qs{padding:0 14px 10px;display:flex;flex-wrap:wrap;gap:6px;}
.s-qs button{font-size:11.5px;font-weight:500;padding:5px 11px;border-radius:999px;border:1px solid var(--border,#e7e7e9);background:var(--bg-soft,#f7f7f8);color:var(--text-soft,#6b6b70);cursor:pointer;transition:background .15s,color .15s;font-family:inherit;}
.s-qs button:hover{background:var(--text,#111);color:var(--bg,#fff);border-color:var(--text,#111);}
.s-ir{padding:10px 12px;border-top:1px solid var(--border,#e7e7e9);display:flex;gap:8px;background:var(--bg,#fff);}
.s-ir input{flex:1;font-family:inherit;font-size:13px;padding:9px 13px;border-radius:999px;border:1px solid var(--border,#e7e7e9);background:var(--bg-soft,#f7f7f8);color:var(--text,#111);outline:none;transition:border-color .15s;}
.s-ir input:focus{border-color:var(--text-soft,#6b6b70);}
.s-ir input::placeholder{color:var(--text-faint,#9a9aa0);}
.s-sd{width:36px;height:36px;border-radius:50%;background:var(--text,#111);color:var(--bg,#fff);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .15s;}
.s-sd:hover{opacity:.8;}
.s-sd svg{width:15px;height:15px;}
@media(max-width:420px){#sai-win{width:calc(100vw - 32px);right:16px;bottom:84px;}#sai-btn{right:16px;bottom:16px;}}
`;
  document.head.appendChild(css);

  /* ── HTML ── */
  var wrap = document.createElement('div');
  wrap.innerHTML = `
<button id="sai-btn" aria-label="Chat about Saimoon" title="Ask about Saimoon">
  <svg viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
</button>
<div id="sai-win" role="dialog" aria-label="Saimoon's assistant">
  <div class="s-hd">
    <div class="s-av"><img src="my pic/saimon 1.jpg" alt="Saimoon" onerror="this.style.display='none'"></div>
    <div>
      <div class="s-nm">Saimoon's Assistant</div>
      <div class="s-st">Always online</div>
    </div>
    <button class="s-cl" id="sai-cl" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
    </button>
  </div>
  <div class="s-msgs" id="sai-msgs">
    <div class="s-m s-ai">Hi! 👋 I'm Saimoon's assistant. Ask me about his skills, projects, certifications, or how to reach him!</div>
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
    <button class="s-sd" id="sai-sd" aria-label="Send">
      <svg viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  </div>
</div>`;
  document.body.appendChild(wrap);

  /* ── Logic ── */
  var win  = document.getElementById('sai-win');
  var box  = document.getElementById('sai-msgs');
  var inp  = document.getElementById('sai-inp');
  var qs   = document.getElementById('sai-qs');

  document.getElementById('sai-btn').addEventListener('click', function () {
    win.classList.toggle('open');
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

  function add(text, type) {
    var d = document.createElement('div');
    d.className = 's-m s-' + type;
    d.innerHTML = text.replace(/\n/g, '<br>');
    box.appendChild(d);
    scroll();
  }
  function scroll() { box.scrollTop = box.scrollHeight; }

})();