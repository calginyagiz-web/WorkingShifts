function hesapla() {

    const gun = parseInt(document.getElementById("gun").value);
    const ay = parseInt(document.getElementById("ay").value);
    const yil = parseInt(document.getElementById("yil").value);

    if (!gun || !ay || !yil) {
        document.getElementById("sonuc").innerText = "Lütfen tüm alanları doldurun";
        return;
    }

    const girilenTarih = new Date(yil, ay - 1, gun);

    // Başlangıç tarihi → 21 Şubat 2026 = 2.gece
    const baslangic = new Date(2026, 1, 21);

    const vardiya = [
        "1.gündüz", "2.gündüz", "3.gündüz", "4.gündüz", "5.gündüz",
        "1.gece", "1.dinlenme",
        "2.gece", "2.dinlenme",
        "3.gece", "3.dinlenme",
        "4.gece", "4.dinlenme",
        "5.gece", "5.dinlenme"
    ];

    const baslangicIndex = 7; // 2.gece

    const farkMs = girilenTarih - baslangic;
    const gunFarki = Math.floor(farkMs / (1000 * 60 * 60 * 24));

    let index = (baslangicIndex + (gunFarki % 15) + 15) % 15;

    document.getElementById("sonuc").innerText = vardiya[index];
}