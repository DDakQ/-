let factors;
let chart;

fetch("./data/emission_factors.json")
  .then(res => res.json())
  .then(data => {
    factors = data;

    document.getElementById("calc-btn").addEventListener("click", () => {
      const km = Number(document.getElementById("car-km").value);

      const result = km * factors.car;

      document.getElementById("result").textContent =
        `오늘 탄소 배출량: ${result.toFixed(2)} kg CO2`;

      drawChart(result);
    });
  });

function drawChart(value) {
  const ctx = document.getElementById("resultChart").getContext("2d");

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["탄소 배출량"],
      datasets: [
        {
          label: "kg CO₂",
          data: [value]
        }
      ]
    },
    options: {}
  });
}
