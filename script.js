document.addEventListener('DOMContentLoaded', function() {
    const URL_BASE_DA_API = 'https://Cecilirililarila.pythonanywhere.com'; 

    const welcomeScreen = document.getElementById('welcomeScreen');
    const startButton = document.getElementById('startButton');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');
    let selectedFile = null;

    // Configura a biblioteca que formata as respostas da IA
    marked.setOptions({
        breaks: true,
        gfm: true,
    });

    // Ação do botão "Começar agora"
    startButton.addEventListener('click', function() {
        welcomeScreen.classList.add('hidden');
        setTimeout(() => {
            addMarkdownMessage(
                `# Olá! 👋 Sou o FineDu, seu assistente financeiro premium\n\n` +
                `Antes de começarmos, gostaria de entender melhor sua situação financeira.\n\n` +
                `Por favor, responda este breve questionário para que eu possa te ajudar da melhor forma possível:`, 
                'bot'
            );
            addQuestionnaire();
            scrollToBottom();
        }, 500);
    });

    // Lógica para o campo de texto crescer conforme digita
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        sendButton.disabled = this.value.trim() === '';
    });

    // Lógica para enviar com a tecla Enter
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendButton.disabled) sendMessage();
        }
    });

    // Ação do botão de enviar
    sendButton.addEventListener('click', sendMessage);

    // Função que envia a pergunta do chat para a API
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;

        addMessage(message, 'user');
        chatInput.value = '';
        chatInput.style.height = 'auto';
        sendButton.disabled = true;
        typingIndicator.classList.add('active');
        scrollToBottom();
        
        // Chama a API no PythonAnywhere
        fetch(`${URL_BASE_DA_API}/api/pergunta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensagem: message }),
        })
        .then(response => {
            if (!response.ok) { throw new Error('Erro na resposta do servidor'); }
            return response.json();
        })
        .then(data => {
            typingIndicator.classList.remove('active');
            addMarkdownMessage(data.resposta, 'bot');
            scrollToBottom();
        })
        .catch(error => {
            typingIndicator.classList.remove('active');
            addMarkdownMessage("**Desculpe, ocorreu um erro** 😢\n\nNão consegui me conectar ao servidor. Por favor, tente novamente mais tarde.", 'bot');
            console.error('Error:', error);
            scrollToBottom();
        });
    }

    // Função para adicionar uma mensagem simples na tela
    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
    }

    // Função para adicionar uma mensagem formatada (da IA) na tela
    function addMarkdownMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = marked.parse(content);
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
    }

    // Função que envia o questionário para a API
    function submitQuestionnaire() {
        const answers = {};
        let allAnswered = true;
        
        document.querySelectorAll('.question-item').forEach(question => {
            const questionId = question.querySelector('input[type="radio"]').name;
            const selectedOption = question.querySelector(`input[name="${questionId}"]:checked`);
            if (selectedOption) {
                answers[questionId] = selectedOption.value;
            } else {
                allAnswered = false;
            }
        });
        
        if (!allAnswered) {
            alert('Por favor, responda todas as perguntas antes de enviar.');
            return;
        }
        
        // Usa FormData para poder enviar o arquivo junto com o texto
        const formData = new FormData();
        formData.append('respostas', JSON.stringify(answers));

        if (selectedFile) {
            formData.append('planilha', selectedFile);
        }
        
        document.querySelector('.questionnaire').remove();
        typingIndicator.classList.add('active');
        scrollToBottom();

        // Chama a API no PythonAnywhere
        fetch(`${URL_BASE_DA_API}/api/analisar-perfil`, {
            method: 'POST',
            body: formData 
        })
        .then(response => response.json())
        .then(data => {
            typingIndicator.classList.remove('active');
            addMarkdownMessage(data.resposta, 'bot');
            scrollToBottom();
        })
        .catch(error => {
            typingIndicator.classList.remove('active');
            addMarkdownMessage("**Ops! Tive um problema ao analisar seu perfil.** Tente me fazer uma pergunta diretamente.", 'bot');
            console.error('Error:', error);
            scrollToBottom();
        });
    }

    // Função para rolar o chat para baixo
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Função que cria o HTML do questionário
    function addQuestionnaire() {
        const questions = [
            { id: "q1", text: "1. Você tem economias?", options: [ { id: "q1a", text: "Guardo sempre uma parte do dinheiro que tenho" }, { id: "q1b", text: "Às vezes guardo uma parte, mas não consigo juntar a longo prazo" }, { id: "q1c", text: "Já tentei, mas não tenho renda suficiente, acabo gastando" }, { id: "q1d", text: "Gasto assim que tenho a oportunidade" } ] },
            { id: "q2", text: "2. Para você, o que é investimento?", options: [ { id: "q2a", text: "Algo essencial para o progresso financeiro" }, { id: "q2b", text: "Uma ferramenta que pode servir ao meu favor em momentos específicos" }, { id: "q2c", text: "Algo que eu não pratico, mas gostaria" }, { id: "q2d", text: "Nunca investi/meus investimentos nunca dão certo" } ] },
            { id: "q3", text: "3. Como você lida com o seu orçamento mensal?", options: [ { id: "q3a", text: "Tenho um planejamento com categorias e sigo quase sempre" }, { id: "q3b", text: "Tenho uma noção geral, mas não acompanho exatamente" }, { id: "q3c", text: "Já tentei me organizar, mas me perco com gastos inesperados" }, { id: "q3d", text: "Nem sei quanto gasto por mês" } ] },
            { id: "q4", text: "4. Você costuma anotar suas despesas?", options: [ { id: "q4a", text: "Sim, anoto tudo, inclusive centavos" }, { id: "q4b", text: "Anoto os principais gastos" }, { id: "q4c", text: "Só anoto quando vejo que estou gastando demais" }, { id: "q4d", text: "Nunca anoto nada" } ] },
            { id: "q5", text: "5. Você tem dívidas?", options: [ { id: "q5a", text: "Nenhuma, ou só dívidas planejadas (como financiamento)" }, { id: "q5b", text: "Algumas, mas consigo controlar" }, { id: "q5c", text: "Tenho dívidas e às vezes atraso" }, { id: "q5d", text: "Estou endividado(a) e não sei como sair disso" } ] },
            { id: "q6", text: "6. Como você vê o uso de cartão de crédito?", options: [ { id: "q6a", text: "Uso com controle, sempre pago o total da fatura" }, { id: "q6b", text: "Uso com cautela, mas às vezes parcelo" }, { id: "q6c", text: "Costumo parcelar muito e nem sempre acompanho" }, { id: "q6d", text: "Já perdi o controle, vivo no rotativo ou no mínimo" } ] },
            { id: "q7", text: "7. Quais são seus objetivos financeiros?", options: [ { id: "q7a", text: "Tenho metas claras e prazos definidos" }, { id: "q7b", text: "Tenho sonhos, mas não defini como alcançá-los" }, { id: "q7c", text: "Penso nisso às vezes, mas não me planejei" }, { id: "q7d", text: "Vivo o presente, futuro é futuro" } ] },
            { id: "q8", text: "8. Qual é seu nível de conhecimento sobre educação financeira?", options: [ { id: "q8a", text: "Leio, estudo e aplico no dia a dia" }, { id: "q8b", text: "Tenho conhecimento básico e sigo algumas dicas" }, { id: "q8c", text: "Entendo pouco, mas tenho interesse" }, { id: "q8d", text: "Não entendo nada e nunca procurei aprender" } ] }
        ];

        const questionnaireDiv = document.createElement('div');
        questionnaireDiv.className = 'message bot-message questionnaire';
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        questions.forEach(question => {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            const questionText = document.createElement('div');
            questionText.className = 'question-text';
            questionText.textContent = question.text;
            questionItem.appendChild(questionText);
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';
            
            question.options.forEach(option => {
                const label = document.createElement('label');
                label.className = 'option-label';
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = question.id;
                input.value = option.text;
                label.appendChild(input);
                label.appendChild(document.createTextNode(option.text));
                optionsContainer.appendChild(label);
            });
            questionItem.appendChild(optionsContainer);
            contentDiv.appendChild(questionItem);
        });
        
        const fileUploadDiv = document.createElement('div');
        fileUploadDiv.className = 'file-upload-container';
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'fileInput';
        fileInput.className = 'hidden';
        fileInput.accept = '.pdf';
        
        const fileLabel = document.createElement('label');
        fileLabel.htmlFor = 'fileInput';
        fileLabel.className = 'file-upload-label';
        fileLabel.innerHTML = '<i class="fas fa-file-pdf"></i> Enviar extrato PDF (opcional)';
        
        const fileNameSpan = document.createElement('div');
        fileNameSpan.className = 'file-name';
        
        fileInput.addEventListener('change', function(e) {
            if (this.files.length > 0) {
                selectedFile = this.files[0];
                fileNameSpan.textContent = `Arquivo: ${selectedFile.name}`;
            } else {
                selectedFile = null;
                fileNameSpan.textContent = '';
            }
        });
        
        fileUploadDiv.appendChild(fileLabel);
        fileUploadDiv.appendChild(fileNameSpan);
        fileUploadDiv.appendChild(fileInput);
        contentDiv.appendChild(fileUploadDiv);
        
        const submitButton = document.createElement('button');
        submitButton.className = 'submit-questionnaire';
        submitButton.textContent = 'Enviar Questionário e Começar';
        submitButton.addEventListener('click', submitQuestionnaire);
        
        contentDiv.appendChild(submitButton);
        questionnaireDiv.appendChild(contentDiv);
        chatMessages.appendChild(questionnaireDiv);
    }
});