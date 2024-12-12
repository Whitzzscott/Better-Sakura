const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cron = require('node-cron');
const sanitizeHtml = require('sanitize-html');
const llamaTokenizer = require('llama-tokenizer-js');
const fs = require('fs');
const path = require('path');
const { detect } = require('langdetect');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const app = express();
const port = 8080;
const PORT = 8080;

app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const ipBlacklist = new Set();
const maxRequestsPerMinute = 100;
const requestCounts = new Map();

const firewall = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (ipBlacklist.has(clientIP)) {
        return res.status(STATUS_CODES.FORBIDDEN).json({ error: 'Access denied' });
    }

    const now = Date.now();
    const minute = Math.floor(now / 60000);
    
    const key = `${clientIP}-${minute}`;
    const currentCount = requestCounts.get(key) || 0;

    if (currentCount >= maxRequestsPerMinute) {
        ipBlacklist.add(clientIP);
        return res.status(STATUS_CODES.TOO_MANY_REQUESTS).json({ error: 'Rate limit exceeded' });
    }

    requestCounts.set(key, currentCount + 1);

    setTimeout(() => {
        requestCounts.delete(key);
    }, 60000);

    next();
};

app.use(firewall);

const supabaseUrl = 'https://bxyfmilggdesccagtmgj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4eWZtaWxnZ2Rlc2NjYWd0bWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2NDE1MDksImV4cCI6MjA0OTIxNzUwOX0.-22tQMN69dB8inBMIVOyOlXQv0T-XireA-g-M1V3mg4';
const supabase = createClient(supabaseUrl, supabaseKey);

function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (authHeader !== 'Bearer SSS155') {
        return res.status(401).send("<h1>You are not allowed here</h1>");
    }
    next();
}
cron.schedule('*/5 * * * *', async () => {
  try {
    await axios.get(`http://localhost:${PORT}/ping`);
    console.log('Server has started again');
  } catch (error) {
    console.log('Error pinging server:', error);
  }
});

app.get('/ping', (req, res) => {
  console.log('Ping received');
  res.send('Pong');
});

const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: Buffer.from('Too many login attempts, please try again later').toString('base64')
});

app.set('trust proxy', 1);
app.use(session({
  secret: '3c2bde4d3c7d0c3f5c80a3f44a3a08d8db06c90ed4d975cfe6f1eaaefc9b8e8a',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

const loginAttempts = {};
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_TIME = 15 * 60 * 1000;

app.post('/login', loginLimiter, async (req, res) => {
  const { name, password } = req.body;
  const sanitizedName = sanitizeHtml(name, {
    allowedTags: [],
    allowedAttributes: {}
  }).replace(/[^a-zA-Z0-9]/g, '');

  try {
    if (loginAttempts[sanitizedName]) {
      const { attempts, lockoutUntil } = loginAttempts[sanitizedName];
      
      if (lockoutUntil && Date.now() < lockoutUntil) {
        const remainingTime = Math.ceil((lockoutUntil - Date.now()) / 1000 / 60);
        return res.status(STATUS_CODES.TOO_MANY_REQUESTS).send(Buffer.from(`Account locked Try again in ${remainingTime} minutes`).toString('base64'));
      }
      
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        loginAttempts[sanitizedName].lockoutUntil = Date.now() + LOCKOUT_TIME;
        return res.status(STATUS_CODES.TOO_MANY_REQUESTS).send(Buffer.from('Too many failed attempts Account locked for 15 minutes').toString('base64'));
      }
    } else {
      loginAttempts[sanitizedName] = { attempts: 0 };
    }

    const { data: loginRecords, error: recordError } = await supabase
      .from('login_records')
      .select('id, status')
      .eq('user_name', sanitizedName)
      .eq('status', 'Logged In')
      .single();

    if (loginRecords) {
      return res.status(STATUS_CODES.FORBIDDEN).send(Buffer.from('This account is already logged in elsewhere').toString('base64'));
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('name, password')
      .eq('name', sanitizedName);

    if (error || !users || users.length === 0 || users[0].password !== password) {
      loginAttempts[sanitizedName].attempts++;
      return res.status(STATUS_CODES.UNAUTHORIZED).send(Buffer.from('Invalid username or password').toString('base64'));
    }

    loginAttempts[sanitizedName] = { attempts: 0 };
    req.session.isLoggedIn = true;
    req.session.userName = sanitizedName;
    req.session.csrfToken = require('crypto').randomBytes(32).toString('hex');
    req.session.is_login = true;

    const clientIp = req.ip;
    const userAgent = req.get('User-Agent');
    const currentTime = new Date().toISOString();

    const { data: existingRecord, error: existingError } = await supabase
      .from('login_records')
      .select('id')
      .eq('user_name', sanitizedName)
      .single();

    if (!existingRecord) {
      const { error: insertError } = await supabase
        .from('login_records')
        .insert([{ 
          user_name: sanitizedName,
          login_time: currentTime,
          status: 'Logged In'
        }]);

      if (insertError) {
        return res.status(STATUS_CODES.SERVER_ERROR).send(Buffer.from('Error creating login record').toString('base64'));
      }
    } else {
      const { error: updateError } = await supabase
        .from('login_records')
        .update({ 
          login_time: currentTime,
          status: 'Logged In'
        })
        .eq('id', existingRecord.id);

      if (updateError) {
        return res.status(STATUS_CODES.SERVER_ERROR).send(Buffer.from('Error updating login record').toString('base64'));
      }
    }

    await supabase
      .from('audit_logs')
      .insert([{
        user_name: sanitizedName,
        action: 'LOGIN',
        timestamp: currentTime,
        ip_address: clientIp,
        user_agent: userAgent
      }]);
      
    res.status(STATUS_CODES.OK).send(Buffer.from('Login successful').toString('base64'));
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).send(Buffer.from('Server error occurred').toString('base64'));
  }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: Buffer.from('Too many registration attempts please try again later').toString('base64')
});

app.post('/register', registerLimiter, async (req, res) => {
  const { name, password } = req.body;
  const sanitizedName = sanitizeHtml(name, {
    allowedTags: [],
    allowedAttributes: {}
  }).replace(/[^a-zA-Z0-9]/g, '');

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ name: sanitizedName, password: password }]);

    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).send(Buffer.from('Error registering user').toString('base64'));
    }

    res.status(STATUS_CODES.CREATED).send(Buffer.from('User registered successfully').toString('base64'));
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).send(Buffer.from('Internal server error').toString('base64'));
  }
});

