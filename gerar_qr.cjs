const fs = require('fs');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("=========================================");
console.log("   🤖 CONECTADOR DE WHATSAPP RESENHA   ");
console.log("=========================================\n");

readline.question('1. Cole a sua URL VERDE do Render\n(ex: https://resenha-api-xxx.onrender.com): ', (apiUrl) => {
  readline.question('\n2. Cole a sua SENHA FORTE do Render\n(aquela AUTHENTICATION_API_KEY): ', async (apiKey) => {
    
    const cleanUrl = apiUrl.trim().replace(/\/$/, ""); 
    const cleanKey = apiKey.trim();
    
    console.log("\n⏳ Batendo no servidor " + cleanUrl + " para acordar a API...\n");
    
    try {
      const criarInstancia = await fetch(`${cleanUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': cleanKey
        },
        body: JSON.stringify({
          instanceName: 'ResenhaBot',
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS'
        })
      });
      
      let res = await criarInstancia.json();
      let qrcodeBase64 = null;
      
      if (res.error || (res.message && res.message.includes('already exists'))) {
         console.log("ℹ️ O robô ResenhaBot já estava instanciado. Puxando QR Code novo...");
         const connectRes = await fetch(`${cleanUrl}/instance/connect/ResenhaBot`, {
            headers: { 'apikey': cleanKey }
         });
         const connectData = await connectRes.json();
         qrcodeBase64 = connectData.base64;
      } else if (res.qrcode && res.qrcode.base64) {
         qrcodeBase64 = res.qrcode.base64;
      } else if (res.base64) {
         qrcodeBase64 = res.base64;
      }

      if (qrcodeBase64 && qrcodeBase64.startsWith('data:image')) {
         const html = `
            <html style="background:#0f172a; color:#f8fafc; font-family:sans-serif; text-align:center; padding: 50px;">
                <h1 style="color:#f97316;">SaaS Barbearia Resenha</h1>
                <h2>Abra seu WhatsApp > Aparelhos Conectados</h2>
                <p>Escaneie o QR Code abaixo para conectar o robô à sua Vercel:</p>
                <img src="${qrcodeBase64}" style="width: 350px; border-radius: 10px; border: 15px solid white; margin-top:20px; box-shadow: 0 0 20px #f9731650;" />
                <p style="color:#94a3b8; margin-top: 30px;">(Pode fechar esta janela assim que o celular vibrar conectando)</p>
            </html>
         `;
         fs.writeFileSync('ler_qrcode.html', html);
         console.log("✅ SUCESSO! O Código Secreto foi gerado na sua máquina.");
         console.log("🎉 Um arquivo chamado 'ler_qrcode.html' acabou de ser criado na pasta do projeto!");
         console.log("👉 Dê DOIS CLIQUES no arquivo ler_qrcode.html pelo seu Windows Explorer para ele abrir gigante na tela!");
      } else {
          console.log("❌ O WhatsApp retornou que a sessão já está conectada ou deu erro na imagem.");
          console.log(res);
      }
      
    } catch (e) {
      console.log("❌ Erro grave de conexão. Sua API do Render está ligada e respondendo?");
      console.log("Detalhe do erro:", e.message);
    }
    
    readline.close();
  });
});
