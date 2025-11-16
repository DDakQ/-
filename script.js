let factors;
let chart;

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat;
      const target = document.getElementById("cat-" + cat);

      target.classList.toggle("open");
    });
  });
});  

fetch("./data/emission_factors.json")
  .then(res => res.json())
  .then(data => {
    factors = data;

  document.getElementById("calc-btn").addEventListener("click", () => {
    const inputs = document.querySelectorAll(".factor-input");

    const categorySums = {
    move: 0,
    food: 0,
    device: 0
  };

  inputs.forEach(input => {
    const id = input.dataset.factorId;  
    const category = id.replace(/[0-9]/g, ""); // move1 -> move

    const value = Number(input.value);
    const factor = factors[id];

    if (!isNaN(value) && factor !== undefined) {
      const emission = value * factor;
      categorySums[category] += emission;
    }
  });

    const total = categorySums.move + categorySums.food + categorySums.device;

    document.getElementById("total-result").textContent =
      `총 탄소 배출량: ${total.toFixed(2)} kg CO₂`;

    drawChart(categorySums);
  });
});

function drawChart(categorySums) {
  const ctx = document.getElementById("resultChart").getContext("2d");

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["이동", "음식", "전자기기 사용"],
    datasets: [
        {
          label: "kg CO₂",
          data: [
            categorySums.move,
            categorySums.food,
            categorySums.device
          ]
        }
      ]
    },
    options: {
      indexAxis: "y" 
    }
  });
}
