const shiftPattern = [
    "1. Gündüz", "2. Gündüz", "3. Gündüz", "4. Gündüz", "5. Gündüz",
    "1. Gece", "1. Dinlenme",
    "2. Gece", "2. Dinlenme",
    "3. Gece", "3. Dinlenme",
    "4. Gece", "4. Dinlenme",
    "5. Gece", "5. Dinlenme"
];

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

    if (!targetDateInput) {
        alert("Lütfen sorgulanacak tarihi seçin.");
        return;
    }

    const targetDate = new Date(targetDateInput);

    referenceDate.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate - referenceDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const calculatedIndex = (((references[groupSelectInput] + diffDays) % 15) + 15) % 15;

    resultText.innerText = shiftPattern[calculatedIndex];
    resultBox.classList.remove('hidden');
}
