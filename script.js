let factors;
let chart;

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat;
      const target = document.getElementById("cat-" + cat);

      // 클래스 토글
      target.classList.toggle("open");
      btn.classList.toggle("active"); // ★ 버튼에 active 클래스 토글 추가
    });
  });

  document.getElementById("reset-btn").addEventListener("click", resetCalculator);
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
      const parentId = input.parentElement.id; 
      const category = parentId.replace("cat-", "");
      const value = Number(input.value);
      const factor = factors[id];

      if (!isNaN(value) && factor !== undefined && value > 0) { // value > 0 조건 추가
        const emission = value * factor;
        if (categorySums.hasOwnProperty(category)) {
            categorySums[category] += emission;
        }
      }
    });

    const total = categorySums.move + categorySums.food + categorySums.device;

    // ★ 텍스트 대신 innerHTML을 사용해 span 태그 적용
    document.getElementById("total-result").innerHTML =
      `총 탄소 배출량: <span>${total.toFixed(2)} kg CO₂</span>`;

    // 1. 조언 생성 함수 호출
    const adviceMessage = getAdvice(categorySums);
    
    // 2. HTML 요소에 조언 삽입
    document.getElementById("advice-text").innerHTML = adviceMessage;

    // ★ 결과 컨테이너 표시
    document.getElementById("results-wrapper").classList.remove("hidden");

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
              categorySums.move.toFixed(2), //
              categorySums.food.toFixed(2),
              categorySums.device.toFixed(2)
            ],
            // ★ 차트 색상 추가
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        indexAxis: "y",
        responsive: true, // 반응형 활성화
        plugins: {
          legend: {
            display: false // 범례 숨기기 (y축 레이블로 충분)
          },
          title: {
            display: true,
            text: '카테고리별 탄소 배출량 (kg CO₂)', // ★ 차트 제목
            font: {
              size: 16
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: '배출량 (kg CO₂)' // ★ x축 제목
            }
          }
        }
      }
    });
}

function getAdvice(categorySums) {
  // 1. 카테고리별 값을 배열로 변환
  const entries = Object.entries(categorySums); // [ ['move', 50], ['food', 20], ... ]

  // 2. 배출량 값으로 내림차순 정렬
  entries.sort((a, b) => b[1] - a[1]);

  // 3. 가장 배출량이 높은 카테고리 정보
  const highestCategoryKey = entries[0][0]; // 예: "move"
  const highestValue = entries[0][1];       // 예: 50

  // 4. 총 배출량 계산
  const total = categorySums.move + categorySums.food + categorySums.device;

  // 5. 기본 조언 설정
  if (total === 0) {
    return "먼저 값을 입력하고 '계산하기' 버튼을 눌러주세요. 값이 0보다 커야 합니다.";
  }

  let advice = "";

  // 6. 가장 높은 카테고리에 따라 다른 조언 생성 (0 이상일 때만)
  if (highestValue > 0) {
    switch (highestCategoryKey) {
      case "move":
        advice = "<strong>'이동'</strong> 항목의 배출량이 가장 높습니다. 가까운 거리는 걷거나 자전거를 이용하고, 대중교통 이용을 생활화해 보세요.";
        break;
      case "food":
        advice = "<strong>'음식'</strong> 항목의 배출량이 가장 높습니다. 육류 소비를 줄이고, 지역 농산물(로컬 푸드)을 이용하거나 음식물 쓰레기를 줄이는 것이 큰 도움이 됩니다.";
        break;
      case "device":
        advice = "<strong>'전자기기 사용'</strong> 항목의 배출량이 가장 높습니다. 사용하지 않는 전자기기의 플러그를 뽑고, 에너지 효율이 높은 제품을 사용하는 것을 추천합니다.";
        break;
      default:
        advice = "계산 결과를 바탕으로 일상 속 작은 실천을 시작해 보세요.";
    }
  } else {
    advice = "배출량이 계산되었습니다. 일상 속 작은 실천을 시작해 보세요.";
  }
  
  // 7. 총 배출량에 대한 추가 조언 (기준값을 10 정도로 낮춤)
  if (total > 15) { 
    advice += "<br><br>또한, 총 배출량도 다소 높은 편입니다. 전반적인 생활 습관을 점검해보는 것도 좋겠습니다.";
  } else if (total > 0) {
    advice += "<br><br>훌륭합니다! 배출량이 비교적 낮은 수준입니다. 지금처럼 꾸준히 노력해 주세요.";
  }

  return advice;
}

function resetCalculator() {
  // 1. 모든 입력 필드 값 비우기
  document.querySelectorAll(".factor-input").forEach(input => {
    input.value = "";
  });

  // 2. 결과 영역 숨기기
  document.getElementById("results-wrapper").classList.add("hidden");

  // 3. 텍스트 결과 비우기
  document.getElementById("total-result").innerHTML = "";
  document.getElementById("advice-text").innerHTML = "";

  // 4. 차트 파괴
  if (chart) {
    chart.destroy();
    chart = null; // 차트 변수 초기화
  }

  // 5. 열려있는 카테고리 닫기
  document.querySelectorAll(".cat-children.open").forEach(cat => {
    cat.classList.remove("open");
  });
  document.querySelectorAll(".cat-btn.active").forEach(btn => {
    btn.classList.remove("active");
  });
}