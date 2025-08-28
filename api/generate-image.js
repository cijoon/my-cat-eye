// Dosya Yolu: api/generate-image.js

import OpenAI from 'openai';

// 1. Vercel'deki Environment Variable'dan API anahtarını alarak OpenAI istemcisini başlat
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Sadece POST metodu kabul edilir.' });
  }

  try {
    // 2. Mobil uygulamadan gelen base64 formatındaki resmi al
    const { image: base64Image } = req.body;
    if (!base64Image) {
      return res.status(400).json({ message: 'Resim verisi bulunamadı.' });
    }
    
    // =================================================================================
    // AŞAMA 1: FOTOĞRAFI ANLAMA (GPT-4o Vision ile)
    // =================================================================================
    console.log('Aşama 1: Fotoğraf analiz ediliyor...');
    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4o', // En yeni ve en iyi vision modeli
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Bu resimde ne görüyorsun? Bunu bir sanat tablosu için basit bir komut (prompt) olarak, kısa ve net bir şekilde, bir cümleyle açıkla. Örneğin: "Masanın üzerindeki meyve tabağı".' },
            {
              type: 'image_url',
              image_url: {
                // base64 verisini OpenAI'nin beklediği formata çevir
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 50, // Cevabın çok uzun olmaması için
    });

    const imageDescription = visionResponse.choices[0].message.content;
    console.log(`Anlaşılan içerik: ${imageDescription}`);

    // =================================================================================
    // AŞAMA 2: YENİ RESMİ ÇİZME (DALL-E 3 ile)
    // =================================================================================
    // GPT-4o'dan gelen açıklamayı daha sanatsal bir komuta dönüştür
    const artisticPrompt = `Bir kedinin gözünden, ${imageDescription}. Dijital sanat, canlı ve etkileyici renkler.`;
    console.log(`Oluşturulan sanatsal komut: ${artisticPrompt}`);

    const imageResponse = await openai.images.generate({
      model: 'dall-e-3', // En kaliteli resim modeli
      prompt: artisticPrompt,
      n: 1, // 1 adet resim oluştur
      size: '1024x1024', // Resim boyutu
      quality: 'standard', // 'hd' veya 'standard' olabilir
    });
    
    // DALL-E tarafından oluşturulan resmin URL'sini al
    const generatedImageUrl = imageResponse.data[0].url;
    console.log(`Oluşturulan resim URL'si: ${generatedImageUrl}`);

    // =================================================================================
    // SONUÇ: Mobil uygulamaya yanıtı gönder
    // =================================================================================
    res.status(200).json({ success: true, imageUrl: generatedImageUrl });

  } catch (error) {
    console.error('OpenAI API Hatası:', error);
    res.status(500).json({ success: false, message: 'Görsel oluşturulurken bir hata oluştu.' });
  }
}