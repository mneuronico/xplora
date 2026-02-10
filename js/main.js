/* ==========================================
   XPLORA CIENCIA — Main JavaScript
   Language toggle, scroll animations, canvas particles, counters
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ========================
  // 1. LANGUAGE TOGGLE (i18n)
  // ========================
  const langToggle = document.getElementById('langToggle');
  const langOptions = langToggle.querySelectorAll('.lang-option');
  let currentLang = 'en';

  function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.setAttribute('data-lang', lang);

    // Update active state on toggle
    langOptions.forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });

    // Update all translatable elements
    document.querySelectorAll('[data-en]').forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else {
          el.textContent = text;
        }
      }
    });

    // Update page title
    document.title = lang === 'en'
      ? 'Xplora — Science Snacks'
      : 'Xplora — Snacks de Ciencia';

    // Re-render games if they've been initialized
    if (typeof reinitGames === 'function') reinitGames();
  }

  langToggle.addEventListener('click', (e) => {
    const option = e.target.closest('.lang-option');
    if (option) {
      setLanguage(option.dataset.lang);
    }
  });

  // ========================
  // 2. NAVBAR SCROLL
  // ========================
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  function handleNavScroll() {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 60);
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ========================
  // 3. MOBILE MENU
  // ========================
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // ========================
  // 4. SCROLL REVEAL
  // ========================
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Also trigger viral bar animation
        entry.target.querySelectorAll('.viral-card').forEach(card => {
          card.classList.add('active');
        });
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ========================
  // 5. STATS COUNTER
  // ========================
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  let statsAnimated = false;

  function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  }

  function animateCounters() {
    if (statsAnimated) return;
    statsAnimated = true;

    statNumbers.forEach(el => {
      const target = parseInt(el.dataset.count);
      const duration = 2000;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easedProgress * target);
        el.textContent = formatNumber(current);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = formatNumber(target);
        }
      }

      requestAnimationFrame(update);
    });
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
      }
    });
  }, { threshold: 0.3 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

  // ========================
  // 6. HERO CANVAS PARTICLES
  // ========================
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    const colors = ['#e91e8c', '#00d4ff', '#ffe600'];

    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.1;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulsePhase += this.pulseSpeed;

        // Mouse interaction
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          this.x += (dx / dist) * force * 1.5;
          this.y += (dy / dist) * force * 1.5;
        }

        // Wrap around
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        if (this.y > canvas.height + 10) this.y = -10;
      }

      draw() {
        const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity * pulse;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Create particles
    const particleCount = Math.min(120, Math.floor((canvas.width * canvas.height) / 8000));
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.04 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      drawConnections();
      requestAnimationFrame(animateParticles);
    }

    animateParticles();

    // Track mouse on hero section
    document.querySelector('.hero').addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    document.querySelector('.hero').addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });
  }

  // ========================
  // 7. SMOOTH ANCHOR SCROLL
  // ========================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ========================
  // 8. VIRAL BAR ANIMATION
  // ========================
  const viralCards = document.querySelectorAll('.viral-card');
  const viralObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.2 });

  viralCards.forEach(card => viralObserver.observe(card));

  // ========================
  // 9. TILT EFFECT ON TEAM CARDS
  // ========================
  document.querySelectorAll('.team-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ========================
  // 10. PARALLAX ON EVENTS
  // ========================
  const eventImages = document.querySelectorAll('.event-image');
  
  function handleParallax() {
    eventImages.forEach(img => {
      const rect = img.parentElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (rect.top < windowHeight && rect.bottom > 0) {
        const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
        const translateY = (scrollProgress - 0.5) * 30;
        img.style.transform = `scale(1.05) translateY(${translateY}px)`;
      }
    });
  }

  window.addEventListener('scroll', handleParallax, { passive: true });

  // Initialize
  handleNavScroll();

  // ========================
  // 11. GAME TABS
  // ========================
  const gameTabs = document.querySelectorAll('.game-tab');
  const gamePanels = document.querySelectorAll('.game-panel');

  gameTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const game = tab.dataset.game;
      gameTabs.forEach(t => t.classList.remove('active'));
      gamePanels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`game-${game}`).classList.add('active');
    });
  });

  // ========================
  // 12. PLACEBO GAME
  // ========================
  const placeboData = [
    { text: { en: 'Modulate subjective symptoms like fatigue or insomnia', es: 'Modular síntomas subjetivos como fatiga o insomnio' }, zone: 'can' },
    { text: { en: 'Cure diseases or replace surgery', es: 'Curar enfermedades o reemplazar cirugías' }, zone: 'cant' },
    { text: { en: 'Reduce anxiety through positive expectations', es: 'Reducir la ansiedad a través de expectativas positivas' }, zone: 'can' },
    { text: { en: 'Lower cholesterol levels', es: 'Bajar los niveles de colesterol' }, zone: 'cant' },
    { text: { en: 'Trigger release of serotonin, dopamine, or oxytocin', es: 'Activar la liberación de serotonina, dopamina u oxitocina' }, zone: 'can' },
    { text: { en: 'Replace evidence-based medical treatments', es: 'Reemplazar tratamientos médicos basados en evidencia' }, zone: 'cant' },
    { text: { en: 'Help even when the patient knows it\'s a placebo (open-label)', es: 'Ayudar incluso cuando el paciente sabe que es un placebo (abierto)' }, zone: 'can' },
    { text: { en: 'Act as an effective cancer treatment', es: 'Servir como tratamiento efectivo contra el cáncer' }, zone: 'cant' },
  ];

  function initPlaceboGame() {
    const itemsContainer = document.getElementById('placeboItems');
    const zoneCanItems = document.querySelector('#zoneCan .zone-items');
    const zoneCantItems = document.querySelector('#zoneCant .zone-items');
    const checkBtn = document.getElementById('placeboCheck');
    const resetBtn = document.getElementById('placeboReset');
    const resultDiv = document.getElementById('placeboResult');

    // Shuffle
    const shuffled = [...placeboData].sort(() => Math.random() - 0.5);

    function renderItems() {
      itemsContainer.innerHTML = '';
      zoneCanItems.innerHTML = '';
      zoneCantItems.innerHTML = '';
      resultDiv.innerHTML = '';
      checkBtn.style.display = '';
      resetBtn.style.display = 'none';

      shuffled.forEach((item, i) => {
        const el = document.createElement('div');
        el.className = 'placebo-item';
        el.textContent = item.text[currentLang];
        el.dataset.index = i;
        el.draggable = true;
        el.setAttribute('data-en', item.text.en);
        el.setAttribute('data-es', item.text.es);

        el.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', i.toString());
          e.target.style.opacity = '0.5';
        });
        el.addEventListener('dragend', (e) => {
          e.target.style.opacity = '1';
        });

        // Click to cycle: source -> can -> cant -> source
        el.addEventListener('click', () => {
          const parent = el.parentElement;
          if (parent === itemsContainer) {
            zoneCanItems.appendChild(el);
          } else if (parent === zoneCanItems) {
            zoneCantItems.appendChild(el);
          } else {
            itemsContainer.appendChild(el);
          }
        });

        itemsContainer.appendChild(el);
      });
    }

    // Drop zones
    [document.getElementById('zoneCan'), document.getElementById('zoneCant')].forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const idx = e.dataTransfer.getData('text/plain');
        const item = document.querySelector(`.placebo-item[data-index="${idx}"]`);
        if (item) {
          zone.querySelector('.zone-items').appendChild(item);
        }
      });
    });

    checkBtn.addEventListener('click', () => {
      let correct = 0;
      const total = shuffled.length;

      document.querySelectorAll('#zoneCan .zone-items .placebo-item').forEach(el => {
        const idx = parseInt(el.dataset.index);
        if (shuffled[idx].zone === 'can') {
          el.classList.add('correct');
          correct++;
        } else {
          el.classList.add('wrong');
        }
      });

      document.querySelectorAll('#zoneCant .zone-items .placebo-item').forEach(el => {
        const idx = parseInt(el.dataset.index);
        if (shuffled[idx].zone === 'cant') {
          el.classList.add('correct');
          correct++;
        } else {
          el.classList.add('wrong');
        }
      });

      // Items left in source count as wrong
      const placed = document.querySelectorAll('.zone-items .placebo-item').length;

      const pct = Math.round((correct / total) * 100);
      const msg = currentLang === 'en'
        ? `You got <strong>${correct}/${total}</strong> correct (${pct}%)! ${pct === 100 ? '🎉 Perfect! Placebos can modulate symptoms but never cure diseases.' : pct >= 50 ? 'Good job! Remember: placebos work on expectations, not on the disease itself.' : 'Keep learning! The key insight: placebos affect how we <em>feel</em>, not the underlying condition.'}`
        : `Acertaste <strong>${correct}/${total}</strong> (${pct}%)! ${pct === 100 ? '🎉 ¡Perfecto! Los placebos pueden modular síntomas pero nunca curar enfermedades.' : pct >= 50 ? '¡Buen trabajo! Recordá: los placebos actúan sobre las expectativas, no sobre la enfermedad.' : 'Seguí aprendiendo: los placebos afectan cómo nos <em>sentimos</em>, no la condición subyacente.'}`;

      resultDiv.innerHTML = msg;
      checkBtn.style.display = 'none';
      resetBtn.style.display = '';
    });

    resetBtn.addEventListener('click', () => {
      document.querySelectorAll('.placebo-item').forEach(el => {
        el.classList.remove('correct', 'wrong');
      });
      renderItems();
    });

    renderItems();
  }

  initPlaceboGame();

  // ========================
  // 13. TETANUS GAME
  // ========================
  const tetanusData = [
    { text: { en: 'Tetanus is caused by rust on nails.', es: 'El tétanos es causado por el óxido en los clavos.' }, answer: false,
      explain: { en: 'Rust and tetanus are not directly related. The bacteria Clostridium tetani lives in soil, and a rusty nail outdoors is likely dirty — but it\'s the dirt, not the rust.', es: 'El óxido y el tétanos no están directamente relacionados. La bacteria Clostridium tetani vive en la tierra, y un clavo oxidado a la intemperie probablemente estará sucio — pero es la mugre, no el óxido.' } },
    { text: { en: 'Clostridium tetani is an anaerobic bacteria that forms spores.', es: 'Clostridium tetani es una bacteria anaerobia que forma esporas.' }, answer: true,
      explain: { en: 'Correct! It\'s strictly anaerobic (can\'t live with oxygen) and forms super-resistant spores that survive in harsh environments for years.', es: '¡Correcto! Es estrictamente anaerobia (no vive en presencia de oxígeno) y forma esporas súper resistentes que sobreviven en ambientes hostiles durante años.' } },
    { text: { en: 'You need a tetanus shot every time you get a cut.', es: 'Necesitás la antitetánica cada vez que te cortás.' }, answer: false,
      explain: { en: 'Not necessarily! If you\'re up to date with your vaccination schedule (boosters every 10 years) and the wound is clean, you don\'t need a new shot.', es: '¡No necesariamente! Si estás al día con tu esquema de vacunación (refuerzo cada 10 años) y la herida está limpia, no necesitás una nueva dosis.' } },
    { text: { en: 'The tetanus vaccine should be boosted every 10 years.', es: 'La vacuna antitetánica debe reforzarse cada 10 años.' }, answer: true,
      explain: { en: 'Yes! The DT (diphtheria-tetanus) booster is recommended every 10 years for all adults — not just when you get hurt.', es: '¡Sí! El refuerzo DT (difteria-tétanos) se recomienda cada 10 años para todos los adultos — no solo cuando te lastimás.' } },
    { text: { en: 'Tetanus bacteria can only enter through rusty metal wounds.', es: 'La bacteria del tétanos solo puede entrar por heridas con metal oxidado.' }, answer: false,
      explain: { en: 'The bacteria enters through any contaminated wound, animal bites, non-sterile births, open fractures, and more. It\'s everywhere in the environment.', es: 'La bacteria puede entrar por cualquier herida contaminada, mordeduras de animales, partos en condiciones no asépticas, fracturas expuestas, y más. Está en todas partes.' } },
    { text: { en: 'Tetanus releases a neurotoxin that causes muscle spasms and rigid paralysis.', es: 'El tétanos libera una neurotoxina que causa espasmos musculares y parálisis rígida.' }, answer: true,
      explain: { en: 'Once in the nervous system, the bacteria releases a neurotoxin causing severe muscle spasms. In extreme cases, it can paralyze breathing muscles.', es: 'Una vez en el sistema nervioso, la bacteria libera una neurotoxina causando espasmos musculares severos. En casos extremos, puede paralizar los músculos respiratorios.' } },
  ];

  function initTetanusGame() {
    const stack = document.getElementById('tetanusStack');
    const scoreDiv = document.getElementById('tetanusScore');
    const feedbackDiv = document.getElementById('tetanusFeedback');
    const falseBtn = document.getElementById('tetFalse');
    const trueBtn = document.getElementById('tetTrue');
    let currentIndex = 0;
    let score = 0;
    const shuffled = [...tetanusData].sort(() => Math.random() - 0.5);

    function renderCards() {
      stack.innerHTML = '';
      currentIndex = 0;
      score = 0;
      scoreDiv.textContent = '';
      feedbackDiv.innerHTML = '';

      shuffled.forEach((item, i) => {
        const card = document.createElement('div');
        card.className = 'tetanus-claim' + (i > 0 ? ' hidden' : '');
        card.textContent = item.text[currentLang];
        card.dataset.index = i;
        card.setAttribute('data-en', item.text.en);
        card.setAttribute('data-es', item.text.es);
        stack.appendChild(card);
      });
    }

    function answer(userAnswer) {
      if (currentIndex >= shuffled.length) return;

      const item = shuffled[currentIndex];
      const card = stack.children[currentIndex];
      const isCorrect = userAnswer === item.answer;

      if (isCorrect) score++;

      card.classList.add(userAnswer ? 'exit-right' : 'exit-left');

      feedbackDiv.innerHTML = `<span style="color:${isCorrect ? '#4caf50' : '#f44336'};font-weight:600">${isCorrect ? (currentLang === 'en' ? '✓ Correct!' : '✓ ¡Correcto!') : (currentLang === 'en' ? '✗ Not quite!' : '✗ ¡No exactamente!')}</span><br>${item.explain[currentLang]}`;

      scoreDiv.textContent = `${score}/${currentIndex + 1}`;

      currentIndex++;

      setTimeout(() => {
        if (currentIndex < shuffled.length) {
          stack.children[currentIndex].classList.remove('hidden');
        } else {
          const pct = Math.round((score / shuffled.length) * 100);
          feedbackDiv.innerHTML = currentLang === 'en'
            ? `<strong>Final score: ${score}/${shuffled.length} (${pct}%)</strong><br>${pct === 100 ? '🎉 Perfect! You\'re a tetanus myth-buster!' : 'Remember: rust ≠ tetanus, and vaccination is key!'}`
            : `<strong>Puntaje final: ${score}/${shuffled.length} (${pct}%)</strong><br>${pct === 100 ? '🎉 ¡Perfecto! ¡Sos un destructor de mitos del tétanos!' : 'Recordá: óxido ≠ tétanos, ¡y la vacunación es clave!'}`;
        }
      }, 400);
    }

    falseBtn.addEventListener('click', () => answer(false));
    trueBtn.addEventListener('click', () => answer(true));

    renderCards();
  }

  initTetanusGame();

  // ========================
  // 14. P-VALUE GAME
  // ========================
  function initPValueGame() {
    const grid = document.getElementById('pvalueGrid');
    const runBtn = document.getElementById('pvalueRun');
    const resetBtn = document.getElementById('pvalueReset');
    const summaryDiv = document.getElementById('pvalueSummary');
    const insightDiv = document.getElementById('pvalueInsight');
    let totalRuns = 0;
    let totalFalsePositives = 0;

    function resetGrid() {
      grid.innerHTML = '';
      for (let i = 0; i < 20; i++) {
        const cell = document.createElement('div');
        cell.className = 'pvalue-cell';
        cell.innerHTML = `<span class="pval-label">#${i + 1}</span><span class="pval-num">—</span>`;
        grid.appendChild(cell);
      }
      summaryDiv.textContent = '';
      insightDiv.textContent = '';
      totalRuns = 0;
      totalFalsePositives = 0;
    }

    function runExperiment() {
      const cells = grid.querySelectorAll('.pvalue-cell');
      let falsePositives = 0;

      cells.forEach((cell, i) => {
        // Simulate: each experiment has NO real effect.
        // P-value is uniformly distributed under null hypothesis.
        const pValue = Math.random();
        const passed = pValue < 0.05;

        setTimeout(() => {
          cell.className = 'pvalue-cell running';
          setTimeout(() => {
            cell.classList.remove('running');
            cell.classList.add(passed ? 'pass' : 'fail');
            cell.innerHTML = `<span class="pval-label">${passed ? (currentLang === 'en' ? 'FALSE +' : 'FALSO +') : 'OK'}</span><span class="pval-num">p=${pValue.toFixed(3)}</span>`;
          }, 200);
        }, i * 80);

        if (passed) falsePositives++;
      });

      totalRuns++;
      totalFalsePositives += falsePositives;

      setTimeout(() => {
        summaryDiv.innerHTML = currentLang === 'en'
          ? `<span style="color:var(--magenta)">${falsePositives} out of 20</span> experiments got a "significant" result <span style="color:var(--text-muted)">(p &lt; 0.05)</span>`
          : `<span style="color:var(--magenta)">${falsePositives} de 20</span> experimentos obtuvieron un resultado "significativo" <span style="color:var(--text-muted)">(p &lt; 0.05)</span>`;

        insightDiv.innerHTML = currentLang === 'en'
          ? `<strong>None of these experiments tested a real effect!</strong> Yet ~${falsePositives} passed the significance threshold just by chance. This is the core of the p-hacking problem: with enough experiments, you'll always find "significant" results — even when there's nothing there. That's why reproducibility matters so much in science.`
          : `<strong>¡Ninguno de estos experimentos probó un efecto real!</strong> Sin embargo, ~${falsePositives} pasaron el umbral de significancia solo por azar. Este es el núcleo del problema del p-hacking: con suficientes experimentos, siempre vas a encontrar resultados "significativos" — incluso cuando no hay nada. Por eso la reproducibilidad es tan importante en la ciencia.`;
      }, 20 * 80 + 400);
    }

    runBtn.addEventListener('click', runExperiment);
    resetBtn.addEventListener('click', resetGrid);

    resetGrid();
  }

  initPValueGame();

  // ========================
  // 15. UMAMI GAME
  // ========================
  function initUmamiGame() {
    const foodsContainer = document.getElementById('umamiFoods');
    const plate = document.getElementById('umamiPlate');
    const fill = document.getElementById('umamiFill');
    const valueEl = document.getElementById('umamiValue');
    const synergyEl = document.getElementById('umamiSynergy');
    const resetBtn = document.getElementById('umamiReset');

    const foods = [
      { emoji: '🍅', name: { en: 'Tomato', es: 'Tomate' }, type: 'glutamate', umami: 15 },
      { emoji: '🧀', name: { en: 'Parmesan', es: 'Parmesano' }, type: 'glutamate', umami: 25 },
      { emoji: '🍄', name: { en: 'Shiitake', es: 'Shiitake' }, type: 'guanylate', umami: 20 },
      { emoji: '🐟', name: { en: 'Sardine', es: 'Sardina' }, type: 'inosinate', umami: 18 },
      { emoji: '🥩', name: { en: 'Beef', es: 'Carne' }, type: 'inosinate', umami: 16 },
      { emoji: '🐔', name: { en: 'Chicken', es: 'Pollo' }, type: 'inosinate', umami: 14 },
      { emoji: '🫘', name: { en: 'Soy beans', es: 'Soja' }, type: 'glutamate', umami: 12 },
      { emoji: '🥬', name: { en: 'Kombu', es: 'Alga Kombu' }, type: 'glutamate', umami: 30 },
      { emoji: '🫑', name: { en: 'Asparagus', es: 'Espárrago' }, type: 'glutamate', umami: 8 },
      { emoji: '🍬', name: { en: 'Sugar', es: 'Azúcar' }, type: 'none', umami: 0 },
      { emoji: '🧂', name: { en: 'Salt', es: 'Sal' }, type: 'none', umami: 2 },
      { emoji: '🍋', name: { en: 'Lemon', es: 'Limón' }, type: 'none', umami: 1 },
    ];

    let selectedFoods = [];

    function typeLabel(type) {
      const labels = {
        glutamate: 'Glutamate',
        inosinate: 'Inosinate',
        guanylate: 'Guanylate',
        none: currentLang === 'en' ? 'No umami' : 'Sin umami'
      };
      return labels[type] || '';
    }

    function renderFoods() {
      foodsContainer.innerHTML = '';
      foods.forEach((food, i) => {
        const el = document.createElement('div');
        el.className = 'umami-food' + (selectedFoods.includes(i) ? ' selected' : '');
        el.innerHTML = `
          <span class="food-emoji">${food.emoji}</span>
          <span class="food-name" data-en="${food.name.en}" data-es="${food.name.es}">${food.name[currentLang]}</span>
          <span class="food-type">${typeLabel(food.type)}</span>
        `;
        el.addEventListener('click', () => toggleFood(i));
        foodsContainer.appendChild(el);
      });
    }

    function toggleFood(i) {
      const idx = selectedFoods.indexOf(i);
      if (idx > -1) {
        selectedFoods.splice(idx, 1);
      } else {
        if (selectedFoods.length >= 5) return; // max 5
        selectedFoods.push(i);
      }
      updatePlate();
      renderFoods();
    }

    function updatePlate() {
      // Clear plate (keep label)
      plate.querySelectorAll('.plate-food').forEach(el => el.remove());

      let totalUmami = 0;
      let hasGlutamate = false;
      let hasInosinate = false;
      let hasGuanylate = false;

      selectedFoods.forEach(i => {
        const food = foods[i];
        totalUmami += food.umami;
        if (food.type === 'glutamate') hasGlutamate = true;
        if (food.type === 'inosinate') hasInosinate = true;
        if (food.type === 'guanylate') hasGuanylate = true;

        const el = document.createElement('span');
        el.className = 'plate-food';
        el.textContent = food.emoji;
        plate.appendChild(el);
      });

      // Synergy: glutamate + (inosinate or guanylate) = multiplier
      let synergy = false;
      if (hasGlutamate && (hasInosinate || hasGuanylate)) {
        totalUmami = Math.round(totalUmami * 1.8);
        synergy = true;
      }

      const maxUmami = 100;
      const pct = Math.min((totalUmami / maxUmami) * 100, 100);
      fill.style.width = pct + '%';
      valueEl.textContent = totalUmami;

      if (totalUmami > 60) {
        valueEl.style.color = 'var(--magenta)';
      } else if (totalUmami > 30) {
        valueEl.style.color = 'var(--yellow)';
      } else {
        valueEl.style.color = 'var(--text-muted)';
      }

      if (synergy) {
        plate.classList.add('synergy');
        synergyEl.innerHTML = currentLang === 'en'
          ? '⚡ SYNERGY! Glutamate + nucleotides = umami amplified! (×1.8)'
          : '⚡ ¡SINERGIA! Glutamato + nucleótidos = ¡umami amplificado! (×1.8)';
      } else {
        plate.classList.remove('synergy');
        if (selectedFoods.length > 0 && hasGlutamate) {
          synergyEl.innerHTML = currentLang === 'en'
            ? '💡 Try adding meat, fish, or mushrooms for synergy!'
            : '💡 ¡Probá agregar carne, pescado u hongos para lograr sinergia!';
        } else if (selectedFoods.length > 0) {
          synergyEl.innerHTML = currentLang === 'en'
            ? '💡 Add a glutamate-rich food (cheese, tomato, kombu) for synergy!'
            : '💡 ¡Agregá un alimento rico en glutamato (queso, tomate, kombu) para sinergia!';
        } else {
          synergyEl.innerHTML = '';
        }
      }
    }

    resetBtn.addEventListener('click', () => {
      selectedFoods = [];
      renderFoods();
      updatePlate();
    });

    renderFoods();
    updatePlate();
  }

  initUmamiGame();

  // ========================
  // 16. LANGUAGE REINIT FOR GAMES
  // ========================
  window.reinitGames = function() {
    initPlaceboGame();
    initTetanusGame();
    // P-value and Umami use currentLang at render-time, re-init
    document.getElementById('pvalueGrid').innerHTML = '';
    initPValueGame();
    initUmamiGame();
  };

});
