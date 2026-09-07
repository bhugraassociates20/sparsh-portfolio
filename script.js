/* Sparsh Mehta — portfolio behaviour
   Plain ES5-safe DOM code, no framework. Everything degrades gracefully:
   with JS off you still get the full page, just without reveal/active states. */

(function () {
    'use strict';

    // One source of truth for whether we animate at all.
    var CALM = window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var nav      = document.getElementById('nav');
    var burger   = document.getElementById('burger');
    var navLinks = document.getElementById('navLinks');
    var progress = document.getElementById('progress');

    /* ---------------------------------------------------------------- Nav */

    if (burger && navLinks) {
        burger.addEventListener('click', function (e) {
            e.stopPropagation();
            var open = navLinks.classList.toggle('is-open');
            burger.setAttribute('aria-expanded', String(open));
            burger.innerHTML = open
                ? '<i class="fas fa-xmark"></i>'
                : '<i class="fas fa-bars"></i>';
        });

        // Close on outside click or link tap
        document.addEventListener('click', function (e) {
            if (!navLinks.classList.contains('is-open')) return;
            if (burger.contains(e.target) || navLinks.contains(e.target)) return;
            close();
        });
        navLinks.addEventListener('click', function (e) {
            if (e.target.tagName === 'A') close();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });
    }

    function close() {
        if (!navLinks) return;
        navLinks.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.innerHTML = '<i class="fas fa-bars"></i>';
    }

    /* --------------------------------------------- Scroll: nav + progress */

    var ticking = false;
    var hero = document.getElementById('top');
    var swapAt = 0;

    // The nav is transparent while it overlaps the dark hero, and only takes on
    // its light fill once that band has scrolled past — otherwise a pale slab
    // sits on top of the dark artwork.
    function measure() {
        swapAt = hero ? Math.max(0, hero.offsetHeight - nav.offsetHeight - 8) : 12;
    }

    function onScroll() {
        var y = window.scrollY || window.pageYOffset;

        if (nav) nav.classList.toggle('is-scrolled', y > swapAt);

        if (progress) {
            var max = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
        }
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(onScroll);
    }, { passive: true });

    window.addEventListener('resize', function () { measure(); onScroll(); });
    measure();
    onScroll();

    /* ------------------------------------------------- Reveal on scroll */

    var revealables = document.querySelectorAll('[data-reveal]');

    if (!('IntersectionObserver' in window)) {
        // No observer support: show everything rather than hiding content.
        for (var i = 0; i < revealables.length; i++) {
            revealables[i].classList.add('is-in');
        }
    } else {
        var revealer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                revealer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

        revealables.forEach(function (el) { revealer.observe(el); });
    }

    /* ---------------------------------------------------- Stagger indices */

    // CSS reads --i for its transition-delay; setting it here keeps the
    // markup free of hand-written index attributes.
    Array.prototype.forEach.call(document.querySelectorAll('[data-stagger]'), function (group) {
        Array.prototype.forEach.call(group.children, function (child, i) {
            child.style.setProperty('--i', i);
        });
    });

    /* -------------------------------------------------------- Count-up */

    // Animates any [data-count] once its card scrolls in. The final value is
    // already in the HTML, so this degrades to plain correct numbers.
    function countUp(el) {
        var target = parseFloat(el.getAttribute('data-count'));
        var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
        if (isNaN(target)) return;

        if (CALM) { el.textContent = target.toFixed(dec); return; }

        var DURATION = 1100;
        var final = target.toFixed(dec);
        var start = null;
        var done = false;

        function settle() {
            if (done) return;
            done = true;
            el.textContent = final;
        }

        function frame(now) {
            if (done) return;
            if (start === null) start = now;
            var t = Math.min((now - start) / DURATION, 1);
            var eased = 1 - Math.pow(1 - t, 3);          // easeOutCubic
            el.textContent = (target * eased).toFixed(dec);
            if (t < 1) window.requestAnimationFrame(frame);
            else settle();
        }
        window.requestAnimationFrame(frame);

        // Guarantee the real figure lands even if rAF is throttled or never
        // runs again (backgrounded tab, low-power mode). Without this a
        // half-finished tween can be left on screen as if it were the value.
        window.setTimeout(settle, DURATION + 400);
    }

    var counters = document.querySelectorAll('[data-count]');

    if (!('IntersectionObserver' in window) || CALM) {
        Array.prototype.forEach.call(counters, function (el) {
            el.textContent = parseFloat(el.getAttribute('data-count'))
                .toFixed(parseInt(el.getAttribute('data-dec') || '0', 10));
        });
    } else {
        var countObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                countObserver.unobserve(entry.target);
                countUp(entry.target);
            });
        }, { threshold: 0.4 });
        Array.prototype.forEach.call(counters, function (el) { countObserver.observe(el); });
    }

    /* ----------------------------------------------------------- Lottie */

    // Loaded lazily and never under reduced-motion: these are decoration, and
    // they shouldn't cost anything on first paint.
    function initLottie() {
        if (CALM || typeof lottie === 'undefined') return;

        var holders = document.querySelectorAll('[data-lottie]');
        if (!holders.length) return;

        function mount(el) {
            if (el.dataset.mounted) return;

            var key = el.getAttribute('data-lottie');
            var bank = window.LOTTIE_ANIMS || {};
            var opts = {
                container: el,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                rendererSettings: { progressiveLoad: false, preserveAspectRatio: 'xMidYMid meet' }
            };

            // Prefer the inlined data. Fetching a sibling .json is blocked by
            // CORS when the page is opened over file://, which silently killed
            // every animation for anyone who just double-clicked the HTML.
            if (bank[key]) {
                opts.animationData = bank[key];
            } else if (/\.json($|\?)/.test(key)) {
                opts.path = key;
            } else {
                return;                       // unknown key, nothing to draw
            }

            el.dataset.mounted = '1';
            try {
                lottie.loadAnimation(opts);
            } catch (e) {
                if (window.console) console.warn('Lottie failed:', e);
            }
        }

        if (!('IntersectionObserver' in window)) {
            Array.prototype.forEach.call(holders, mount);
            return;
        }

        var lottieObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                lottieObserver.unobserve(entry.target);
                mount(entry.target);
            });
        }, { rootMargin: '200px 0px' });

        Array.prototype.forEach.call(holders, function (el) { lottieObserver.observe(el); });
    }

    initLottie();

    /* ------------------------------------------------ Active nav section */

    var linkFor = {};
    var watched = [];

    Array.prototype.forEach.call(
        navLinks ? navLinks.querySelectorAll('a[href^="#"]') : [],
        function (a) {
            var target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            linkFor[target.id] = a;
            watched.push(target);
        }
    );

    if ('IntersectionObserver' in window && watched.length) {
        var visible = {};

        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                visible[entry.target.id] = entry.isIntersecting
                    ? entry.intersectionRatio
                    : 0;
            });

            // Highlight whichever watched section currently occupies the most viewport.
            var best = null, bestRatio = 0;
            Object.keys(visible).forEach(function (id) {
                if (visible[id] > bestRatio) { bestRatio = visible[id]; best = id; }
            });

            Object.keys(linkFor).forEach(function (id) {
                linkFor[id].classList.toggle('is-active', id === best);
            });
        }, { threshold: [0, 0.15, 0.4, 0.75], rootMargin: '-72px 0px -40% 0px' });

        watched.forEach(function (el) { spy.observe(el); });
    }

    /* ---------------------------------------------------------- Footer year */

    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    /* ------------------------------------------------------- Contact form */

    var EMAILJS_KEY      = 'B2GoeB6Vd2wHCHrA9';
    var EMAILJS_SERVICE  = 'service_gabi5g9';
    var EMAILJS_TEMPLATE = 'template_70852i7';

    var form = document.getElementById('contact-form');
    var note = document.getElementById('formNote');

    if (form && typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_KEY);

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var btn = form.querySelector('button[type="submit"]');
            var idle = btn.innerHTML;
            var noteIdle = note ? note.textContent : '';

            // Native validation, surfaced through the note line.
            if (!form.checkValidity()) {
                if (note) note.textContent = 'Please fill in every field with a valid email.';
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
            if (note) note.textContent = '';

            emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
                from_name:  form.querySelector('[name="from_name"]').value,
                from_email: form.querySelector('[name="from_email"]').value,
                message:    form.querySelector('[name="message"]').value
            }).then(function () {
                btn.innerHTML = '<i class="fas fa-check"></i> Message sent';
                form.reset();
                if (note) note.textContent = 'Thanks — I\'ll get back to you shortly.';
                restore(btn, idle, noteIdle);
            }, function (err) {
                btn.innerHTML = '<i class="fas fa-triangle-exclamation"></i> Failed to send';
                if (note) note.textContent = 'Something went wrong. Email sipsmehta@gmail.com directly.';
                if (window.console) console.error('EmailJS error:', err);
                restore(btn, idle, noteIdle);
            });
        });
    }

    function restore(btn, idle, noteIdle) {
        window.setTimeout(function () {
            btn.disabled = false;
            btn.innerHTML = idle;
            if (note) note.textContent = noteIdle;
        }, 4000);
    }
})();
