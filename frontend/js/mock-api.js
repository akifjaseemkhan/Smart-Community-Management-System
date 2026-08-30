/* ============================================================
   SCMS — In-browser mock API
   ------------------------------------------------------------
   Intercepts window.fetch for /api/* routes and serves data from
   localStorage, mirroring the real Java servlets 1:1 (same URLs,
   same JSON shapes). Lets the full app run with no backend.

   Enabled by window.SCMS_CONFIG.useMock (see js/config.js).
   Reset the demo data any time with:  ?resetdb   in the URL
   or  SCMS_MOCK.reset()  in the console.
   ============================================================ */
(function () {
  'use strict';

  if (!window.SCMS_CONFIG || !window.SCMS_CONFIG.useMock) return;

  var KEY = 'scms_mock_db_v1';
  var nativeFetch = window.fetch ? window.fetch.bind(window) : null;

  /* ---------- seed data ---------- */
  function seed() {
    var now = Date.now();
    var iso = function (msAgo) { return new Date(now - msAgo).toISOString(); };
    var H = 3600 * 1000, D = 24 * H;

    return {
      seq: { users: 4, visitors: 2, complaints: 3, bills: 5, parking: 6, announcements: 4 },
      users: [
        { id: 1, name: 'Admin User',   email: 'admin@scms.com', password: 'admin123',    role: 'Admin',    phone: '0300-0000001', apartment: '',      created_at: iso(30 * D) },
        { id: 2, name: 'Ali Raza',      email: 'ali@scms.com',   password: 'resident123', role: 'Resident', phone: '0300-1234567', apartment: 'A-203', created_at: iso(28 * D) },
        { id: 3, name: 'Sara Noor',     email: 'sara@scms.com',  password: 'resident123', role: 'Resident', phone: '0300-7654321', apartment: 'B-114', created_at: iso(25 * D) },
        { id: 4, name: 'Guard Hassan',  email: 'guard@scms.com', password: 'guard123',    role: 'Guard',    phone: '0300-9999999', apartment: '',      created_at: iso(20 * D) }
      ],
      visitors: [
        { id: 1, visitor_name: 'Ahmed Khan', cnic: '35202-1234567-1', house_number: 'A-203', purpose: 'Guest',    vehicle_number: 'ABC-2341', visit_time: '10:30', notes: '', status: 'Approved', added_by: 4, created_at: iso(3 * H) },
        { id: 2, visitor_name: 'Bilal Aziz', cnic: '35202-7654321-2', house_number: 'B-114', purpose: 'Delivery', vehicle_number: 'LEA-8821', visit_time: '12:15', notes: 'Courier — leave at gate', status: 'Pending', added_by: 4, created_at: iso(1 * H) }
      ],
      complaints: [
        { id: 1, resident_id: 2, apartment: 'A-203', category: 'Maintenance', priority: 'High',   description: 'Water leakage in Block A parking area.',   status: 'Open',     created_at: iso(5 * D) },
        { id: 2, resident_id: 3, apartment: 'B-114', category: 'Electrical',  priority: 'Medium', description: 'Street light not working near Block B.',   status: 'Pending',  created_at: iso(3 * D) },
        { id: 3, resident_id: 2, apartment: 'A-203', category: 'Security',    priority: 'Low',    description: 'Security camera angle needs adjustment.', status: 'Resolved', created_at: iso(1 * D) }
      ],
      bills: [
        { id: 1, resident_id: 2, apartment: 'A-203', service: 'Maintenance Fee',  month: 'May 2026',  amount: 5000, status: 'Paid',    created_at: iso(20 * D) },
        { id: 2, resident_id: 2, apartment: 'A-203', service: 'Parking Charges',  month: 'May 2026',  amount: 1500, status: 'Paid',    created_at: iso(20 * D) },
        { id: 3, resident_id: 2, apartment: 'A-203', service: 'Security Charges', month: 'May 2026',  amount: 1000, status: 'Paid',    created_at: iso(20 * D) },
        { id: 4, resident_id: 2, apartment: 'A-203', service: 'Maintenance Fee',  month: 'June 2026', amount: 5000, status: 'Pending', created_at: iso(2 * D) },
        { id: 5, resident_id: 3, apartment: 'B-114', service: 'Maintenance Fee',  month: 'June 2026', amount: 5000, status: 'Pending', created_at: iso(2 * D) }
      ],
      parking: [
        { id: 1, slot_number: 'P-01', resident_id: 2,    vehicle_number: 'ABC-2341', status: 'Occupied'  },
        { id: 2, slot_number: 'P-02', resident_id: 3,    vehicle_number: 'LEA-8821', status: 'Occupied'  },
        { id: 3, slot_number: 'P-03', resident_id: null, vehicle_number: null,       status: 'Available' },
        { id: 4, slot_number: 'P-04', resident_id: null, vehicle_number: null,       status: 'Available' },
        { id: 5, slot_number: 'P-05', resident_id: null, vehicle_number: null,       status: 'Available' },
        { id: 6, slot_number: 'P-06', resident_id: null, vehicle_number: null,       status: 'Reserved'  }
      ],
      announcements: [
        { id: 1, title: 'Water Supply Interruption',        message: 'Water supply will be interrupted on the 12th from 9AM to 2PM for pipeline maintenance. Please store water in advance.', type: 'Warning', posted_by: 1, created_at: iso(6 * D) },
        { id: 2, title: 'Community Eid Gathering',          message: 'All residents are invited to the community Eid celebration on the 15th at 7PM in the main hall. Food and activities for all ages!', type: 'Event', posted_by: 1, created_at: iso(4 * D) },
        { id: 3, title: 'New Security Cameras Installed',   message: 'We have installed 8 new HD security cameras at all entry and exit points. Your safety is our priority.', type: 'Info', posted_by: 1, created_at: iso(2 * D) },
        { id: 4, title: 'Parking Rules Reminder',           message: 'Reminder: visitors are not allowed to park in resident slots. Violating vehicles will be towed. Please inform your guests.', type: 'Urgent', posted_by: 1, created_at: iso(1 * D) }
      ]
    };
  }

  /* ---------- storage ---------- */
  var db;
  function load() {
    if (new URLSearchParams(location.search).has('resetdb')) { localStorage.removeItem(KEY); }
    try {
      var raw = localStorage.getItem(KEY);
      db = raw ? JSON.parse(raw) : seed();
    } catch (e) { db = seed(); }
    save();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {}
  }
  load();

  window.SCMS_MOCK = {
    reset: function () { localStorage.removeItem(KEY); location.reload(); },
    db: function () { return db; }
  };

  /* ---------- helpers ---------- */
  function userName(id) { var u = db.users.find(function (x) { return x.id === id; }); return u ? u.name : null; }
  function nextId(coll) { db.seq[coll] = (db.seq[coll] || 0) + 1; return db.seq[coll]; }
  function byNewest(a, b) {
    var d = String(b.created_at || '').localeCompare(String(a.created_at || ''));
    return d !== 0 ? d : (b.id - a.id);
  }
  function isToday(iso) {
    return typeof iso === 'string' && iso.slice(0, 10) === new Date().toISOString().slice(0, 10);
  }
  function json(body, status) {
    return new Response(JSON.stringify(body), {
      status: status || 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  function num(v, d) { var n = parseFloat(v); return isNaN(n) ? (d || 0) : n; }

  /* ---------- route table ---------- */
  function handle(route, method, q, body) {
    switch (route) {

      case 'login': {
        var u = db.users.find(function (x) {
          return x.email === (body.email || '').trim() &&
                 x.password === (body.password || '').trim() &&
                 x.role === (body.role || '').trim();
        });
        if (!u) return json({ success: false, message: 'Invalid email, password, or role.' });
        return json({ success: true, userId: u.id, name: u.name, role: u.role, apartment: u.apartment || '' });
      }

      case 'dashboard':
        return json({
          success: true,
          totalResidents: db.users.filter(function (u) { return u.role === 'Resident'; }).length,
          todayVisitors: db.visitors.filter(function (v) { return isToday(v.created_at); }).length,
          openComplaints: db.complaints.filter(function (c) { return c.status === 'Open'; }).length,
          pendingBills: db.bills.filter(function (b) { return b.status === 'Pending'; }).length,
          availableParking: db.parking.filter(function (p) { return p.status === 'Available'; }).length,
          totalVisitors: db.visitors.length,
          pendingVisitors: db.visitors.filter(function (v) { return v.status === 'Pending'; }).length
        });

      case 'visitors': {
        if (method === 'GET') {
          return json(db.visitors.slice().sort(byNewest).map(function (v) {
            return {
              id: v.id, visitor_name: v.visitor_name, cnic: v.cnic, house_number: v.house_number,
              purpose: v.purpose, vehicle_number: v.vehicle_number || '', visit_time: v.visit_time || '',
              notes: v.notes || '', status: v.status, created_at: v.created_at,
              added_by_name: userName(v.added_by) || ''
            };
          }));
        }
        if (method === 'POST') {
          var nv = {
            id: nextId('visitors'),
            visitor_name: body.visitor_name || '', cnic: body.cnic || '',
            house_number: body.house_number || '', purpose: body.purpose || 'Guest',
            vehicle_number: body.vehicle_number || '', visit_time: body.visit_time || '',
            notes: body.notes || '', status: 'Pending',
            added_by: body.added_by || 1, created_at: new Date().toISOString()
          };
          db.visitors.push(nv); save();
          return json({ success: true, id: nv.id, message: 'Visitor added successfully.' });
        }
        if (method === 'PUT') {
          var v = db.visitors.find(function (x) { return x.id === (body.id | 0); });
          if (v) { v.status = body.status; save(); }
          return json({ success: true });
        }
        if (method === 'DELETE') {
          db.visitors = db.visitors.filter(function (x) { return x.id !== (parseInt(q.id, 10)); });
          save();
          return json({ success: true });
        }
        break;
      }

      case 'complaints': {
        if (method === 'GET') {
          return json(db.complaints.slice().sort(byNewest).map(function (c) {
            return {
              id: c.id, resident_id: c.resident_id, apartment: c.apartment, category: c.category,
              priority: c.priority, description: c.description, status: c.status,
              created_at: c.created_at, resident_name: userName(c.resident_id) || 'Unknown'
            };
          }));
        }
        if (method === 'POST') {
          var nc = {
            id: nextId('complaints'),
            resident_id: body.resident_id || 0, apartment: body.apartment || '',
            category: body.category || 'Other', priority: body.priority || 'Medium',
            description: body.description || '', status: 'Open',
            created_at: new Date().toISOString()
          };
          db.complaints.push(nc); save();
          return json({ success: true, id: nc.id, message: 'Complaint submitted successfully.' });
        }
        if (method === 'PUT') {
          var c = db.complaints.find(function (x) { return x.id === (body.id | 0); });
          if (c) { c.status = body.status; save(); }
          return json({ success: true });
        }
        break;
      }

      case 'bills': {
        if (method === 'GET') {
          var rows = db.bills.slice();
          if (q.resident_id) {
            var rid = parseInt(q.resident_id, 10);
            rows = rows.filter(function (b) { return b.resident_id === rid; });
          }
          return json(rows.sort(byNewest).map(function (b) {
            return {
              id: b.id, resident_id: b.resident_id, apartment: b.apartment, service: b.service,
              month: b.month, amount: b.amount, status: b.status, created_at: b.created_at,
              resident_name: userName(b.resident_id) || null
            };
          }));
        }
        if (method === 'POST') {
          var nb = {
            id: nextId('bills'),
            resident_id: body.resident_id || 0, apartment: body.apartment || '',
            service: body.service || '', month: body.month || '',
            amount: num(body.amount), status: 'Pending',
            created_at: new Date().toISOString()
          };
          db.bills.push(nb); save();
          return json({ success: true, id: nb.id });
        }
        if (method === 'PUT') {
          var b = db.bills.find(function (x) { return x.id === (body.id | 0); });
          if (b) { b.status = body.status; save(); }
          return json({ success: true });
        }
        break;
      }

      case 'parking': {
        if (method === 'GET') {
          return json(db.parking.slice().sort(function (a, b) {
            return String(a.slot_number).localeCompare(String(b.slot_number));
          }).map(function (p) {
            return {
              id: p.id, slot_number: p.slot_number, vehicle_number: p.vehicle_number || '',
              status: p.status, resident_name: userName(p.resident_id) || ''
            };
          }));
        }
        if (method === 'PUT') {
          var p = db.parking.find(function (x) { return x.id === (body.id | 0); });
          if (p) {
            p.status = body.status;
            p.vehicle_number = body.vehicle_number ? body.vehicle_number : null;
            p.resident_id = (body.resident_id && body.resident_id > 0) ? body.resident_id : null;
            save();
          }
          return json({ success: true });
        }
        break;
      }

      case 'announcements': {
        if (method === 'GET') {
          return json(db.announcements.slice().sort(byNewest).map(function (a) {
            return {
              id: a.id, title: a.title, message: a.message, type: a.type,
              posted_by_name: userName(a.posted_by) || 'Admin', created_at: a.created_at
            };
          }));
        }
        if (method === 'POST') {
          var na = {
            id: nextId('announcements'),
            title: body.title || '', message: body.message || '',
            type: body.type || 'Info', posted_by: body.posted_by || 1,
            created_at: new Date().toISOString()
          };
          db.announcements.push(na); save();
          return json({ success: true, id: na.id });
        }
        if (method === 'DELETE') {
          db.announcements = db.announcements.filter(function (x) { return x.id !== parseInt(q.id, 10); });
          save();
          return json({ success: true });
        }
        break;
      }

      case 'users': {
        if (method === 'GET') {
          return json(db.users.slice().sort(byNewest).map(function (u) {
            return {
              id: u.id, name: u.name, email: u.email, role: u.role,
              phone: u.phone || '', apartment: u.apartment || '', created_at: u.created_at
            };
          }));
        }
        if (method === 'POST') {
          if (db.users.some(function (u) { return u.email === (body.email || ''); })) {
            return json({ success: false, message: 'Email already exists.' });
          }
          var nu = {
            id: nextId('users'),
            name: body.name || '', email: body.email || '',
            password: body.password || 'user123', role: body.role || 'Resident',
            phone: body.phone || '', apartment: body.apartment || '',
            created_at: new Date().toISOString()
          };
          db.users.push(nu); save();
          return json({ success: true, id: nu.id, message: 'User added successfully.' });
        }
        if (method === 'DELETE') {
          db.users = db.users.filter(function (x) { return x.id !== parseInt(q.id, 10); });
          save();
          return json({ success: true });
        }
        break;
      }
    }
    return json({ success: false, message: 'Mock: unhandled ' + method + ' /' + route }, 404);
  }

  /* ---------- fetch interceptor ---------- */
  window.fetch = function (input, init) {
    var url = (typeof input === 'string') ? input : (input && input.url) || '';
    var match = url.match(/\/api\/(login|dashboard|visitors|complaints|bills|parking|announcements|users)(?:\?([^#]*))?$/);
    if (!match) return nativeFetch ? nativeFetch(input, init) : Promise.reject(new Error('fetch unavailable'));

    var route = match[1];
    var q = {};
    if (match[2]) {
      new URLSearchParams(match[2]).forEach(function (val, k) { q[k] = val; });
    }
    var method = ((init && init.method) || (typeof input === 'object' && input.method) || 'GET').toUpperCase();
    var body = {};
    var rawBody = (init && init.body) || null;
    if (rawBody && typeof rawBody === 'string') {
      try { body = JSON.parse(rawBody); } catch (e) { body = {}; }
    }

    return new Promise(function (resolve) {
      // small delay so loading spinners are visible, like a real network
      setTimeout(function () {
        try { resolve(handle(route, method, q, body)); }
        catch (err) { resolve(json({ success: false, message: 'Mock error: ' + err.message }, 500)); }
      }, 120);
    });
  };

  console.info('%cSCMS mock API active', 'color:#818cf8;font-weight:bold', '— data in localStorage. Reset: SCMS_MOCK.reset()');
})();
