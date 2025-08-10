const path = require('path');
const dotenv = require('dotenv');

// 프로젝트 루트의 .env 파일 로드
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  name: "Aussie Mate",
  slug: "aussie-mate",
  scheme: "com.aussiemate.app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.aussiematey.app",
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_IOS_API_KEY
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.aussiemate.app",
    permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY
      }
    }
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  experiments: {
    tsconfigPaths: true
  },
  plugins: ["expo-router", 
    [
      "expo-location",
      {
        "locationWhenInUsePermission": "This app uses your location to display your current position on the map and to identify nearby WHV 417/491 visa-eligible areas."
      }
    ]
  ],
  extra: {
    // 환경 변수를 앱 내에서 사용할 수 있도록 설정
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: "your-eas-project-id"
    }
  }
};
