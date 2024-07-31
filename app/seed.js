import mongoose from "mongoose";
import Menu from "./models/Menu"; // 실제 경로로 변경

// MongoDB 연결 설정
const MONGO_URI =
  "mongodb+srv://lshmakem:shlee91@cluster0.qpaogz0.mongodb.net/Restaurant?retryWrites=true&w=majority&appName=Cluster0"; // 실제 MongoDB URI로 변경

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

// 초기 데이터 정의
const seedData = async () => {
  try {
    // 기존 데이터 삭제 (옵션)
    await Menu.deleteMany({});

    // 초기 데이터 삽입
    const menu = new Menu({
      restaurantId: "initial_restaurant_id", // 실제 사용 시 적절한 restaurantId로 교체해야 합니다.
      categories: [
        {
          name: "메인 요리",
          items: [
            {
              name: "프라임 립 스테이크",
              description: "최상급 소고기로 만든 부드러운 스테이크",
              price: 45000,
              image: "/images/prime-rib-steak.jpg",
            },
            {
              name: "랍스터 테르미도르",
              description: "크리미한 소스의 호화로운 랍스터 요리",
              price: 55000,
              image: "/images/lobster-thermidor.jpg",
            },
            {
              name: "트러플 리조또",
              description: "향긋한 트러플 향이 가득한 크리미 리조또",
              price: 28000,
              image: "/images/truffle-risotto.jpg",
            },
            {
              name: "왕새우 파스타",
              description: "탱글탱글한 왕새우가 들어간 토마토 파스타",
              price: 22000,
              image: "/images/shrimp-pasta.jpg",
            },
            {
              name: "양갈비 스테이크",
              description: "부드럽고 풍미 가득한 양갈비 스테이크",
              price: 38000,
              image: "/images/lamb-chops.jpg",
            },
          ],
        },
        {
          name: "애피타이저",
          items: [
            {
              name: "시저 샐러드",
              description: "신선한 로메인 상추와 특제 드레싱의 클래식 샐러드",
              price: 12000,
              image: "/images/caesar-salad.jpg",
            },
            {
              name: "감자 크로켓",
              description: "바삭바삭한 감자 크로켓",
              price: 8000,
              image: "/images/potato-croquettes.jpg",
            },
            {
              name: "브루스케타",
              description: "신선한 토마토와 바질을 올린 이탈리안 전채",
              price: 10000,
              image: "/images/bruschetta.jpg",
            },
            {
              name: "카프레제 샐러드",
              description: "토마토, 모짜렐라, 바질의 신선한 조화",
              price: 13000,
              image: "/images/caprese-salad.jpg",
            },
            {
              name: "버팔로 윙",
              description: "매콤한 소스의 바삭한 치킨 윙",
              price: 15000,
              image: "/images/buffalo-wings.jpg",
            },
          ],
        },
        {
          name: "음료",
          items: [
            {
              name: "아이스 아메리카노",
              description: "깔끔하고 시원한 아이스 아메리카노",
              price: 4500,
              image: "/images/iced-americano.jpg",
            },
            {
              name: "카페 라떼",
              description: "부드러운 우유와 에스프레소의 조화",
              price: 5000,
              image: "/images/cafe-latte.jpg",
            },
            {
              name: "캐모마일 티",
              description: "은은한 향의 편안한 허브티",
              price: 5500,
              image: "/images/chamomile-tea.jpg",
            },
            {
              name: "망고 스무디",
              description: "신선한 망고로 만든 시원한 스무디",
              price: 6000,
              image: "/images/mango-smoothie.jpg",
            },
            {
              name: "스파클링 레모네이드",
              description: "상큼한 레몬의 맛을 느낄 수 있는 탄산음료",
              price: 5500,
              image: "/images/sparkling-lemonade.jpg",
            },
          ],
        },
        {
          name: "디저트",
          items: [
            {
              name: "티라미수",
              description: "부드러운 마스카포네 치즈와 에스프레소의 조화",
              price: 7000,
              image: "/images/tiramisu.jpg",
            },
            {
              name: "초코 브라우니",
              description: "진한 초콜릿 맛의 촉촉한 브라우니",
              price: 6000,
              image: "/images/chocolate-brownie.jpg",
            },
            {
              name: "크렘 브륄레",
              description: "바삭한 카라멜 크러스트의 부드러운 커스터드",
              price: 8000,
              image: "/images/creme-brulee.jpg",
            },
            {
              name: "애플 파이",
              description: "따뜻한 사과 파이와 바닐라 아이스크림",
              price: 7500,
              image: "/images/apple-pie.jpg",
            },
            {
              name: "치즈케이크",
              description: "부드럽고 크리미한 뉴욕 스타일 치즈케이크",
              price: 7000,
              image: "/images/cheesecake.jpg",
            },
          ],
        },
        {
          name: "호출",
          items: [
            {
              name: "직원 호출",
              description: "직원을 호출합니다",
              price: 0,
              image: "/images/call-staff.jpg",
            },
            {
              name: "숟가락 요청",
              description: "숟가락을 요청합니다",
              price: 0,
              image: "/images/spoon.jpg",
            },
            {
              name: "젓가락 요청",
              description: "젓가락을 요청합니다",
              price: 0,
              image: "/images/chopsticks.jpg",
            },
            {
              name: "물 요청",
              description: "물을 요청합니다",
              price: 0,
              image: "/images/water.jpg",
            },
            {
              name: "물컵 요청",
              description: "물컵을 요청합니다",
              price: 0,
              image: "/images/water-glass.jpg",
            },
          ],
        },
      ],
    });

    // 메뉴 데이터 저장
    await menu.save();
    console.log("Initial data inserted successfully.");
  } catch (error) {
    console.error("Error inserting initial data:", error);
  } finally {
    // 연결 종료
    mongoose.connection.close();
  }
};

// 실행
const run = async () => {
  await connectDB();
  await seedData();
};

run();
