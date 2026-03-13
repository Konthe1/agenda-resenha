import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const renderUrl = process.env.WHATSAPP_API_URL?.trim().replace(/\/$/, "");
    const apiKey = process.env.WHATSAPP_API_KEY?.trim();
    const instanceName = process.env.WHATSAPP_INSTANCE_NAME || 'ResenhaBot';

    if (!renderUrl || !apiKey) {
      return NextResponse.json({ error: 'Configurações de WhatsApp ausentes no servidor (.env)' }, { status: 500 });
    }

    // 1. Tentar criar a instância caso não exista
    const createRes = await fetch(`${renderUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        instanceName: instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS'
      })
    });

    const createData = await createRes.json();
    let qrcodeBase64 = null;

    // Se já existe ou se retornou o QR
    if (createData.error || (createData.message && createData.message.includes('already exists'))) {
      // Puxa o QR Code da classe já conectada
      const connectRes = await fetch(`${renderUrl}/instance/connect/${instanceName}`, {
        headers: { 'apikey': apiKey }
      });
      const connectData = await connectRes.json();
      qrcodeBase64 = connectData.base64;
    } else if (createData.qrcode && createData.qrcode.base64) {
      qrcodeBase64 = createData.qrcode.base64;
    } else if (createData.base64) {
      qrcodeBase64 = createData.base64;
    }

    if (qrcodeBase64 && qrcodeBase64.startsWith('data:image')) {
      return NextResponse.json({ success: true, qrcode: qrcodeBase64 });
    } else {
      // Se não vier a string imagem, provavelmente o WhatsApp já está pareado!
      // Tentar buscar o número para retornar
      let number = null;
      try {
        const stateRes = await fetch(`${renderUrl}/instance/connectionState/${instanceName}`, {
          headers: { 'apikey': apiKey }
        });
        const stateData = await stateRes.json();
        if (stateData.instance && stateData.instance.owner) {
          number = stateData.instance.owner.split('@')[0];
        }
      } catch (e) {
        console.error("Erro ao buscar número na conexão:", e);
      }

      return NextResponse.json({ 
        success: true, 
        alreadyConnected: true, 
        number: number,
        message: 'Aparelho já está conectado. (Se quiser ler de novo, desconecte pelo celular)' 
      });
    }
  } catch (error: any) {
    console.error("Erro ao gerar QR Code:", error);
    return NextResponse.json({ error: 'Erro de comunicação com o servidor de Mensagens (Render)' }, { status: 500 });
  }
}
