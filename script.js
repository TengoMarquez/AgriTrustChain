document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });

    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const voiceButton = document.getElementById('voice-button');

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    voiceButton.addEventListener('click', startVoiceRecognition);

    const commonQuestions = document.querySelectorAll('.common-question');

    // 为常见问题按钮添加点击事件
    commonQuestions.forEach(button => {
        button.addEventListener('click', function() {
            const question = this.textContent;
            userInput.value = question;
            sendMessage();
        });
    });

    async function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            appendMessage('用户', message);
            userInput.value = '';
            
            try {
                appendMessage('AI', '正在思考中...');
                const response = await callAIAPI(message);
                // 移除"正在思考中..."消息
                chatMessages.removeChild(chatMessages.lastChild);
                appendMessage('AI', response);
            } catch (error) {
                console.error('Error:', error);
                // 移除"正在思考中..."消息
                chatMessages.removeChild(chatMessages.lastChild);
                appendMessage('AI', `抱歉，发生了一个错误：${error.message}。请稍后再试。`);
            }
        }
    }

    function appendMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function callAIAPI(message) {
        const apiKey = getAPIKey();
        const data = {
            model: "glm-4",
            messages: [
                {
                    role: "user",
                    content: message
                }
            ]
        };

        try {
            const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.choices && result.choices.length > 0 && result.choices[0].message) {
                return result.choices[0].message.content;
            } else {
                throw new Error('Unexpected API response structure');
            }
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }

    function startVoiceRecognition() {
        // 这里应该实现语音识别功能
        alert('语音识别功能正在开发中...');
    }

    // 添加案例研究和新闻的动态加载功能
    function loadMoreContent(sectionId) {
        // 这里应该从服务器加载更多内容
        console.log(`加载更多${sectionId}内容`);
    }

    // 示例：为"查看更多新闻"按钮添加点击事件
    const loadMoreNewsBtn = document.querySelector('#news .btn-outline-primary');
    if (loadMoreNewsBtn) {
        loadMoreNewsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loadMoreContent('news');
        });
    }

    // 图片懒加载
    var lazyloadImages = document.querySelectorAll("img.lazy-load");    
    var lazyloadThrottleTimeout;
    
    function lazyload () {
        if(lazyloadThrottleTimeout) {
            clearTimeout(lazyloadThrottleTimeout);
        }    
        
        lazyloadThrottleTimeout = setTimeout(function() {
            var scrollTop = window.pageYOffset;
            lazyloadImages.forEach(function(img) {
                if(img.offsetTop < (window.innerHeight + scrollTop)) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-load');
                }
            });
            if(lazyloadImages.length == 0) { 
                document.removeEventListener("scroll", lazyload);
                window.removeEventListener("resize", lazyload);
                window.removeEventListener("orientationChange", lazyload);
            }
        }, 20);
    }
    
    document.addEventListener("scroll", lazyload);
    window.addEventListener("resize", lazyload);
    window.addEventListener("orientationChange", lazyload);
});

// 添加鉴权相关函数
function getAuthHeader() {
    const useJWT = true; // 设置为true使用JWT,false使用API Key
    
    if (useJWT) {
        return `Bearer ${generateJWTToken()}`;
    } else {
        return `Bearer ${getAPIKey()}`;
    }
}

function getAPIKey() {
    // 注意:在实际生产环境中,不应该直接在客户端代码中存储API key
    // 这里仅作为示例,实际应用中应该从服务器端安全地获取
    return '0d4505033489d068c149389a56b9bec3.IvuqrupzKSMh6gdX';
}

function generateJWTToken() {
    // 这里需要实现JWT token的生成逻辑
    // 您可能需要使用一个JWT库来帮助生成token
    // 以下是一个示例实现,实际使用时需要替换为真实的逻辑
    const apiKey = getAPIKey();
    const [id, secret] = apiKey.split('.');
    
    const header = {
        alg: 'HS256',
        sign_type: 'SIGN'
    };
    
    const payload = {
        api_key: id,
        exp: Date.now() + 3600000, // 1小时后过期
        timestamp: Date.now()
    };
    
    // 注意:这里使用了一个假设的jwt_encode函数,您需要使用实际的JWT库
    return jwt_encode(header, payload, secret);
}

// 修改sendMessage函数,添加鉴权header
function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() === '') return;

    addMessage('user', userInput);
    document.getElementById('user-input').value = '';

    // 准备发送到AI服务的数据
    const data = {
        model: "glm-4",
        messages: [
            {
                role: "user",
                content: userInput
            }
        ]
    };

    // 发送请求到AI服务
    fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader() // 使用鉴权header
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        // 处理AI响应
        const aiResponse = result.choices[0].message.content;
        addMessage('ai', aiResponse);
    })
    .catch(error => {
        console.error('Error:', error);
        addMessage('ai', '抱歉,我遇到了一些问题。请稍后再试。');
    });
}

// 其他现有代码...