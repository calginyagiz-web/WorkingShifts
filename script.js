// 15 günlük vardiya örüntüsünü tanımlıyoruz
const shiftPattern = [
    "1. Gündüz", "2. Gündüz", "3. Gündüz", "4. Gündüz", "5. Gündüz",
    "1. Gece", "1. Dinlenme",
    "2. Gece", "2. Dinlenme",
    "3. Gece", "3. Dinlenme",
    "4. Gece", "4. Dinlenme",
    "5. Gece", "5. Dinlenme"
];

// Not: JavaScript'te aylar 0'dan başlar (0 = Ocak, 11 = Aralık)
const referenceDate = new Date(2026, 2, 26);

const references = {
    "1": 10,
    "2": 5,
    "3": 0
};

function hesapla() {
    const targetDateInput = document.getElementById('targetDate').value;
    const resultBox = document.getElementById('resultBox');
    const groupSelectInput = document.getElementById('groupSelect').value;
    const resultText = document.getElementById('resultText');

    // Tarih seçilmemişse uyarı ver
    if (!targetDateInput) {
        alert("Lütfen sorgulanacak tarihi seçin.");
        return;
    }

    // Hedef tarihi oluşturuyoruz
    const targetDate = new Date(targetDateInput);

    // Saat farklılıklarından doğacak hataları önlemek için saatleri sıfırlıyoruz
    referenceDate.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    // İki tarih arasındaki milisaniye farkını gün sayısına çeviriyoruz
    const diffTime = targetDate - referenceDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Yeni indeksi buluyoruz
    const calculatedIndex = (((references[groupSelectInput] + diffDays) % 15) + 15) % 15;

    // Sonucu ekrana yazdırıyoruz
    resultText.innerText = shiftPattern[calculatedIndex];
    resultBox.classList.remove('hidden');
}