app.post('/logout', async (req, res) => {
  try {
    const { data: loginRecord, error: logoutError } = await supabase
      .from('login_records')
      .update({ status: 'Logged Out' })
      .eq('status', 'Logged In');

    if (logoutError) {
      return res.status(500).send(Buffer.from('Error updating logout status').toString('base64'));
    }

    req.session.is_login = false;
    req.session.destroy();
    res.send(Buffer.from('Logged out successfully').toString('base64'));
  } catch (error) {
    res.status(500).send(Buffer.from('Server error occurred').toString('base64')); 
  }
});

app.get('/check-login-status', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');

  try {
    const { data: loginRecord, error } = await supabase
      .from('login_records')
      .select('status')
      .single();

    if (error) {
      return res.json({ is_login: false });
    }

    if (!loginRecord || loginRecord.status === 'Logged Out') {
      return res.json({ is_login: false });
    }

    const isLoggedIn = loginRecord.status === 'Logged In';
    req.session.is_login = isLoggedIn;
    res.json({ is_login: isLoggedIn });
  } catch (error) {
    res.json({ is_login: false });
  }
});

app.post('/tokenize', authenticate, async (req, res) => {
    const { text } = req.body;
    if (!text || text.length < 10) {
        return res.status(400).json({ error: "Text must be at least 10 characters long." });
    }

    try {
        const detectedLanguage = detect(text);
        console.log(`Detected Language: ${detectedLanguage}`);
    } catch (e) {
        return res.status(400).json({ error: "Error detecting language" });
    }

    const tokenizer = new llamaTokenizer.LlamaTokenizer();
    const tokens = await tokenizer.encode(text);

    let tokenDetails = [];
    let totalTokens = 0;
    let uniqueTokens = new Set();

    tokens.forEach((token) => {
        totalTokens++;
        uniqueTokens.add(token);
        tokenDetails.push({ token, decoded_token: tokenizer.decode([token]) });
    });

    const wordCount = text.trim().split(/\s+/).length;

    const response = {
        "🌟 Tokenized Text 🌟": text,
        "🧮 Total Token Count 🧮": totalTokens,
        "💬 Word Count 💬": wordCount,
        "✨ Unique Token Count ✨": uniqueTokens.size,
        "🔍 Tokenization Details 🔍": tokenDetails
    };

    res.json(response);
});
app.post('/prompt_library', authenticate, async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: "Invalid input. Please provide a 'text' field." });
    }

    try {
        const { data: prompts } = await supabase
            .from('prompts')
            .select('id')
            .order('id', { ascending: false })
            .limit(1);

        const newId = prompts.length > 0 ? prompts[0].id + 1 : 1;

        const { data, error } = await supabase
            .from('prompts')
            .insert([{ id: newId, text }]);

        if (error) {
            return res.status(400).json({ error: "Error adding prompt" });
        }

        res.status(201).json({ message: "Prompt added successfully", prompt: { id: newId, text } });
    } catch (error) {
        res.status(500).json({ error: "Server error occurred" });
    }
});

