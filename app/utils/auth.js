import jwt from "jsonwebtoken";

// JWT 시크릿 키 (실제 프로덕션에서는 환경 변수로 관리해야 합니다)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// JWT 토큰 생성
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" }); // 토큰 만료 시간 1일
};

// JWT 토큰 검증
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return null;
  }
};

// 요청 헤더에서 토큰 추출
export const extractTokenFromHeader = (req) => {
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7); // "Bearer " 이후의 문자열
  }
  return null;
};

// 인증 미들웨어 (Next.js API 라우트용)
export const authMiddleware = (handler) => {
  return async (req, res) => {
    const token = extractTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ error: "Authentication token is missing" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // 요청 객체에 사용자 정보 추가
    req.user = decoded;

    // 원래의 핸들러 함수 실행
    return handler(req, res);
  };
};

// 레스토랑 소유자 인증 확인
export const isRestaurantOwner = (restaurantId, userId) => {
  // 여기에 레스토랑 소유권 확인 로직 구현
  // 예: 데이터베이스에서 레스토랑 정보를 조회하여 소유자 ID 확인
  // 이 함수는 실제 구현 시 비동기 함수가 될 수 있습니다.
  return true; // 임시 반환값, 실제로는 확인 결과를 반환해야 합니다.
};
