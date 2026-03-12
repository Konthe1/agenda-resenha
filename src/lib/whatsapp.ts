/**
 * Integração com API de WhatsApp (Ex: Evolution API)
 * Esse arquivo centraliza as chamadas disparadas para o servidor de mensageria.
 */

// Como o Evolution API ou APIs similares como Z-API funcionam:
// Em produção, isso vira variáveis de ambiente reais do servidor Evolution (ou Z-API)
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "http://localhost:8080";
const WHATSAPP_INSTANCE_NAME = process.env.WHATSAPP_INSTANCE_NAME || 'ResenhaBot';
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || "seu-token-global-aqui";

type WhatsAppMessagePayload = {
  number: string;
  options: {
    delay: number;
    presence: string;
    linkPreview: boolean;
  };
  textMessage: {
    text: string;
  };
};

/**
 * Envia uma mensagem de texto simples via WhatsApp
 * @param phone Número do destinatário no formato internacional ex: 5511999999999
 * @param message Texto da mensagem
 */
export async function sendWhatsAppMessage(phone: string, message: string) {
  if (!phone || !message) {
    throw new Error("Telefone e mensagem são obrigatórios.");
  }

  // Remove caracteres não numéricos do telefone
  const cleanPhone = phone.replace(/\D/g, "");

  const payload: WhatsAppMessagePayload = {
    number: cleanPhone,
    options: {
      delay: 1200, // delay em ms digitando
      presence: "composing", // mostra "Escrevendo..."
      linkPreview: false,
    },
    textMessage: {
      text: message,
    },
  };

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/message/sendText/${WHATSAPP_INSTANCE_NAME}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'apikey': WHATSAPP_API_KEY, 
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro na API de WhatsApp:", errorData);
      return { success: false, error: errorData };
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    console.error("Falha ao se conectar com a API de WhatsApp:", error);
    return { success: false, error: "Falha de conexão com disparador." };
  }
}

/**
 * Função utilitária para montar a mensagem de confirmação
 */
export function buildConfirmationMessage(nomeCliente: string, nomeServico: string, dataHoraStr: string, barbeariaNome: string) {
  return `✅ *Agendamento Confirmado!*\n\nOlá ${nomeCliente}, seu horário está reservado com sucesso na *${barbeariaNome}*.\n\n✂️ *Serviço:* ${nomeServico}\n🗓️ *Quando:* ${dataHoraStr}\n\nTe esperamos lá! Em caso de imprevistos, por favor nos avise com antecedência.`;
}
