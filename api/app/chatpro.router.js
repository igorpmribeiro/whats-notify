import { Router } from 'express';

const createChatProRouter = (chatProClient) => {
	const chatProRouter = Router();

	chatProRouter.get('/status', async (req, res) => {
		try {
			const status = await chatProClient.getStatus();
			res.json(status);
		} catch (error) {
			res
				.status(500)
				.json({ error: 'Failed to get status', details: error.message });
		}
	});

	// Rota que retorna apenas o JSON com o QR code
	chatProRouter.get('/qrcode', async (req, res) => {
		try {
			const qrCode = await chatProClient.qrCodeGenerate();
			res.json(qrCode);
		} catch (error) {
			res
				.status(500)
				.json({ error: 'Failed to generate QR code', details: error.message });
		}
	});

	// Rota que exibe o QR code em uma página HTML
	chatProRouter.get('/qrcode/display', async (req, res) => {
		try {
			const qrCodeData = await chatProClient.qrCodeGenerate();

			if (!qrCodeData.qr) {
				return res.status(400).json({ error: 'QR code not available' });
			}

			const htmlPage = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsApp QR Code</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
            margin: 20px;
        }
        .logo {
            font-size: 2.5em;
            margin-bottom: 20px;
            color: #25D366;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 1.8em;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1em;
        }
        .qr-container {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
            margin: 30px 0;
            border: 2px solid #e9ecef;
        }
        .qr-code {
            max-width: 280px;
            max-height: 280px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .instructions {
            background: #e3f2fd;
            border-radius: 10px;
            padding: 20px;
            margin-top: 20px;
            text-align: left;
        }
        .instructions h3 {
            color: #1976d2;
            margin-top: 0;
            font-size: 1.2em;
        }
        .instructions ol {
            color: #555;
            line-height: 1.6;
        }
        .instructions li {
            margin-bottom: 8px;
        }
        .refresh-btn {
            background: #25D366;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1em;
            margin-top: 20px;
            transition: background 0.3s ease;
        }
        .refresh-btn:hover {
            background: #20c157;
        }
        .status {
            margin-top: 20px;
            padding: 10px;
            border-radius: 5px;
            font-weight: bold;
        }
        .status.loading {
            background: #fff3cd;
            color: #856404;
        }
        .status.connected {
            background: #d4edda;
            color: #155724;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">📱</div>
        <h1>Conectar WhatsApp</h1>
        <p class="subtitle">Escaneie o QR code abaixo com seu WhatsApp</p>
        
        <div class="qr-container">
            <img src="${qrCodeData.qr}" alt="QR Code do WhatsApp" class="qr-code" />
        </div>

        <div class="instructions">
            <h3>📋 Como conectar:</h3>
            <ol>
                <li>Abra o <strong>WhatsApp</strong> no seu celular</li>
                <li>Toque em <strong>Menu</strong> (⋮) ou <strong>Configurações</strong></li>
                <li>Toque em <strong>Aparelhos conectados</strong></li>
                <li>Toque em <strong>Conectar um aparelho</strong></li>
                <li>Aponte a câmera para este QR code</li>
            </ol>
        </div>

        <button class="refresh-btn" onclick="window.location.reload()">
            🔄 Gerar novo QR Code
        </button>

        <div id="status" class="status loading">
            ⏳ Aguardando conexão...
        </div>
    </div>

    <script>
        // Auto-refresh da página após 2 minutos (QR codes expiram)
        setTimeout(() => {
            window.location.reload();
        }, 120000);

        // Simular verificação de status (você pode implementar uma verificação real)
        let checkCount = 0;
        const statusDiv = document.getElementById('status');
        
        const checkStatus = () => {
            checkCount++;
            if (checkCount > 30) { // Após ~30 segundos
                statusDiv.className = 'status error';
                statusDiv.innerHTML = '⚠️ QR Code expirando em breve - Clique em "Gerar novo QR Code"';
            }
        };

        // Verificar status a cada 5 segundos
        setInterval(checkStatus, 5000);
    </script>
</body>
</html>`;

			res.send(htmlPage);
		} catch (error) {
			res
				.status(500)
				.json({
					error: 'Failed to generate QR code display',
					details: error.message,
				});
		}
	});

	return chatProRouter;
};

export { createChatProRouter };