app.get('/prompts', authenticate, async (req, res) => {
    const { page = 1, per_page = 10 } = req.query;
    const start = (page - 1) * per_page;

    try {
        const { data: prompts, error, count } = await supabase
            .from('prompts')
            .select('*', { count: 'exact' })
            .range(start, start + per_page - 1);

        if (error) {
            return res.status(400).json({ error: "Error fetching prompts" });
        }

        res.json({
            prompts,
            page: parseInt(page),
            per_page: parseInt(per_page),
            total_prompts: count
        });
    } catch (error) {
        res.status(500).json({ error: "Server error occurred" });
    }
});

app.get('/prompt_search', authenticate, async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: "Please provide a search query." });
    }

    try {
        const { data: searchResults, error, count } = await supabase
            .from('prompts')
            .select('*', { count: 'exact' })
            .or(`text.ilike.%${query}%,id.eq.${query}`);

        if (error) {
            return res.status(400).json({ error: "Error searching prompts" });
        }

        res.json({ search_results: searchResults, total_results: count });
    } catch (error) {
        res.status(500).json({ error: "Server error occurred" });
    }
});

app.put('/prompt_update/:prompt_id', authenticate, async (req, res) => {
    const { prompt_id } = req.params;
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: "Invalid input. Please provide a 'text' field." });
    }

    try {
        const { data, error } = await supabase
            .from('prompts')
            .update({ text })
            .eq('id', prompt_id)
            .select();

        if (error || !data || data.length === 0) {
            return res.status(404).json({ error: "Prompt not found or update failed" });
        }

        res.json({ message: "Prompt updated successfully", prompt: data[0] });
    } catch (error) {
        res.status(500).json({ error: "Server error occurred" });
    }
});

app.post('/api/send/feedback', authenticate, async (req, res) => {
    const { feedback } = req.body;

    if (!feedback) {
        return res.status(400).json({ error: "Please provide feedback content" });
    }

    try {
        const { data, error } = await supabase
            .from('feedback')
            .insert([{ content: feedback }])
            .select();

        if (error) {
            return res.status(400).json({ error: "Error submitting feedback" });
        }

        res.json({ message: "Feedback submitted successfully", feedback: data[0] });
    } catch (error) {
        res.status(500).json({ error: "Server error occurred" });
    }
});

app.post('/api/send/bugreport', authenticate, async (req, res) => {
    const { feedback } = req.body;

    if (!feedback) {
        return res.status(400).json({ error: "Please provide bug report content" });
    }

    try {
        const { data, error } = await supabase
            .from('bugreport')
            .insert([{ content: feedback }])
            .select();

        if (error) {
            return res.status(400).json({ error: "Error submitting bug report" });
        }

        res.json({ message: "Bug report submitted successfully", report: data[0] });
    } catch (error) {
        res.status(500).json({ error: "Server error occurred" });
    }
});

const generateLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 150,
    message: { error: "You have exceeded your daily quota of 150 requests. Please try again tomorrow." }
});

app.post('/api/generate', generateLimiter, authenticate, async (req, res) => {
    const { prompt, options } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Please provide a prompt" });
    }

    if (!options || !options.mode) {
        return res.status(400).json({ error: "Please provide options with mode" });
    }

    try {
        const response = await axios.post('https://serger.onrender.com/generate', {
            prompt: prompt,
            options: {
                mode: options.mode
            }
        });

        res.json({ response: response.data });
    } catch (error) {
        res.status(500).json({ error: "Server error occurred" });
    }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
