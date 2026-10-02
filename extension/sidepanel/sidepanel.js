document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chatBox');
  const chatForm = document.getElementById('chatForm');
  const userInput = document.getElementById('userInput');
  const targetTabTitle = document.getElementById('targetTabTitle');
  const targetThumbImg = document.getElementById('targetThumbImg');
  const targetThumbPlaceholder = document.getElementById('targetThumbPlaceholder');
  const helpBtn = document.getElementById('helpBtn');
  const askBtn = document.getElementById('askBtn');
  const voiceBtn = document.getElementById('voiceBtn');
  const explainBtn = document.getElementById('explainBtn');
  const micBtn = document.getElementById('micBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusText = document.getElementById('statusText');

  // Settings UI elements
  const settingsToggleBtn = document.getElementById('settingsToggleBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');

  // Permanent 24/7 Vercel Production Server URL
  const VERCEL_API_URL = 'https://screenmate-ai.vercel.app/api/analyze-screen';
  const GROQ_DIRECT_URL = 'https://api.groq.com/openai/v1/chat/completions';
  const GROQ_MODELS = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
  let groqApiKey = '';

  let activeTabTitleStr = 'Target Tab';
  let isListening = false;
  let recognition = null;

  // Load API key from Chrome's private browser storage
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['groqApiKey'], (res) => {
      if (res && res.groqApiKey) {
        groqApiKey = res.groqApiKey;
      }
      if (apiKeyInput && groqApiKey) apiKeyInput.value = groqApiKey;
    });
  }

  // Toggle settings panel
  settingsToggleBtn?.addEventListener('click', () => {
    if (!settingsPanel) return;
    settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
  });

  saveApiKeyBtn?.addEventListener('click', () => {
    const val = (apiKeyInput.value || '').trim();
    if (!val) return;
    groqApiKey = val;
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ groqApiKey: val });
    }
    settingsPanel.style.display = 'none';
    appendAssistantMsg('✅ API Key updated and securely saved.');
  });

  // Speech Recognition API setup
  const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechAPI) {
    recognition = new SpeechAPI();
    recognition.lang = 'en-US';
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      userInput.value = transcript;
      micBtn.style.color = '#94a3b8';
      processScreenAnalysis(transcript);
    };
    recognition.onerror = () => {
      micBtn.style.color = '#94a3b8';
      isListening = false;
    };
    recognition.onend = () => {
      micBtn.style.color = '#94a3b8';
      isListening = false;
    };
  }

  const toggleVoice = () => {
    if (!recognition) return alert('Speech recognition is not supported in this browser.');
    if (!isListening) {
      recognition.start();
      isListening = true;
      micBtn.style.color = '#f43f5e';
    } else {
      recognition.stop();
      isListening = false;
      micBtn.style.color = '#94a3b8';
    }
  };

  micBtn?.addEventListener('click', toggleVoice);
  voiceBtn?.addEventListener('click', toggleVoice);

  // Fetch initial active tab info
  chrome.runtime.sendMessage({ type: 'GET_ACTIVE_TAB_INFO' }, (res) => {
    if (res && res.title) {
      activeTabTitleStr = res.title;
      targetTabTitle.textContent = res.title;
    }
  });

  // Listen for real-time active tab switching
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'ACTIVE_TAB_CHANGED') {
      activeTabTitleStr = msg.title || 'Target Tab';
      targetTabTitle.textContent = activeTabTitleStr;
    }
  });

  const appendUserMsg = (text) => {
    const group = document.createElement('div');
    group.className = 'sm-msg-group sm-user';
    group.innerHTML = `
      <div class="sm-msg-author" style="justify-content: flex-end;">You</div>
      <div class="sm-msg-bubble">${text}</div>
    `;
    chatBox.appendChild(group);
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  const appendAssistantMsg = (analysis) => {
    const group = document.createElement('div');
    group.className = 'sm-msg-group';
    let cardContent = analysis.replace(/\n/g, '<br/>');

    group.innerHTML = `
      <div class="sm-msg-author">ScreenMate AI (24/7 Cloud)</div>
      <div class="sm-msg-bubble">${cardContent}</div>
    `;
    chatBox.appendChild(group);
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  // Direct Groq Cloud Call (Fail-safe instant response with multi-model fallback)
  const callDirectGroq = async (questionText, tabTitle) => {
    if (!groqApiKey) return null;
    for (const m of GROQ_MODELS) {
      try {
        const gRes = await fetch(GROQ_DIRECT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: m,
            messages: [
              {
                role: 'system',
                content: 'You are ScreenMate AI, a real-time visual computer-use copilot. Answer directly, clearly, and concisely based on the user active screen context.',
              },
              {
                role: 'user',
                content: `User Question: ${questionText === 'Help' ? 'What should I do on this active screen?' : questionText}\nActive Target Screen Context: Active Tab Title is "${tabTitle}".`,
              },
            ],
            max_tokens: 800,
            temperature: 0.2,
          }),
        });

        if (gRes.ok) {
          const d = await gRes.json();
          const raw = d.choices?.[0]?.message?.content || '';
          const clean = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          if (clean) return clean;
        }
      } catch (e) {
        // try next model
      }
    }
    return null;
  };

  const processScreenAnalysis = async (questionText = 'Help') => {
    appendUserMsg(questionText);
    statusText.textContent = '24/7 AI Thinking...';

    const loadingGroup = document.createElement('div');
    loadingGroup.className = 'sm-msg-group';
    loadingGroup.innerHTML = `
      <div class="sm-msg-author">ScreenMate AI</div>
      <div class="sm-msg-bubble" style="color: #06b6d4;">◉ <em>AI analyzing target screen (${activeTabTitleStr})...</em></div>
    `;
    chatBox.appendChild(loadingGroup);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Capture ONLY the target tab (excludes Side Panel completely)
    chrome.runtime.sendMessage({ type: 'CAPTURE_CURRENT_TAB' }, async (response) => {
      if (response && response.dataUrl) {
        // Update Target Thumbnail Preview in Context Card
        targetThumbImg.src = response.dataUrl;
        targetThumbImg.style.display = 'block';
        targetThumbPlaceholder.style.display = 'none';

        let finalAnswer = null;

        // 1. Try Vercel Serverless Endpoint
        try {
          const res = await fetch(VERCEL_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: response.dataUrl,
              question: questionText,
              textContext: `Active Tab Title: ${activeTabTitleStr}. User is asking guidance on this active target webpage.`,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.analysis && !data.analysis.includes('Active Desktop Workspace')) {
              finalAnswer = data.analysis;
            }
          }
        } catch (err) {
          // Vercel network issue
        }

        // 2. Direct Groq Cloud fallback if Vercel returned fallback
        if (!finalAnswer && groqApiKey) {
          finalAnswer = await callDirectGroq(questionText, activeTabTitleStr);
        }

        chatBox.removeChild(loadingGroup);
        statusText.textContent = '24/7 Vercel Active';

        if (finalAnswer) {
          appendAssistantMsg(finalAnswer);
        } else {
          appendAssistantMsg('ScreenMate AI analyzed the screen, but service is briefly busy. Please click HELP again.');
        }
      } else {
        chatBox.removeChild(loadingGroup);
        statusText.textContent = '24/7 Vercel Active';
        const errMsg = response && response.error ? response.error : '';
        if (errMsg.includes('chrome://') || errMsg.includes('Cannot capture')) {
          appendAssistantMsg('⚠️ Internal browser pages (chrome://) cannot be captured due to Chrome security policy. Please switch to any website tab (such as ChatGPT, Google, GitHub, etc.) to use ScreenMate AI.');
        } else {
          appendAssistantMsg('Failed to capture target tab. Please switch to an active website tab.');
        }
      }
    });
  };

  helpBtn?.addEventListener('click', () => processScreenAnalysis('Help'));
  explainBtn?.addEventListener('click', () => processScreenAnalysis('Explain what is currently visible on this target screen'));
  askBtn?.addEventListener('click', () => {
    if (userInput.value.trim()) {
      processScreenAnalysis(userInput.value.trim());
      userInput.value = '';
    } else {
      userInput.focus();
    }
  });

  stopBtn?.addEventListener('click', () => {
    if (recognition && isListening) recognition.stop();
    targetThumbImg.style.display = 'none';
    targetThumbPlaceholder.style.display = 'flex';
    statusText.textContent = 'Stopped';
    appendAssistantMsg('Emergency Stop Activated. Target capture and mic halted.');
  });

  chatForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = userInput.value.trim();
    if (!val) return;
    userInput.value = '';
    processScreenAnalysis(val);
  });
});
